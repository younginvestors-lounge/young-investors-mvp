from decimal import Decimal


class DomainError(Exception):
    """
    Base exception for Young Investors domain/business-rule failures.

    Use this for expected product-rule failures such as:
    - academy clearance required
    - duplicate vote attempt
    - invalid trade proposal
    - allocation above maximum threshold
    - asset outside permitted universe
    """

    def __init__(
        self,
        message: str,
        code: str = "DOMAIN_ERROR",
        status_code: int = 400,
    ) -> None:
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


MOCK_MVP_PAPER_TRADING_ONLY = "MOCK_MVP_PAPER_TRADING_ONLY"

CONSENSUS_THRESHOLD = Decimal("0.60")
MAX_ALLOCATION_PCT = Decimal("0.10")
STOP_LOSS_PCT = Decimal("0.05")

PERMITTED_ASSET_UNIVERSE = "JSE_TOP_40"