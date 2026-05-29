from django.urls import path

from .views import KitchenListView, MyKitchenMembershipListView


urlpatterns = [
    path("kitchens/", KitchenListView.as_view(), name="kitchen-list"),
    path("me/kitchens/", MyKitchenMembershipListView.as_view(), name="my-kitchen-memberships"),
]
