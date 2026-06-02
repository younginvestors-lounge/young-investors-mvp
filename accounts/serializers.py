from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChefUser
import uuid
import secrets
from django.utils import timezone
from datetime import timedelta
from .models import EmailVerificationToken, PasswordResetToken

User = get_user_model()

class ChefUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChefUser
        fields = [
            "id",
            "username",
            "email",
            "chef_alias",
            "age",
            "intent",
            "email_verified",
            "is_training_mode",
            "academy_score",
            "kitchen_score",
            "personal_prediction_score",
            "profile_picture",
            "profile_icon",
        ]
        read_only_fields = ["id", "email_verified", "is_training_mode"]


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    chef_alias = serializers.CharField(max_length=128)

    class Meta:
        model = ChefUser
        fields = ["email", "username", "password", "password_confirm", "chef_alias", "age", "intent"]

    def validate(self, data):
        if data["password"] != data.pop("password_confirm"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def validate_email(self, value):
        if ChefUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate_age(self, value):
        if value < 13:
            raise serializers.ValidationError("Minimum age 13.")
        return value

    def create(self, validated_data):
        user = ChefUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            chef_alias=validated_data.get("chef_alias", validated_data["username"]),
            age=validated_data.get("age"),
            intent=validated_data.get("intent"),
            is_training_mode=validated_data.get("age", 22) < 18,
        )
        return user


class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate_token(self, value):
        try:
            token_obj = EmailVerificationToken.objects.get(token=value)
            if token_obj.is_expired():
                raise serializers.ValidationError("Token expired or already used.")
        except EmailVerificationToken.DoesNotExist:
            raise serializers.ValidationError("Invalid token.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            ChefUser.objects.get(email=value)
        except ChefUser.DoesNotExist:
            raise serializers.ValidationError("Email not found.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        if data["password"] != data.pop("password_confirm"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def validate_token(self, value):
        try:
            token_obj = PasswordResetToken.objects.get(token=value)
            if token_obj.is_expired():
                raise serializers.ValidationError("Token expired or already used.")
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Invalid token.")
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
