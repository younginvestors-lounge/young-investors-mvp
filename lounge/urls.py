from django.urls import path

from .views import LoungeKitchenRankingListView


urlpatterns = [
    path("lounge/kitchen-rankings/", LoungeKitchenRankingListView.as_view(), name="lounge-kitchen-rankings"),
]
