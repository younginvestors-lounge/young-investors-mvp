from django.urls import path

from .views import ClearanceView


urlpatterns = [
    path("me/clearance/", ClearanceView.as_view(), name="me-clearance"),
]
