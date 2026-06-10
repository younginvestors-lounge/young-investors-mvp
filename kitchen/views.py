from rest_framework.generics import ListAPIView

from .models import KitchenMembership
from .serializers import KitchenMembershipSerializer, KitchenSerializer
from .services import active_kitchens


class KitchenListView(ListAPIView):
    serializer_class = KitchenSerializer

    def get_queryset(self):
        return active_kitchens()


class MyKitchenMembershipListView(ListAPIView):
    serializer_class = KitchenMembershipSerializer

    def get_queryset(self):
        return (
            KitchenMembership.objects.filter(user=self.request.user)
            .select_related("kitchen")
            .order_by("kitchen__name", "joined_at")
        )
