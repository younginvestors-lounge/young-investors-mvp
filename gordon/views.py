from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class GordonReviewView(APIView):
    """
    MOCK_MVP Gordon risk review endpoint.

    Gordon can review, warn, reject, and explain.
    Gordon does not execute trades.
    """

    def post(self, request):
        return Response(
            {
                "success": True,
                "data": {
                    "mode": "MOCK_MVP_PAPER_TRADING_ONLY",
                    "recommendation": "WAIT",
                    "risk_score": 0.72,
                    "reason": (
                        "Gordon is running in mock review mode. "
                        "No live AI, broker, or execution API is connected."
                    ),
                    "flags": ["MOCK_MVP", "NO_LIVE_EXECUTION"],
                },
                "error": None,
                "meta": {},
            },
            status=status.HTTP_200_OK,
        )
    

    