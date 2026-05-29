from decimal import Decimal

from django.db.models import QuerySet

from kitchen.models import KitchenMembership

from .models import PaperHolding, PaperPortfolio


def paper_portfolios() -> QuerySet[PaperPortfolio]:
    return PaperPortfolio.objects.select_related("kitchen").order_by("kitchen__name")


def paper_portfolios_for_user(user) -> QuerySet[PaperPortfolio]:
    return (
        PaperPortfolio.objects.filter(
            kitchen__memberships__user=user,
            kitchen__memberships__status=KitchenMembership.Status.ACTIVE,
        )
        .select_related("kitchen")
        .prefetch_related("holdings")
        .distinct()
        .order_by("kitchen__name")
    )


def paper_portfolio_for_kitchen_and_user(kitchen_id, user) -> PaperPortfolio:
    return paper_portfolios_for_user(user).get(kitchen_id=kitchen_id)


def holdings_for_portfolio(portfolio: PaperPortfolio) -> QuerySet[PaperHolding]:
    return portfolio.holdings.order_by("ticker")


def recalculate_portfolio_total(portfolio: PaperPortfolio) -> PaperPortfolio:
    holdings_total = sum((holding.current_value for holding in holdings_for_portfolio(portfolio)), Decimal("0.00"))
    portfolio.total_value = portfolio.cash_balance + holdings_total
    portfolio.save(update_fields=["total_value", "updated_at"])
    return portfolio


def estimated_holdings_cost_basis(portfolio: PaperPortfolio) -> Decimal:
    return sum(
        (holding.units * holding.average_price for holding in holdings_for_portfolio(portfolio)),
        Decimal("0.00"),
    )


def estimated_roi_percent(portfolio: PaperPortfolio) -> Decimal:
    cost_basis = estimated_holdings_cost_basis(portfolio)
    if cost_basis <= Decimal("0.00"):
        return Decimal("0.00")

    holdings_value = sum(
        (holding.current_value for holding in holdings_for_portfolio(portfolio)),
        Decimal("0.00"),
    )
    return ((holdings_value - cost_basis) / cost_basis * Decimal("100")).quantize(Decimal("0.01"))


def vault_level_for(portfolio: PaperPortfolio) -> str:
    roi_percent = estimated_roi_percent(portfolio)
    if roi_percent >= Decimal("8.00"):
        return "LEVEL_03"
    if roi_percent >= Decimal("4.00"):
        return "LEVEL_02"
    return "LEVEL_01"
