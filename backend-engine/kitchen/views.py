from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import TradeProposal, Vote
from .serializers import TradeProposalSerializer
from django.contrib.auth.models import User

@api_view(['GET'])
def get_kitchen_data(request):
    # Get all proposals
    proposals = TradeProposal.objects.all()
    serializer = TradeProposalSerializer(proposals, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def cast_vote(request, proposal_id):
    # (This is your existing logic, just streamlined)
    try:
        # Hardcoding User A for testing purposes if no user_id sent
        user = User.objects.get(id=request.data.get('user_id', 1)) 
        decision = request.data['decision']
        proposal = TradeProposal.objects.get(id=proposal_id)
        
        Vote.objects.create(proposal=proposal, voter=user, decision=decision)
        
        # Quorum Check
        kitchen = proposal.kitchen
        total_members = kitchen.members.count()
        yes_votes = proposal.votes.filter(decision='YES').count()
        
        if (yes_votes / total_members) >= 0.60:
            proposal.is_executed = True
            proposal.save()
            return Response({"status": "QUORUM REACHED", "executed": True})
            
        return Response({"status": "VOTE COUNTED", "executed": False})
    except Exception as e:
        return Response({"error": str(e)})
    