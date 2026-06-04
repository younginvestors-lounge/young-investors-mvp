from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from kitchen.models import Kitchen
from vault.models import PaperHolding, PaperPortfolio


class LoungeApiTests(TestCase):
    def _authenticate(self, user) -> None:
        """Authenticate the API client with a real JWT (DRF is JWT-only — no sessions)."""
        token = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    def setUp(self) -> None:
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(username="lounge-user", password="test-password")
        top_kitchen = Kitchen.objects.create(
            name="UCT Alpha Kitchen",
            slug="uct-alpha",
            institution="University of Cape Town",
            quorum_required=2,
        )
        second_kitchen = Kitchen.objects.create(
            name="Wits Compound Kitchen",
            slug="wits-compound",
            institution="University of the Witwatersrand",
            quorum_required=2,
        )
        top_portfolio = PaperPortfolio.objects.create(
            kitchen=top_kitchen,
            cash_balance=Decimal("1000.00"),
            total_value=Decimal("3000.00"),
        )
        PaperHolding.objects.create(
            portfolio=top_portfolio,
            ticker="SBK",
            asset_name="Standard Bank Group Ltd",
            units=Decimal("10.000000"),
            average_price=Decimal("100.00"),
            current_value=Decimal("1600.00"),
            allocation_percent=Decimal("53.33"),
        )
        PaperPortfolio.objects.create(
            kitchen=second_kitchen,
            cash_balance=Decimal("800.00"),
            total_value=Decimal("1800.00"),
        )

    def test_lounge_rankings_are_aggregated_across_kitchens(self) -> None:
        self._authenticate(self.user)

        response = self.client.get(reverse("lounge-kitchen-rankings"))

        self.assertEqual(response.status_code, 200)
        rows = response.json()
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[0]["rank"], 1)
        self.assertEqual(rows[0]["kitchen_name"], "UCT Alpha Kitchen")
        self.assertTrue(rows[0]["featured"])
