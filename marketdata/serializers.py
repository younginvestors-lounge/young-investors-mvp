from rest_framework import serializers

from .models import PermittedAsset


class PermittedAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = PermittedAsset
        fields = [
            "public_id",
            "symbol",
            "name",
            "exchange",
            "index_code",
            "currency",
            "is_active",
            "last_verified_at",
        ]
        read_only_fields = fields
