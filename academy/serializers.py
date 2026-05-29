from rest_framework import serializers


class ClearanceSerializer(serializers.Serializer):
    cleared = serializers.BooleanField()
    required_modules = serializers.ListField(child=serializers.CharField())
    passed_modules = serializers.ListField(child=serializers.CharField())
    missing_modules = serializers.ListField(child=serializers.CharField())
