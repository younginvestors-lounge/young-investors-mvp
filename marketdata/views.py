from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from .serializers import PermittedAssetSerializer
from .services import jse_top_40_assets


class JseTop40AssetListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PermittedAssetSerializer

    def get_queryset(self):
        return jse_top_40_assets()
