from rest_framework import serializers

from .models import ProposalVote, TradeProposal
from .services import calculate_consensus


class ConsensusResultSerializer(serializers.Serializer):
    yes_votes = serializers.IntegerField()
    no_votes = serializers.IntegerField()
    total_votes = serializers.IntegerField()
    total_members = serializers.IntegerField()
    quorum_required = serializers.IntegerField()
    quorum_met = serializers.BooleanField()
    consensus_ratio = serializers.CharField()
    threshold_met = serializers.BooleanField()
    approved = serializers.BooleanField()


class KitchenRecipeSerializer(serializers.ModelSerializer):
    kitchen_name = serializers.CharField(source="kitchen.name", read_only=True)
    consensus = serializers.SerializerMethodField()

    class Meta:
        model = TradeProposal
        fields = [
            "id",
            "kitchen",
            "kitchen_name",
            "created_by",
            "ticker",
            "asset_name",
            "side",
            "units",
            "limit_price",
            "paper_notional",
            "allocation_percent",
            "currency",
            "thesis",
            "risk_note",
            "status",
            "quorum_required",
            "total_members_snapshot",
            "consensus_ratio",
            "expires_at",
            "mock_executed_at",
            "created_at",
            "consensus",
        ]
        read_only_fields = fields

    def get_consensus(self, proposal: TradeProposal) -> dict[str, object]:
        return ConsensusResultSerializer(calculate_consensus(proposal).as_dict()).data


class KitchenRecipeVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposalVote
        fields = ["id", "proposal", "voter", "vote_type", "created_at"]
        read_only_fields = fields


class CastKitchenRecipeVoteSerializer(serializers.Serializer):
    vote_type = serializers.ChoiceField(choices=ProposalVote.VoteType.choices)


# Backwards-compatible aliases while the physical Django app/model names remain
# migration-safe. Public API language should prefer KitchenRecipe* names.
TradeProposalSerializer = KitchenRecipeSerializer
ProposalVoteSerializer = KitchenRecipeVoteSerializer
CastVoteSerializer = CastKitchenRecipeVoteSerializer
