# Generated for Young Investors MVP.
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="AcademyModule",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("public_id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, unique=True)),
                ("code", models.SlugField(max_length=64, unique=True)),
                ("title", models.CharField(max_length=160)),
                ("is_required_mvp", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["title"],
                "indexes": [
                    models.Index(fields=["code"], name="academy_module_code_idx"),
                    models.Index(fields=["is_required_mvp"], name="academy_module_req_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="UserModuleCompletion",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("public_id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, unique=True)),
                ("passed", models.BooleanField(default=False)),
                ("completed_at", models.DateTimeField(default=django.utils.timezone.now)),
                (
                    "module",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="user_completions",
                        to="academy.academymodule",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="module_completions",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-completed_at"],
                "indexes": [
                    models.Index(fields=["user", "passed"], name="academy_completion_user_pass_idx"),
                    models.Index(fields=["module", "passed"], name="academy_completion_module_pass_idx"),
                ],
                "constraints": [
                    models.UniqueConstraint(fields=("user", "module"), name="unique_user_module_completion"),
                ],
            },
        ),
    ]
