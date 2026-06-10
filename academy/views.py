from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ClearanceSerializer
from .services import get_user_clearance


class ClearanceView(APIView):
    def get(self, request):
        payload = get_user_clearance(request.user).as_dict()
        return Response(ClearanceSerializer(payload).data)
