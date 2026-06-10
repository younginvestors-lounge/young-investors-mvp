from django.contrib.auth.models import AbstractBaseUser
from django.db.models import QuerySet

from core.domain import DomainError

from .models import Kitchen, KitchenMembership


def active_kitchens() -> QuerySet[Kitchen]:
    return Kitchen.objects.filter(is_active=True).order_by("name")


def active_memberships(kitchen: Kitchen) -> QuerySet[KitchenMembership]:
    return kitchen.memberships.filter(status=KitchenMembership.Status.ACTIVE)


def active_member_count(kitchen: Kitchen) -> int:
    return active_memberships(kitchen).count()


def quorum_required_for(kitchen: Kitchen) -> int:
    return max(1, kitchen.quorum_required)


def user_is_active_member(user: AbstractBaseUser, kitchen: Kitchen) -> bool:
    if not getattr(user, "is_authenticated", False):
        return False

    return KitchenMembership.objects.filter(
        user=user,
        kitchen=kitchen,
        status=KitchenMembership.Status.ACTIVE,
    ).exists()


def assert_user_is_active_member(user: AbstractBaseUser, kitchen: Kitchen) -> None:
    if not user_is_active_member(user, kitchen):
        raise DomainError(
            "Active Kitchen membership is required for Kitchen governance.",
            code="kitchen_membership_required",
        )
