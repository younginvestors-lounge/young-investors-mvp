from django.urls import path
from .views import GordonReviewView

urlpatterns = [
    path("gordon/review/", GordonReviewView.as_view(), name="gordon-review"),
]

