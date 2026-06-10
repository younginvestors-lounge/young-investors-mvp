import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone

from core.domain import MOCK_MVP_PAPER_TRADING_ONLY

from decimal import Decimal

MOCK_MVP_PAPER_TRADING_ONLY = "MOCK_MVP_PAPER_TRADING_ONLY"

CONSENSUS_THRESHOLD = Decimal("0.60")
MAX_ALLOCATION_PCT = Decimal("0.10")
STOP_LOSS_PCT = Decimal("0.05")

PERMITTED_ASSET_UNIVERSE = "JSE_TOP_40"

class Kitchen(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=96, unique=True)
    institution = models.CharField(max_length=160, blank=True)
    execution_mode = models.CharField(max_length=40, default=MOCK_MVP_PAPER_TRADING_ONLY)
    quorum_required = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["slug"], name="kitchen_slug_idx"),
            models.Index(fields=["is_active"], name="kitchen_active_idx"),
            models.Index(fields=["institution"], name="kitchen_institution_idx"),
        ]
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class KitchenMembership(models.Model):
    class Role(models.TextChoices):
        MEMBER = "MEMBER", "Member"
        LEAD = "LEAD", "Lead"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        PAUSED = "PAUSED", "Paused"
        REMOVED = "REMOVED", "Removed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kitchen = models.ForeignKey(Kitchen, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="kitchen_memberships")
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.MEMBER)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    joined_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["kitchen", "user"], name="unique_kitchen_member"),
        ]
        indexes = [
            models.Index(fields=["kitchen", "status"], name="kitchen_member_status_idx"),
            models.Index(fields=["user", "status"], name="kitchen_user_status_idx"),
        ]
        ordering = ["kitchen__name", "joined_at"]

    def __str__(self) -> str:
        return f"{self.kitchen_id}:{self.user_id}:{self.status}"
    
