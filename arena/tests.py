from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from academy.models import AcademyModule, UserModuleCompletion
from academy.services import REQUIRED_MVP_MODULE_CODES
from core.domain import DomainError
from kitchen.models import Kitchen, KitchenMembership
from marketdata.models import PermittedAsset

from .models import ProposalVote, TradeProposal
from .services import cast_vote


class KitchenGovernanceTests(TestCase):
    def _authenticate(self, user) -> None:
        """Authenticate the API client with a real JWT (DRF is JWT-only — no sessions)."""
        token = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    def setUp(self) -> None:
        self.client = APIClient()
        self.kitchen = Kitchen.objects.create(
            name="UCT Alpha Kitchen",
            slug="uct-alpha",
            institution="University of Cape Town",
            quorum_required=2,
        )
        PermittedAsset.objects.get_or_create(
            exchange="JSE",
            index_code="TOP40",
            symbol="SBK",
            defaults={"name": "Standard Bank Group Ltd"},
        )

    def test_duplicate_vote_is_rejected_and_database_constrained(self) -> None:
        voter = self._cleared_member("voter-1")
        proposal = self._proposal(quorum_required=2, total_members_snapshot=3)

        cast_vote(voter, proposal, ProposalVote.VoteType.YES)

        with self.assertRaisesMessage(DomainError, "only one vote"):
            cast_vote(voter, proposal, ProposalVote.VoteType.NO)

        self.assertEqual(ProposalVote.objects.filter(proposal=proposal).count(), 1)

    def test_sixty_percent_yes_without_quorum_does_not_execute(self) -> None:
        voter = self._cleared_member("voter-1")
        proposal = self._proposal(quorum_required=2, total_members_snapshot=3)

        cast_vote(voter, proposal, ProposalVote.VoteType.YES)
        proposal.refresh_from_db()

        self.assertEqual(proposal.status, TradeProposal.Status.ACTIVE_VOTING)
        self.assertEqual(proposal.consensus_ratio, Decimal("1.0000"))

    def test_quorum_and_consensus_move_to_execution_pending(self) -> None:
        voters = [self._cleared_member(f"voter-{index}") for index in range(3)]
        proposal = self._proposal(quorum_required=3, total_members_snapshot=3)

        cast_vote(voters[0], proposal, ProposalVote.VoteType.YES)
        cast_vote(voters[1], proposal, ProposalVote.VoteType.YES)
        cast_vote(voters[2], proposal, ProposalVote.VoteType.NO)
        proposal.refresh_from_db()

        self.assertEqual(proposal.status, TradeProposal.Status.EXECUTION_PENDING)
        self.assertEqual(proposal.consensus_ratio, Decimal("0.6667"))

    def test_kitchen_recipe_list_is_scoped_to_kitchen(self) -> None:
        member = self._cleared_member("recipe-reader")
        proposal = self._proposal(quorum_required=2, total_members_snapshot=3)
        other_kitchen = Kitchen.objects.create(
            name="Wits Compound Kitchen",
            slug="wits-compound",
            institution="University of the Witwatersrand",
            quorum_required=2,
        )
        other_creator = get_user_model().objects.create_user(username="other-creator", password="test-password")
        TradeProposal.objects.create(
            kitchen=other_kitchen,
            created_by=other_creator,
            ticker="SBK",
            asset_name="Standard Bank Group Ltd",
            side=TradeProposal.Side.BUY,
            units=Decimal("1.000000"),
            paper_notional=Decimal("100.00"),
            allocation_percent=Decimal("1.00"),
            thesis="Different Kitchen recipe.",
            status=TradeProposal.Status.ACTIVE_VOTING,
            quorum_required=2,
            total_members_snapshot=2,
        )

        self._authenticate(member)
        response = self.client.get(reverse("kitchen-recipe-list", kwargs={"kitchen_id": self.kitchen.id}))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["id"], str(proposal.id))

    def test_vote_route_rejects_recipe_from_different_kitchen(self) -> None:
        voter = self._cleared_member("route-voter")
        proposal = self._proposal(quorum_required=2, total_members_snapshot=3)
        other_kitchen = Kitchen.objects.create(
            name="UP Quant Kitchen",
            slug="up-quant",
            institution="University of Pretoria",
            quorum_required=2,
        )

        self._authenticate(voter)
        response = self.client.post(
            reverse(
                "kitchen-recipe-cast-vote",
                kwargs={"kitchen_id": other_kitchen.id, "proposal_id": proposal.id},
            ),
            data={"vote_type": ProposalVote.VoteType.YES},
        )

        self.assertEqual(response.status_code, 404)

    def _cleared_member(self, username: str):
        user = get_user_model().objects.create_user(username=username, password="test-password")
        KitchenMembership.objects.create(kitchen=self.kitchen, user=user)

        for code in REQUIRED_MVP_MODULE_CODES:
            module, _created = AcademyModule.objects.get_or_create(
                code=code,
                defaults={"title": code.replace("-", " ").title(), "is_required_mvp": True},
            )
            UserModuleCompletion.objects.create(user=user, module=module, passed=True)

        return user

    def _proposal(self, quorum_required: int, total_members_snapshot: int) -> TradeProposal:
        creator = self._cleared_member(f"creator-{quorum_required}-{total_members_snapshot}")
        return TradeProposal.objects.create(
            kitchen=self.kitchen,
            created_by=creator,
            ticker="SBK",
            asset_name="Standard Bank Group Ltd",
            side=TradeProposal.Side.BUY,
            units=Decimal("12.000000"),
            paper_notional=Decimal("2850.00"),
            allocation_percent=Decimal("12.00"),
            thesis="Paper proposal for governance testing.",
            status=TradeProposal.Status.ACTIVE_VOTING,
            quorum_required=quorum_required,
            total_members_snapshot=total_members_snapshot,
        )
