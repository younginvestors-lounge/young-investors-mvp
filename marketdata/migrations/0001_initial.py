# Generated for Young Investors MVP.
from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="PermittedAsset",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("public_id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, unique=True)),
                ("symbol", models.CharField(max_length=32)),
                ("name", models.CharField(max_length=160)),
                ("exchange", models.CharField(default="JSE", max_length=16)),
                ("index_code", models.CharField(default="TOP40", max_length=32)),
                ("currency", models.CharField(default="ZAR", max_length=3)),
                ("is_active", models.BooleanField(default=True)),
                ("last_verified_at", models.DateTimeField(blank=True, null=True)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["symbol"],
                "indexes": [
                    models.Index(fields=["exchange", "index_code", "is_active"], name="asset_index_active_idx"),
                    models.Index(fields=["symbol"], name="asset_symbol_idx"),
                ],
                "constraints": [
                    models.UniqueConstraint(fields=("exchange", "index_code", "symbol"), name="unique_permitted_index_asset"),
                ],
            },
        ),
    ]
