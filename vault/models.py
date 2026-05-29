import uuid

from django.db import models
from django.utils import timezone

from core.domain import MOCK_MVP_PAPER_TRADING_ONLY


class PaperPortfolio(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kitchen = models.OneToOneField("kitchen.Kitchen", on_delete=models.CASCADE, related_name="paper_portfolio")
    cash_balance = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    total_value = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="ZAR")
    execution_mode = models.CharField(max_length=40, default=MOCK_MVP_PAPER_TRADING_ONLY)
    as_of = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["kitchen"], name="vault_portfolio_kitchen_idx"),
            models.Index(fields=["as_of"], name="vault_portfolio_asof_idx"),
        ]
        ordering = ["kitchen__name"]

    def __str__(self) -> str:
        return f"{self.kitchen_id}:{self.total_value} {self.currency}"


class PaperHolding(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    portfolio = models.ForeignKey(PaperPortfolio, on_delete=models.CASCADE, related_name="holdings")
    ticker = models.CharField(max_length=32)
    asset_name = models.CharField(max_length=160)
    units = models.DecimalField(max_digits=18, decimal_places=6, default=0)
    average_price = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    current_value = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    allocation_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["portfolio", "ticker"], name="unique_paper_holding_symbol"),
        ]
        indexes = [
            models.Index(fields=["portfolio", "ticker"], name="vault_holding_ticker_idx"),
            models.Index(fields=["ticker"], name="vault_ticker_idx"),
        ]
        ordering = ["ticker"]

    def __str__(self) -> str:
        return f"{self.portfolio_id}:{self.ticker}"
