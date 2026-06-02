import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class ChefUser(AbstractUser):
    """Extended User model with Young Investors metadata."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chef_alias = models.CharField(max_length=128, blank=True, help_text="Kitchen alias, public-facing")
    age = models.PositiveIntegerField(null=True, blank=True)
    intent = models.CharField(
        max_length=64,
        blank=True,
        choices=[
            ("learn_craft", "Learn the craft"),
            ("build_portfolio", "Build my portfolio"),
            ("start_kitchen", "Start a Kitchen"),
        ],
    )
    email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    is_training_mode = models.BooleanField(default=True, help_text="Training Kitchen until age 18")
    academy_score = models.PositiveIntegerField(default=0)
    kitchen_score = models.PositiveIntegerField(default=0)
    personal_prediction_score = models.PositiveIntegerField(default=0)
    profile_picture = models.ImageField(upload_to="profile_pictures/", null=True, blank=True, help_text="User selfie or profile photo")
    profile_icon = models.CharField(
        max_length=32,
        blank=True,
        default="chef-default",
        help_text="Avatar icon key (chef, spoon, pot, flame, dollar, growth, shield, etc.)",
        choices=[
            ("chef-default", "Chef's Hat"),
            ("spoon", "Spoon"),
            ("pot", "Pot"),
            ("flame", "Flame"),
            ("dollar", "Dollar Sign"),
            ("growth", "Growth Arrow"),
            ("shield", "Shield"),
            ("balance", "Balance Scale"),
            ("star", "Star"),
            ("chart", "Chart"),
        ],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["email"], name="chef_email_idx"),
            models.Index(fields=["chef_alias"], name="chef_alias_idx"),
            models.Index(fields=["email_verified"], name="chef_verified_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.chef_alias or self.username}"

    def mark_email_verified(self):
        self.email_verified = True
        self.email_verified_at = timezone.now()
        self.save()


class EmailVerificationToken(models.Model):
    """One-time email verification tokens."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(ChefUser, on_delete=models.CASCADE, related_name="verification_token")
    token = models.CharField(max_length=255, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["token"], name="verify_token_idx"),
            models.Index(fields=["expires_at"], name="verify_token_exp_idx"),
        ]

    def is_expired(self) -> bool:
        return timezone.now() > self.expires_at or self.is_used

    def __str__(self) -> str:
        return f"Verification for {self.user_id}"


class PasswordResetToken(models.Model):
    """One-time password reset tokens."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(ChefUser, on_delete=models.CASCADE, related_name="password_reset_tokens")
    token = models.CharField(max_length=255, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["token"], name="reset_token_idx"),
            models.Index(fields=["expires_at"], name="reset_token_exp_idx"),
        ]
        ordering = ["-created_at"]

    def is_expired(self) -> bool:
        return timezone.now() > self.expires_at or self.is_used

    def __str__(self) -> str:
        return f"Reset for {self.user_id}"
