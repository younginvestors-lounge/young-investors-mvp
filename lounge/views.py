from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoungeKitchenRankingSerializer
from .services import lounge_kitchen_rankings


class LoungeKitchenRankingListView(APIView):
    def get(self, request):
        serializer = LoungeKitchenRankingSerializer(lounge_kitchen_rankings(), many=True)
        return Response(serializer.data)
