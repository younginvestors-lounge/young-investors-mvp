from django.urls import path

from .views import CastKitchenRecipeVoteView, KitchenRecipeListView


urlpatterns = [
    path("kitchens/<uuid:kitchen_id>/recipes/", KitchenRecipeListView.as_view(), name="kitchen-recipe-list"),
    path(
        "kitchens/<uuid:kitchen_id>/recipes/<uuid:proposal_id>/votes/",
        CastKitchenRecipeVoteView.as_view(),
        name="kitchen-recipe-cast-vote",
    ),
]
