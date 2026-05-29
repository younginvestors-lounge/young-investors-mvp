import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class AcademyModule(models.Model):
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    code = models.SlugField(max_length=64, unique=True)
    title = models.CharField(max_length=160)
    is_required_mvp = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["code"], name="academy_module_code_idx"),
            models.Index(fields=["is_required_mvp"], name="academy_module_req_idx"),
        ]
        ordering = ["title"]

    def __str__(self) -> str:
        return self.title


class UserModuleCompletion(models.Model):
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="module_completions")
    module = models.ForeignKey(AcademyModule, on_delete=models.CASCADE, related_name="user_completions")
    passed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "module"], name="unique_user_module_completion"),
        ]
        indexes = [
            models.Index(fields=["user", "passed"], name="acad_mod_pass_idx"),
            models.Index(fields=["module", "passed"], name="acad_user_pass_idx"),
        ]
        ordering = ["-completed_at"]

    def __str__(self) -> str:
        return f"{self.user_id}:{self.module.code}:{self.passed}"
