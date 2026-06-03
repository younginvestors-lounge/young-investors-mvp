from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

UserModel = get_user_model()


class EmailBackend(ModelBackend):
    """Authenticate using a case-insensitive email address.

    Accepts the email via either the ``username`` kwarg (Django's default
    signature) or an explicit ``email`` kwarg. Always runs the password hasher
    even when the user is missing, to keep timing uniform against enumeration.
    """

    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        identifier = email or username
        if identifier is None or password is None:
            return None

        try:
            user = UserModel.objects.get(email__iexact=identifier.strip())
        except UserModel.DoesNotExist:
            UserModel().set_password(password)  # equalise timing
            return None
        except UserModel.MultipleObjectsReturned:
            user = UserModel.objects.filter(email__iexact=identifier.strip()).order_by("id").first()

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
