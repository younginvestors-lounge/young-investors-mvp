import logging
from dataclasses import dataclass
from decimal import Decimal

from django.contrib.auth.models import AbstractBaseUser
from django.db import IntegrityError, transaction
from django.utils import timezone

from academy.services import assert_user_has_required_clearance, user_has_required_clearance
from core.domain import DomainError
from kitchen.services import assert_user_is_active_member
from marketdata.services import get_permitted_jse_top_40_asset_or_raise

from .models import ProposalVote, TradeProposal


logger = logging.getLogger(__name__)

CONSENSUS_THRESHOLD = Decimal("0.60")
CONSENSUS_SCALE = Decimal("0.0001")
MIN_ALLOCATION_PERCENT = Decimal("0.01")
MAX_ALLOCATION_PERCENT = Decimal("100.00")


@dataclass(frozen=True)
class ConsensusResult:
    yes_votes: int
    no_votes: int
    total_votes: int
    total_members: int
    quorum_required: int
    quorum_met: bool
    consensus_ratio: Decimal
    threshold_met: bool
    approved: bool

    def as_dict(self) -> dict[str, object]:
        return {
            "yes_votes": self.yes_votes,
            "no_votes": self.no_votes,
            "total_votes": self.total_votes,
            "total_members": self.total_members,
            "quorum_required": self.quorum_required,
            "quorum_met": self.quorum_met,
            "consensus_ratio": str(self.consensus_ratio),
            "threshold_met": self.threshold_met,
            "approved": self.approved,
        }


def calculate_consensus(proposal: TradeProposal) -> ConsensusResult:
    yes_votes = proposal.votes.filter(vote_type=ProposalVote.VoteType.YES).count()
    no_votes = proposal.votes.filter(vote_type=ProposalVote.VoteType.NO).count()
    total_votes = yes_votes + no_votes
    quorum_required = max(1, proposal.quorum_required)
    total_members = max(proposal.total_members_snapshot, total_votes)
    consensus_ratio = Decimal("0.0000")

    if total_members:
        consensus_ratio = (Decimal(yes_votes) / Decimal(total_members)).quantize(CONSENSUS_SCALE)

    # MVP governance doctrine: the 60% Rule is the executable threshold. Quorum is
    # kept as metadata for older clients/admin views, but it must not block a
    # Kitchen recipe that has crossed 60% of decisive votes.
    quorum_met = total_votes >= quorum_required
    threshold_met = consensus_ratio >= CONSENSUS_THRESHOLD

    return ConsensusResult(
        yes_votes=yes_votes,
        no_votes=no_votes,
        total_votes=total_votes,
        total_members=total_members,
        quorum_required=quorum_required,
        quorum_met=quorum_met,
        consensus_ratio=consensus_ratio,
        threshold_met=threshold_met,
        approved=threshold_met,
    )


def user_has_kitchen_clearance(user: AbstractBaseUser) -> bool:
    return user_has_required_clearance(user)


user_has_arena_clearance = user_has_kitchen_clearance


def cast_vote(user: AbstractBaseUser, proposal: TradeProposal, vote_type: str) -> ProposalVote:
    if vote_type not in ProposalVote.VoteType.values:
        raise DomainError("Vote must be YES or NO.", code="invalid_vote_type")

    with transaction.atomic():
        locked_proposal = (
            TradeProposal.objects.select_for_update()
            .select_related("kitchen")
            .get(pk=proposal.pk)
        )

        if locked_proposal.status != TradeProposal.Status.ACTIVE_VOTING:
            raise DomainError(
                "Taste votes can only be cast while a Kitchen recipe is open.",
                code="proposal_not_open_for_voting",
            )

        if locked_proposal.expires_at and locked_proposal.expires_at <= timezone.now():
            locked_proposal.status = TradeProposal.Status.EXPIRED
            locked_proposal.save(update_fields=["status", "updated_at"])
            raise DomainError("Kitchen recipe voting has expired.", code="proposal_expired")

        assert_user_has_required_clearance(user)
        assert_user_is_active_member(user, locked_proposal.kitchen)

        try:
            vote = ProposalVote.objects.create(
                proposal=locked_proposal,
                voter=user,
                vote_type=vote_type,
            )
        except IntegrityError as exc:
            raise DomainError(
                "A Kitchen member may cast only one vote per recipe.",
                code="duplicate_vote",
            ) from exc

        _evaluate_locked_proposal(locked_proposal)
        return vote


def evaluate_proposal_state(proposal: TradeProposal) -> ConsensusResult:
    with transaction.atomic():
        locked_proposal = (
            TradeProposal.objects.select_for_update()
            .select_related("kitchen")
            .get(pk=proposal.pk)
        )
        return _evaluate_locked_proposal(locked_proposal)


def assert_asset_permitted(ticker: str):
    return get_permitted_jse_top_40_asset_or_raise(ticker)


def assert_allocation_allowed(proposal: TradeProposal) -> None:
    if proposal.paper_notional <= Decimal("0.00"):
        raise DomainError(
            "Paper notional must be greater than zero.",
            code="paper_notional_not_positive",
        )

    if proposal.units <= Decimal("0.000000"):
        raise DomainError("Proposal units must be greater than zero.", code="units_not_positive")

    if not MIN_ALLOCATION_PERCENT <= proposal.allocation_percent <= MAX_ALLOCATION_PERCENT:
        raise DomainError(
            "Allocation percent must be between 0.01 and 100.00.",
            code="allocation_out_of_bounds",
        )


def log_bimodal_behavior(proposal: TradeProposal) -> bool:
    consensus = calculate_consensus(proposal)
    if consensus.total_votes < 2:
        return False

    minority_ratio = Decimal(min(consensus.yes_votes, consensus.no_votes)) / Decimal(consensus.total_votes)
    is_bimodal = minority_ratio >= Decimal("0.35")

    if is_bimodal:
        logger.info(
            "Bimodal Kitchen recipe vote distribution detected.",
            extra={
                "proposal_id": str(proposal.id),
                "kitchen_id": str(proposal.kitchen_id),
                "yes_votes": consensus.yes_votes,
                "no_votes": consensus.no_votes,
            },
        )

    return is_bimodal


def _evaluate_locked_proposal(proposal: TradeProposal) -> ConsensusResult:
    consensus = calculate_consensus(proposal)
    proposal.consensus_ratio = consensus.consensus_ratio
    update_fields = ["consensus_ratio", "updated_at"]

    if proposal.status == TradeProposal.Status.ACTIVE_VOTING:
        if proposal.expires_at and proposal.expires_at <= timezone.now():
            proposal.status = TradeProposal.Status.EXPIRED
            update_fields.append("status")
        elif consensus.approved:
            try:
                assert_asset_permitted(proposal.ticker)
                assert_allocation_allowed(proposal)
                log_bimodal_behavior(proposal)
            except DomainError:
                proposal.status = TradeProposal.Status.FAILED_RISK_CHECK
            else:
                proposal.status = TradeProposal.Status.EXECUTION_PENDING
            update_fields.append("status")
        elif consensus.total_votes >= consensus.total_members and not consensus.threshold_met:
            log_bimodal_behavior(proposal)
            proposal.status = TradeProposal.Status.REJECTED_BY_SYNDICATE
            update_fields.append("status")

    proposal.save(update_fields=update_fields)
    return consensus
