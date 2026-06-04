"""Auth flow tests for the Young Investors accounts app.

Covers signup, email verification (one-time), the pre-verification login block,
verified login (incl. case-insensitive email + JWT issue), password reset token
reuse, and member-number monotonicity.

DRF is JWT-only, so these hit the public auth endpoints directly with JSON — no
session/`force_login`. Run with SQLite for a turnkey local pass:

    USE_SQLITE=True python manage.py test accounts
"""

from rest_framework import status
from rest_framework.test import APITestCase

from .models import ChefUser, EmailVerificationToken, PasswordResetToken

SIGNUP = "/api/auth/signup/"
VERIFY = "/api/auth/verify_email/"
LOGIN = "/api/auth/login/"
RESET_REQUEST = "/api/auth/password_reset_request/"
RESET_CONFIRM = "/api/auth/password_reset_confirm/"

PASSWORD = "SeasonThePot9!"  # strong: >=8, mixed, not common, not numeric, not user-similar


class AccountsAuthFlowTests(APITestCase):
    def _payload(self, **overrides):
        payload = {
            "email": "chef.alpha@example.com",
            "username": "chef.alpha@example.com",
            "password": PASSWORD,
            "password_confirm": PASSWORD,
            "chef_alias": "Alpha",
            "age": 21,
            "intent": "learn_craft",
            "profile_icon": "flame",
        }
        payload.update(overrides)
        return payload

    def _signup(self, **overrides):
        return self.client.post(SIGNUP, self._payload(**overrides), format="json")

    def _verified_chef(self, **overrides):
        self._signup(**overrides)
        email = overrides.get("email", "chef.alpha@example.com")
        user = ChefUser.objects.get(email=email)
        user.mark_email_verified()
        return user

    # ── Signup ──────────────────────────────────────────────────────────────
    def test_signup_creates_unverified_chef_with_member_number_and_token(self):
        res = self._signup()
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = ChefUser.objects.get(email="chef.alpha@example.com")
        self.assertFalse(user.email_verified)
        self.assertIsNotNone(user.member_number)
        self.assertTrue(EmailVerificationToken.objects.filter(user=user).exists())

    def test_signup_rejects_duplicate_email(self):
        self._signup()
        res = self._signup(username="another-name")  # same email
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", res.json())

    def test_signup_rejects_mismatched_passwords(self):
        res = self._signup(password_confirm="DifferentSeason9!")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Email verification ──────────────────────────────────────────────────
    def test_verification_marks_verified_and_is_one_time(self):
        self._signup()
        user = ChefUser.objects.get(email="chef.alpha@example.com")
        token = EmailVerificationToken.objects.get(user=user).token

        first = self.client.post(VERIFY, {"token": token}, format="json")
        self.assertEqual(first.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.email_verified)

        # Same token a second time must be rejected (one-time use).
        reuse = self.client.post(VERIFY, {"token": token}, format="json")
        self.assertEqual(reuse.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verification_rejects_unknown_token(self):
        res = self.client.post(VERIFY, {"token": "not-a-real-token"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Login ───────────────────────────────────────────────────────────────
    def test_login_blocked_before_verification(self):
        self._signup()
        res = self.client.post(LOGIN, {"email": "chef.alpha@example.com", "password": PASSWORD}, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(res.json().get("code"), "email_unverified")

    def test_login_succeeds_after_verification_and_returns_jwt(self):
        self._verified_chef()
        res = self.client.post(LOGIN, {"email": "chef.alpha@example.com", "password": PASSWORD}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        body = res.json()
        self.assertIn("access", body)
        self.assertIn("refresh", body)
        self.assertEqual(body["user"]["email"], "chef.alpha@example.com")

    def test_login_is_email_case_insensitive(self):
        self._verified_chef()
        res = self.client.post(LOGIN, {"email": "CHEF.ALPHA@EXAMPLE.COM", "password": PASSWORD}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_login_rejects_wrong_password(self):
        self._verified_chef()
        res = self.client.post(LOGIN, {"email": "chef.alpha@example.com", "password": "WrongSeason9!"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Password reset ──────────────────────────────────────────────────────
    def test_reset_request_issues_token_and_is_generic(self):
        self._signup()
        res = self.client.post(RESET_REQUEST, {"email": "chef.alpha@example.com"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        user = ChefUser.objects.get(email="chef.alpha@example.com")
        self.assertTrue(PasswordResetToken.objects.filter(user=user).exists())

    def test_reset_request_unknown_email_is_generic_and_issues_no_token(self):
        res = self.client.post(RESET_REQUEST, {"email": "ghost@example.com"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(PasswordResetToken.objects.count(), 0)

    def test_reset_confirm_sets_new_password_and_token_cannot_be_reused(self):
        user = self._verified_chef()
        self.client.post(RESET_REQUEST, {"email": "chef.alpha@example.com"}, format="json")
        token = PasswordResetToken.objects.filter(user=user).latest("created_at").token
        new_password = "FreshSeason12!"

        first = self.client.post(
            RESET_CONFIRM,
            {"token": token, "password": new_password, "password_confirm": new_password},
            format="json",
        )
        self.assertEqual(first.status_code, status.HTTP_200_OK)

        # The new password works.
        login = self.client.post(LOGIN, {"email": "chef.alpha@example.com", "password": new_password}, format="json")
        self.assertEqual(login.status_code, status.HTTP_200_OK)

        # The same reset token cannot be reused (one-time).
        reuse = self.client.post(
            RESET_CONFIRM,
            {"token": token, "password": "AnotherSeason13!", "password_confirm": "AnotherSeason13!"},
            format="json",
        )
        self.assertEqual(reuse.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Member number monotonicity ──────────────────────────────────────────
    def test_member_numbers_are_monotonic_unique_and_consecutive(self):
        self._signup(email="chef.one@example.com", username="chef.one@example.com", chef_alias="One")
        self._signup(email="chef.two@example.com", username="chef.two@example.com", chef_alias="Two")
        self._signup(email="chef.three@example.com", username="chef.three@example.com", chef_alias="Three")

        numbers = list(
            ChefUser.objects.exclude(member_number__isnull=True)
            .order_by("member_number")
            .values_list("member_number", flat=True)
        )
        self.assertEqual(len(numbers), 3)
        self.assertEqual(len(set(numbers)), 3)          # unique
        self.assertEqual(numbers, sorted(numbers))       # monotonic
        self.assertEqual(numbers[1] - numbers[0], 1)     # no gaps (seat counter)
        self.assertEqual(numbers[2] - numbers[1], 1)
