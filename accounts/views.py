import secrets
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.contrib.auth import authenticate, get_user_model
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import ChefUser, EmailVerificationToken, PasswordResetToken
from .serializers import (
    ChefUserSerializer,
    SignupSerializer,
    EmailVerificationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    LoginSerializer,
)

User = get_user_model()


class AuthViewSet(viewsets.ViewSet):
    """Authentication endpoints: signup, login, email verify, password reset."""

    @action(detail=False, methods=["post"])
    def signup(self, request):
        """Create a new Chef account."""
        serializer = SignupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()

        # Generate email verification token
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=24)
        EmailVerificationToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at,
        )

        # Send verification email via SendGrid
        send_mail(
            subject="Verify your Young Investors account",
            message=f"Please verify your email to complete signup.",
            from_email="noreply@younginvestors.co",
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {
                "message": "Account created. Please check your email to verify.",
                "user": ChefUserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"])
    def verify_email(self, request):
        """Verify email address with token."""
        serializer = EmailVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        token_obj = EmailVerificationToken.objects.get(token=serializer.validated_data["token"])
        token_obj.is_used = True
        token_obj.save()

        user = token_obj.user
        user.mark_email_verified()

        return Response(
            {"message": "Email verified. You can now log in."},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"])
    def login(self, request):
        """Login with email and password, return JWT tokens."""
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(
            username=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        if not user:
            try:
                user_obj = ChefUser.objects.get(email=serializer.validated_data["email"])
                user = authenticate(
                    username=user_obj.username,
                    password=serializer.validated_data["password"],
                )
            except ChefUser.DoesNotExist:
                pass

        if not user:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.email_verified:
            return Response(
                {"error": "Please verify your email before logging in."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": ChefUserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"])
    def password_reset_request(self, request):
        """Request a password reset email."""
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = ChefUser.objects.get(email=serializer.validated_data["email"])

        # Generate reset token
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=2)
        PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at,
        )

        # Send reset email via SendGrid
        send_mail(
            subject="Reset your Young Investors password",
            message=f"Please reset your password.",
            from_email="noreply@younginvestors.co",
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {"message": "Password reset email sent."},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"])
    def password_reset_confirm(self, request):
        """Confirm password reset with token."""
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        token_obj = PasswordResetToken.objects.get(token=serializer.validated_data["token"])
        token_obj.is_used = True
        token_obj.save()

        user = token_obj.user
        user.set_password(serializer.validated_data["password"])
        user.save()

        return Response(
            {"message": "Password reset successfully."},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"])
    def me(self, request):
        """Get current authenticated user."""
        if not request.user.is_authenticated:
            return Response(
                {"error": "Not authenticated."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response(ChefUserSerializer(request.user).data)
