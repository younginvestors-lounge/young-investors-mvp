# Generated for Young Investors MVP.
import uuid

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone

from core.domain import MOCK_MVP_PAPER_TRADING_ONLY


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("kitchen", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="PaperPortfolio",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("cash_balance", models.DecimalField(decimal_places=2, default=0, max_digits=18)),
                ("total_value", models.DecimalField(decimal_places=2, default=0, max_digits=18)),
                ("currency", models.CharField(default="ZAR", max_length=3)),
                ("execution_mode", models.CharField(default=MOCK_MVP_PAPER_TRADING_ONLY, max_length=40)),
                ("as_of", models.DateTimeField(default=django.utils.timezone.now)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "kitchen",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="paper_portfolio",
                        to="kitchen.kitchen",
                    ),
                ),
            ],
            options={
                "ordering": ["kitchen__name"],
                "indexes": [
                    models.Index(fields=["kitchen"], name="vault_portfolio_kitchen_idx"),
                    models.Index(fields=["as_of"], name="vault_portfolio_asof_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="PaperHolding",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("ticker", models.CharField(max_length=32)),
                ("asset_name", models.CharField(max_length=160)),
                ("units", models.DecimalField(decimal_places=6, default=0, max_digits=18)),
                ("average_price", models.DecimalField(decimal_places=2, default=0, max_digits=18)),
                ("current_value", models.DecimalField(decimal_places=2, default=0, max_digits=18)),
                ("allocation_percent", models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "portfolio",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="holdings",
                        to="vault.paperportfolio",
                    ),
                ),
            ],
            options={
                "ordering": ["ticker"],
                "indexes": [
                    models.Index(fields=["portfolio", "ticker"], name="vault_holding_ticker_idx"),
                    models.Index(fields=["ticker"], name="vault_ticker_idx"),
                ],
                "constraints": [
                    models.UniqueConstraint(fields=("portfolio", "ticker"), name="unique_paper_holding_symbol"),
                ],
            },
        ),
    ]
