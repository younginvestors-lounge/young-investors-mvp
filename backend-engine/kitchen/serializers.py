from rest_framework import serializers
from .models import Kitchen, TradeProposal, Vote

class VoteSerializer(serializers.ModelSerializer):
    voter_name = serializers.ReadOnlyField(source='voter.username')
    
    class Meta:
        model = Vote
        fields = ['id', 'voter_name', 'decision', 'timestamp']

class TradeProposalSerializer(serializers.ModelSerializer):
    votes = VoteSerializer(many=True, read_only=True)
    approval_rate = serializers.SerializerMethodField()

    class Meta:
        model = TradeProposal
        fields = ['id', 'ticker', 'action', 'quantity', 'price', 'is_executed', 'approval_rate', 'votes']

    def get_approval_rate(self, obj):
        total = obj.kitchen.members.count()
        if total == 0: return 0
        yes_votes = obj.votes.filter(decision='YES').count()
        return round((yes_votes / total) * 100, 1)
    