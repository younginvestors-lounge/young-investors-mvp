from rest_framework import serializers


class LoungeKitchenRankingSerializer(serializers.Serializer):
    rank = serializers.IntegerField()
    kitchen_id = serializers.UUIDField()
    kitchen_name = serializers.CharField()
    institution = serializers.CharField(allow_blank=True)
    total_value = serializers.DecimalField(max_digits=18, decimal_places=2)
    currency = serializers.CharField()
    execution_mode = serializers.CharField()
    holdings_count = serializers.IntegerField()
    estimated_roi_percent = serializers.DecimalField(max_digits=8, decimal_places=2)
    featured = serializers.BooleanField()
