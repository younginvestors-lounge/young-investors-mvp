import logging
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import ChefUser, EmailVerificationToken, KitchenSeatCounter, PasswordResetToken
from .serializers import (
    ChefUserSerializer,
    EmailVerificationSerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    SignupSerializer,
)

logger = logging.getLogger(__name__)

VERIFY_TOKEN_TTL = timedelta(hours=24)
RESET_TOKEN_TTL = timedelta(hours=2)
MAX_PROFILE_PICTURE_BYTES = 5 * 1024 * 1024


def _frontend_url() -> str:
    return getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")


def _send_email_resilient(subject: str, message: str, recipient: str) -> bool:
    """Send an email without letting a failure roll back the surrounding transaction.

    Returns True if the email was dispatched, False otherwise. One-time links are
    never logged here because verification and reset tokens are sensitive.
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@younginvestors.co"),
            recipient_list=[recipient],
            fail_silently=False,
        )
        return True
    except Exception:  # noqa: BLE001 — email must never break account creation
        logger.exception("Email send failed during auth flow.")
        return False


class AuthViewSet(viewsets.ViewSet):
    """Authentication: signup, email verification, login, password reset, profile."""

    def get_permissions(self):
        public = {
            "signup",
            "verify_email",
            "login",
            "password_reset_request",
            "password_reset_confirm",
        }
        if self.action in public:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=["post"])
    def signup(self, request):
        """Create a new Chef account and dispatch an email verification link."""
        serializer = SignupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        token = secrets.token_urlsafe(32)

        # User + seat + token are created atomically. Email is sent only after commit
        # so a mail outage can never orphan a half-created account.
        with transaction.atomic():
            user = serializer.save()

            # Allocate a permanent, race-safe join number ("Chef #N").
            counter, _ = KitchenSeatCounter.objects.select_for_update().get_or_create(id=1)
            counter.last_seat += 1
            counter.save(update_fields=["last_seat"])
            user.member_number = counter.last_seat
            user.save(update_fields=["member_number"])

            EmailVerificationToken.objects.create(
                user=user,
                token=token,
                expires_at=timezone.now() + VERIFY_TOKEN_TTL,
            )

        verify_link = f"{_frontend_url()}/verify-email?token={token}"
        _send_email_resilient(
            subject="Verify your Young Investors account",
            message=(
                f"Welcome to Young Investors, Chef {user.chef_alias}.\n\n"
                f"Confirm your email to open the Kitchen:\n{verify_link}\n\n"
                f"This link expires in 24 hours.\n\n"
                f"We Cook."
            ),
            recipient=user.email,
        )

        return Response(
            {
                "message": "Account created. Check your email to verify your account.",
                "user": ChefUserSerializer(user, context={"request": request}).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"])
    def verify_email(self, request):
        """Verify an email address with a one-time token."""
        serializer = EmailVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            token_obj = (
                EmailVerificationToken.objects.select_for_update()
                .select_related("user")
                .get(token=serializer.validated_data["token"])
            )
            if token_obj.is_expired():
                return Response(
                    {"error": "This verification link has expired or was already used."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token_obj.is_used = True
            token_obj.save(update_fields=["is_used"])
            token_obj.user.mark_email_verified()

        return Response(
            {"message": "Email verified. You can now log in."},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"])
    def login(self, request):
        """Authenticate by email + password and return JWT tokens."""
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"].strip().lower()
        password = serializer.validated_data["password"]

        # The custom EmailBackend authenticates on email; fall back to username for
        # any legacy accounts created before the email backend existed.
        user = authenticate(request, username=email, password=password)
        if user is None:
            user = authenticate(request, email=email, password=password)

        if user is None:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.email_verified:
            return Response(
                {"error": "Please verify your email before logging in.", "code": "email_unverified"},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": ChefUserSerializer(user, context={"request": request}).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"])
    def password_reset_request(self, request):
        """Dispatch a password reset link. Always returns 200 to avoid email enumeration."""
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"].strip().lower()
        generic = Response(
            {"message": "If that email is registered, a reset link is on its way."},
            status=status.HTTP_200_OK,
        )

        try:
            user = ChefUser.objects.get(email__iexact=email)
        except ChefUser.DoesNotExist:
            return generic

        token = secrets.token_urlsafe(32)
        PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=timezone.now() + RESET_TOKEN_TTL,
        )

        reset_link = f"{_frontend_url()}/reset-password?token={token}"
        _send_email_resilient(
            subject="Reset your Young Investors password",
            message=(
                f"Chef {user.chef_alias}, a password reset was requested.\n\n"
                f"Set a new password here:\n{reset_link}\n\n"
                f"This link expires in 2 hours. If you didn't ask for this, ignore it."
            ),
            recipient=user.email,
        )
        return generic

    @action(detail=False, methods=["post"])
    def password_reset_confirm(self, request):
        """Set a new password from a one-time reset token."""
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            token_obj = (
                PasswordResetToken.objects.select_for_update()
                .select_related("user")
                .get(token=serializer.validated_data["token"])
            )
            if token_obj.is_expired():
                return Response(
                    {"error": "This reset link has expired or was already used."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token_obj.is_used = True
            token_obj.save(update_fields=["is_used"])
            user = token_obj.user
            user.set_password(serializer.validated_data["password"])
            user.save(update_fields=["password"])

        return Response(
            {"message": "Password reset. You can now log in with your new password."},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"])
    def me(self, request):
        """Return the authenticated Chef."""
        return Response(ChefUserSerializer(request.user, context={"request": request}).data)

    @action(detail=False, methods=["patch"])
    def update_profile(self, request):
        """Update chef_alias, age, intent, profile_icon, or profile_picture."""
        user = request.user

        if "chef_alias" in request.data:
            alias = str(request.data["chef_alias"]).strip()
            if not alias:
                return Response(
                    {"error": "Chef alias cannot be empty."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.chef_alias = alias[:128]

        if "age" in request.data and request.data["age"] not in ("", None):
            try:
                age = int(request.data["age"])
            except (TypeError, ValueError):
                return Response({"error": "Age must be a number."}, status=status.HTTP_400_BAD_REQUEST)
            if age < 13:
                return Response({"error": "Minimum age is 13."}, status=status.HTTP_400_BAD_REQUEST)
            user.age = age
            user.is_training_mode = age < 18

        if "intent" in request.data:
            valid_intents = [c[0] for c in ChefUser._meta.get_field("intent").choices]
            intent = request.data["intent"]
            if intent and intent not in valid_intents:
                return Response(
                    {"error": f"Invalid intent. Choose from: {', '.join(valid_intents)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.intent = intent

        if "profile_icon" in request.data:
            icon = request.data["profile_icon"]
            valid_icons = [c[0] for c in ChefUser._meta.get_field("profile_icon").choices]
            if icon not in valid_icons:
                return Response(
                    {"error": f"Invalid profile_icon. Choose from: {', '.join(valid_icons)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.profile_icon = icon

        if "profile_picture" in request.FILES:
            file = request.FILES["profile_picture"]
            if file.size > MAX_PROFILE_PICTURE_BYTES:
                return Response(
                    {"error": "Profile picture too large (max 5MB)."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            content_type = getattr(file, "content_type", "")
            if content_type not in getattr(settings, "ALLOWED_IMAGE_TYPES", []):
                return Response(
                    {"error": "Profile picture must be a JPEG, PNG, WEBP, or GIF image."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.profile_picture = file

        user.save()
        return Response(
            {
                "message": "Profile updated.",
                "user": ChefUserSerializer(user, context={"request": request}).data,
            },
            status=status.HTTP_200_OK,
        )
