import uuid

from django.db import models


class PermittedAsset(models.Model):
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    symbol = models.CharField(max_length=32)
    name = models.CharField(max_length=160)
    exchange = models.CharField(max_length=16, default="JSE")
    index_code = models.CharField(max_length=32, default="TOP40")
    currency = models.CharField(max_length=3, default="ZAR")
    is_active = models.BooleanField(default=True)
    last_verified_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["exchange", "index_code", "symbol"], name="unique_permitted_index_asset"),
        ]
        indexes = [
            models.Index(fields=["exchange", "index_code", "is_active"], name="asset_index_active_idx"),
            models.Index(fields=["symbol"], name="asset_symbol_idx"),
        ]
        ordering = ["symbol"]

    def __str__(self) -> str:
        return f"{self.exchange}:{self.symbol}"
