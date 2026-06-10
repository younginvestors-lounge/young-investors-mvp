from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import ChefUser, EmailVerificationToken, PasswordResetToken

User = get_user_model()


class ChefUserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(read_only=True)

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
            "member_number",
            "academy_score",
            "kitchen_score",
            "personal_prediction_score",
            "profile_picture",
            "profile_icon",
        ]
        read_only_fields = ["id", "email", "email_verified", "is_training_mode", "member_number"]


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})
    password_confirm = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})
    chef_alias = serializers.CharField(max_length=128)
    profile_icon = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = ChefUser
        fields = ["email", "username", "password", "password_confirm", "chef_alias", "age", "intent", "profile_icon"]

    def validate_profile_icon(self, value):
        if not value:
            return "chef-default"
        valid = [c[0] for c in ChefUser._meta.get_field("profile_icon").choices]
        if value not in valid:
            raise serializers.ValidationError("Unknown profile icon.")
        return value

    def validate_email(self, value):
        value = value.strip().lower()
        if ChefUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_username(self, value):
        value = value.strip()
        if ChefUser.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("That username is taken.")
        return value

    def validate_age(self, value):
        if value is not None and value < 13:
            raise serializers.ValidationError("You must be at least 13 to join.")
        return value

    def validate(self, data):
        if data["password"] != data.get("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        # Enforce Django's configured password strength validators.
        try:
            validate_password(data["password"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})
        data.pop("password_confirm", None)
        return data

    def create(self, validated_data):
        age = validated_data.get("age")
        return ChefUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            chef_alias=validated_data.get("chef_alias") or validated_data["username"],
            age=age,
            intent=validated_data.get("intent", ""),
            profile_icon=validated_data.get("profile_icon") or "chef-default",
            is_training_mode=(age is not None and age < 18),
        )


class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate_token(self, value):
        if not EmailVerificationToken.objects.filter(token=value).exists():
            raise serializers.ValidationError("Invalid verification link.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    # Intentionally does NOT validate existence — the view returns a generic
    # response either way to prevent account enumeration.
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})
    password_confirm = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})

    def validate_token(self, value):
        if not PasswordResetToken.objects.filter(token=value).exists():
            raise serializers.ValidationError("Invalid reset link.")
        return value

    def validate(self, data):
        if data["password"] != data.get("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        try:
            validate_password(data["password"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})
        data.pop("password_confirm", None)
        return data


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})
