from rest_framework import serializers

from .models import Kitchen, KitchenMembership


class KitchenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kitchen
        fields = [
            "id",
            "name",
            "slug",
            "institution",
            "execution_mode",
            "quorum_required",
            "is_active",
        ]
        read_only_fields = fields


class KitchenMembershipSerializer(serializers.ModelSerializer):
    kitchen_name = serializers.CharField(source="kitchen.name", read_only=True)

    class Meta:
        model = KitchenMembership
        fields = [
            "id",
            "kitchen",
            "kitchen_name",
            "role",
            "status",
            "joined_at",
        ]
        read_only_fields = fields
