from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID

from vault.models import PaperPortfolio
from vault.services import estimated_roi_percent


@dataclass(frozen=True)
class LoungeKitchenRanking:
    rank: int
    kitchen_id: UUID
    kitchen_name: str
    institution: str
    total_value: Decimal
    currency: str
    execution_mode: str
    holdings_count: int
    estimated_roi_percent: Decimal
    featured: bool


def lounge_kitchen_rankings() -> list[LoungeKitchenRanking]:
    portfolios = (
        PaperPortfolio.objects.select_related("kitchen")
        .prefetch_related("holdings")
        .order_by("-total_value", "kitchen__name")
    )

    rankings: list[LoungeKitchenRanking] = []
    for rank, portfolio in enumerate(portfolios, start=1):
        rankings.append(
            LoungeKitchenRanking(
                rank=rank,
                kitchen_id=portfolio.kitchen_id,
                kitchen_name=portfolio.kitchen.name,
                institution=portfolio.kitchen.institution,
                total_value=portfolio.total_value,
                currency=portfolio.currency,
                execution_mode=portfolio.execution_mode,
                holdings_count=portfolio.holdings.count(),
                estimated_roi_percent=estimated_roi_percent(portfolio),
                featured=rank <= 3,
            )
        )

    return rankings
