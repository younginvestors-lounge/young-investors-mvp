import uuid

from django.conf import settings
from django.db import models


class TradeProposal(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        ACTIVE_VOTING = "ACTIVE_VOTING", "Active voting"
        REJECTED_BY_SYNDICATE = "REJECTED_BY_SYNDICATE", "Rejected by syndicate"
        EXECUTION_PENDING = "EXECUTION_PENDING", "Execution pending"
        MOCK_EXECUTED = "MOCK_EXECUTED", "Mock executed"
        FAILED_RISK_CHECK = "FAILED_RISK_CHECK", "Failed risk check"
        EXPIRED = "EXPIRED", "Expired"

    class Side(models.TextChoices):
        BUY = "BUY", "Buy"
        SELL = "SELL", "Sell"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kitchen = models.ForeignKey(
        "kitchen.Kitchen",
        on_delete=models.PROTECT,
        related_name="trade_proposals",
        db_index=False,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_trade_proposals",
    )
    ticker = models.CharField(max_length=32)
    asset_name = models.CharField(max_length=160, blank=True)
    side = models.CharField(max_length=8, choices=Side.choices)
    units = models.DecimalField(max_digits=18, decimal_places=6)
    limit_price = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    paper_notional = models.DecimalField(max_digits=18, decimal_places=2)
    allocation_percent = models.DecimalField(max_digits=5, decimal_places=2)
    currency = models.CharField(max_length=3, default="ZAR")
    thesis = models.TextField()
    risk_note = models.TextField(blank=True)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.DRAFT)
    quorum_required = models.PositiveIntegerField(default=1)
    total_members_snapshot = models.PositiveIntegerField(default=1)
    consensus_ratio = models.DecimalField(max_digits=5, decimal_places=4, default=0)
    expires_at = models.DateTimeField(null=True, blank=True)
    mock_executed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["status"], name="arena_prop_status_idx"),
            models.Index(fields=["kitchen"], name="arena_prop_kitchen_idx"),
            models.Index(fields=["ticker"], name="arena_prop_ticker_idx"),
            models.Index(fields=["created_at"], name="arena_prop_created_idx"),
            models.Index(fields=["expires_at"], name="arena_prop_expires_idx"),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.ticker}:{self.status}"


class ProposalVote(models.Model):
    class VoteType(models.TextChoices):
        YES = "YES", "Yes"
        NO = "NO", "No"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    proposal = models.ForeignKey(TradeProposal, on_delete=models.CASCADE, related_name="votes")
    voter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="proposal_votes")
    vote_type = models.CharField(max_length=3, choices=VoteType.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["proposal", "voter"], name="unique_vote_per_proposal_voter"),
        ]
        indexes = [
            models.Index(fields=["proposal", "vote_type"], name="arena_vote_tally_idx"),
            models.Index(fields=["voter", "created_at"], name="arena_vote_user_created_idx"),
        ]
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"{self.proposal_id}:{self.voter_id}:{self.vote_type}"
