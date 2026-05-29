from dataclasses import dataclass

from django.contrib.auth import get_user_model
from django.db.models import QuerySet

from core.domain import DomainError

from .models import AcademyModule, UserModuleCompletion


REQUIRED_MVP_MODULE_CODES = ("financial-markets", "risk-management")


@dataclass(frozen=True)
class ClearanceResult:
    cleared: bool
    required_modules: tuple[str, ...]
    passed_modules: tuple[str, ...]
    missing_modules: tuple[str, ...]

    def as_dict(self) -> dict[str, object]:
        return {
            "cleared": self.cleared,
            "required_modules": list(self.required_modules),
            "passed_modules": list(self.passed_modules),
            "missing_modules": list(self.missing_modules),
        }


def required_mvp_modules() -> QuerySet[AcademyModule]:
    return AcademyModule.objects.filter(code__in=REQUIRED_MVP_MODULE_CODES, is_required_mvp=True)


def get_user_clearance(user: get_user_model()) -> ClearanceResult:
    passed_codes = set(
        UserModuleCompletion.objects.filter(
            user=user,
            passed=True,
            module__code__in=REQUIRED_MVP_MODULE_CODES,
        ).values_list("module__code", flat=True)
    )
    missing = tuple(code for code in REQUIRED_MVP_MODULE_CODES if code not in passed_codes)
    return ClearanceResult(
        cleared=not missing,
        required_modules=REQUIRED_MVP_MODULE_CODES,
        passed_modules=tuple(sorted(passed_codes)),
        missing_modules=missing,
    )


def user_has_required_clearance(user: get_user_model()) -> bool:
    return get_user_clearance(user).cleared


def assert_user_has_required_clearance(user: get_user_model()) -> None:
    clearance = get_user_clearance(user)
    if not clearance.cleared:
        missing = ", ".join(clearance.missing_modules)
        raise DomainError(
            f"Academy clearance required before proposing trades or voting. Missing: {missing}.",
            code="academy_clearance_required",
        )
