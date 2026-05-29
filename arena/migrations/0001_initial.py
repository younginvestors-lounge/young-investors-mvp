# Generated for Young Investors MVP.
import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("kitchen", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="TradeProposal",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("ticker", models.CharField(max_length=32)),
                ("asset_name", models.CharField(blank=True, max_length=160)),
                ("side", models.CharField(choices=[("BUY", "Buy"), ("SELL", "Sell")], max_length=8)),
                ("units", models.DecimalField(decimal_places=6, max_digits=18)),
                ("limit_price", models.DecimalField(blank=True, decimal_places=2, max_digits=18, null=True)),
                ("paper_notional", models.DecimalField(decimal_places=2, max_digits=18)),
                ("allocation_percent", models.DecimalField(decimal_places=2, max_digits=5)),
                ("currency", models.CharField(default="ZAR", max_length=3)),
                ("thesis", models.TextField()),
                ("risk_note", models.TextField(blank=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("DRAFT", "Draft"),
                            ("ACTIVE_VOTING", "Active voting"),
                            ("REJECTED_BY_SYNDICATE", "Rejected by syndicate"),
                            ("EXECUTION_PENDING", "Execution pending"),
                            ("MOCK_EXECUTED", "Mock executed"),
                            ("FAILED_RISK_CHECK", "Failed risk check"),
                            ("EXPIRED", "Expired"),
                        ],
                        default="DRAFT",
                        max_length=32,
                    ),
                ),
                ("quorum_required", models.PositiveIntegerField(default=1)),
                ("total_members_snapshot", models.PositiveIntegerField(default=1)),
                ("consensus_ratio", models.DecimalField(decimal_places=4, default=0, max_digits=5)),
                ("expires_at", models.DateTimeField(blank=True, null=True)),
                ("mock_executed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="created_trade_proposals",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "kitchen",
                    models.ForeignKey(
                        db_index=False,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="trade_proposals",
                        to="kitchen.kitchen",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(fields=["status"], name="arena_prop_status_idx"),
                    models.Index(fields=["kitchen"], name="arena_prop_kitchen_idx"),
                    models.Index(fields=["ticker"], name="arena_prop_ticker_idx"),
                    models.Index(fields=["created_at"], name="arena_prop_created_idx"),
                    models.Index(fields=["expires_at"], name="arena_prop_expires_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="ProposalVote",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("vote_type", models.CharField(choices=[("YES", "Yes"), ("NO", "No")], max_length=3)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "proposal",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="votes",
                        to="arena.tradeproposal",
                    ),
                ),
                (
                    "voter",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="proposal_votes",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["created_at"],
                "indexes": [
                    models.Index(fields=["proposal", "vote_type"], name="arena_vote_tally_idx"),
                    models.Index(fields=["voter", "created_at"], name="arena_vote_user_created_idx"),
                ],
                "constraints": [
                    models.UniqueConstraint(fields=("proposal", "voter"), name="unique_vote_per_proposal_voter"),
                ],
            },
        ),
    ]
