# Generated for Young Investors MVP.
import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone

from core.domain import MOCK_MVP_PAPER_TRADING_ONLY


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Kitchen",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=160)),
                ("slug", models.SlugField(max_length=96, unique=True)),
                ("institution", models.CharField(blank=True, max_length=160)),
                ("execution_mode", models.CharField(default=MOCK_MVP_PAPER_TRADING_ONLY, max_length=40)),
                ("quorum_required", models.PositiveIntegerField(default=1)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["name"],
                "indexes": [
                    models.Index(fields=["slug"], name="kitchen_slug_idx"),
                    models.Index(fields=["is_active"], name="kitchen_active_idx"),
                    models.Index(fields=["institution"], name="kitchen_institution_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="KitchenMembership",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("role", models.CharField(choices=[("MEMBER", "Member"), ("LEAD", "Lead")], default="MEMBER", max_length=16)),
                (
                    "status",
                    models.CharField(
                        choices=[("ACTIVE", "Active"), ("PAUSED", "Paused"), ("REMOVED", "Removed")],
                        default="ACTIVE",
                        max_length=16,
                    ),
                ),
                ("joined_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "kitchen",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="memberships",
                        to="kitchen.kitchen",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="kitchen_memberships",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["kitchen__name", "joined_at"],
                "indexes": [
                    models.Index(fields=["kitchen", "status"], name="kitchen_member_status_idx"),
                    models.Index(fields=["user", "status"], name="kitchen_user_status_idx"),
                ],
                "constraints": [
                    models.UniqueConstraint(fields=("kitchen", "user"), name="unique_kitchen_member"),
                ],
            },
        ),
    ]
