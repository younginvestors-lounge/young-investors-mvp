from rest_framework import serializers

from .models import PaperHolding, PaperPortfolio
from .services import estimated_holdings_cost_basis, estimated_roi_percent, vault_level_for


class PaperHoldingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaperHolding
        fields = [
            "id",
            "ticker",
            "asset_name",
            "units",
            "average_price",
            "current_value",
            "allocation_percent",
        ]
        read_only_fields = fields


class PaperPortfolioSerializer(serializers.ModelSerializer):
    kitchen_name = serializers.CharField(source="kitchen.name", read_only=True)
    holdings = PaperHoldingSerializer(many=True, read_only=True)

    class Meta:
        model = PaperPortfolio
        fields = [
            "id",
            "kitchen",
            "kitchen_name",
            "cash_balance",
            "total_value",
            "currency",
            "execution_mode",
            "as_of",
            "holdings",
        ]
        read_only_fields = fields


class KitchenVaultSerializer(PaperPortfolioSerializer):
    holdings_count = serializers.SerializerMethodField()
    estimated_cost_basis = serializers.SerializerMethodField()
    estimated_roi_percent = serializers.SerializerMethodField()
    vault_level = serializers.SerializerMethodField()

    class Meta(PaperPortfolioSerializer.Meta):
        fields = PaperPortfolioSerializer.Meta.fields + [
            "holdings_count",
            "estimated_cost_basis",
            "estimated_roi_percent",
            "vault_level",
        ]
        read_only_fields = fields

    def get_holdings_count(self, portfolio: PaperPortfolio) -> int:
        return portfolio.holdings.count()

    def get_estimated_cost_basis(self, portfolio: PaperPortfolio) -> str:
        return str(estimated_holdings_cost_basis(portfolio))

    def get_estimated_roi_percent(self, portfolio: PaperPortfolio) -> str:
        return str(estimated_roi_percent(portfolio))

    def get_vault_level(self, portfolio: PaperPortfolio) -> str:
        return vault_level_for(portfolio)
