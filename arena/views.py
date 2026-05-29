from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView

from core.domain import DomainError
from kitchen.models import Kitchen

from .models import TradeProposal
from .serializers import (
    CastKitchenRecipeVoteSerializer,
    KitchenRecipeSerializer,
    KitchenRecipeVoteSerializer,
)
from .services import cast_vote


class KitchenRecipeListView(ListAPIView):
    serializer_class = KitchenRecipeSerializer

    def get_queryset(self):
        kitchen_id = self.kwargs["kitchen_id"]
        return (
            TradeProposal.objects.filter(kitchen_id=kitchen_id)
            .select_related("kitchen", "created_by")
            .order_by("-created_at")
        )


class CastKitchenRecipeVoteView(APIView):
    def post(self, request, kitchen_id, proposal_id):
        get_object_or_404(Kitchen, pk=kitchen_id, is_active=True)
        proposal = get_object_or_404(TradeProposal, pk=proposal_id, kitchen_id=kitchen_id)
        serializer = CastKitchenRecipeVoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            vote = cast_vote(request.user, proposal, serializer.validated_data["vote_type"])
        except DomainError as exc:
            return Response({"detail": exc.message, "code": exc.code}, status=status.HTTP_400_BAD_REQUEST)

        return Response(KitchenRecipeVoteSerializer(vote).data, status=status.HTTP_201_CREATED)


# Backwards-compatible class aliases for internal imports while the physical app
# and model names remain migration-safe.
TradeProposalListView = KitchenRecipeListView
CastProposalVoteView = CastKitchenRecipeVoteView
