from django.urls import path

from .views import JseTop40AssetListView


urlpatterns = [
    path("marketdata/jse-top-40/", JseTop40AssetListView.as_view(), name="jse-top-40"),
]
