from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView, RetrieveAPIView

from .serializers import KitchenVaultSerializer, PaperPortfolioSerializer
from .services import paper_portfolios_for_user


class PaperPortfolioListView(ListAPIView):
    serializer_class = PaperPortfolioSerializer

    def get_queryset(self):
        return paper_portfolios_for_user(self.request.user)


class KitchenVaultDetailView(RetrieveAPIView):
    serializer_class = KitchenVaultSerializer
    lookup_url_kwarg = "kitchen_id"

    def get_object(self):
        return get_object_or_404(
            paper_portfolios_for_user(self.request.user),
            kitchen_id=self.kwargs[self.lookup_url_kwarg],
        )
