from core.domain import DomainError

from .models import PermittedAsset


JSE_TOP_40_EXCHANGE = "JSE"
JSE_TOP_40_INDEX_CODE = "TOP40"


def normalize_symbol(symbol: str) -> str:
    return symbol.strip().upper()


def jse_top_40_assets():
    return PermittedAsset.objects.filter(
        exchange=JSE_TOP_40_EXCHANGE,
        index_code=JSE_TOP_40_INDEX_CODE,
        is_active=True,
    ).order_by("symbol")


def is_permitted_jse_top_40_asset(symbol: str) -> bool:
    normalized = normalize_symbol(symbol)
    return jse_top_40_assets().filter(symbol=normalized).exists()


def get_permitted_jse_top_40_asset_or_raise(symbol: str) -> PermittedAsset:
    normalized = normalize_symbol(symbol)
    try:
        return jse_top_40_assets().get(symbol=normalized)
    except PermittedAsset.DoesNotExist as exc:
        raise DomainError(
            f"{normalized} is not a permitted JSE Top 40 asset.",
            code="asset_not_permitted",
        ) from exc
