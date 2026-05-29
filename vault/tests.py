from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from kitchen.models import Kitchen, KitchenMembership

from .models import PaperHolding, PaperPortfolio


class KitchenVaultApiTests(TestCase):
    def setUp(self) -> None:
        self.user = get_user_model().objects.create_user(username="vault-user", password="test-password")
        self.other_user = get_user_model().objects.create_user(username="other-vault-user", password="test-password")
        self.kitchen = Kitchen.objects.create(name="UCT Alpha Kitchen", slug="uct-alpha", quorum_required=2)
        self.other_kitchen = Kitchen.objects.create(name="Wits Compound Kitchen", slug="wits-compound", quorum_required=2)
        KitchenMembership.objects.create(kitchen=self.kitchen, user=self.user)
        KitchenMembership.objects.create(kitchen=self.other_kitchen, user=self.other_user)

        self.portfolio = PaperPortfolio.objects.create(
            kitchen=self.kitchen,
            cash_balance=Decimal("1000.00"),
            total_value=Decimal("2500.00"),
        )
        PaperHolding.objects.create(
            portfolio=self.portfolio,
            ticker="SBK",
            asset_name="Standard Bank Group Ltd",
            units=Decimal("10.000000"),
            average_price=Decimal("100.00"),
            current_value=Decimal("1500.00"),
            allocation_percent=Decimal("60.00"),
        )
        self.other_portfolio = PaperPortfolio.objects.create(
            kitchen=self.other_kitchen,
            cash_balance=Decimal("500.00"),
            total_value=Decimal("1400.00"),
        )

    def test_kitchen_vault_detail_is_scoped_to_active_member(self) -> None:
        self.client.force_login(self.user)

        response = self.client.get(reverse("kitchen-vault-detail", kwargs={"kitchen_id": self.kitchen.id}))
        blocked = self.client.get(reverse("kitchen-vault-detail", kwargs={"kitchen_id": self.other_kitchen.id}))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["kitchen"], str(self.kitchen.id))
        self.assertEqual(response.json()["holdings_count"], 1)
        self.assertEqual(response.json()["estimated_roi_percent"], "50.00")
        self.assertEqual(blocked.status_code, 404)

    def test_legacy_paper_portfolio_list_only_returns_my_kitchens(self) -> None:
        self.client.force_login(self.user)

        response = self.client.get(reverse("paper-portfolio-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["kitchen"], str(self.kitchen.id))
