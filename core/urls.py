from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("accounts.urls")),
    path("api/", include("academy.urls")),
    path("api/", include("kitchen.urls")),
    path("api/", include("arena.urls")),
    path("api/", include("vault.urls")),
    path("api/", include("lounge.urls")),
    path("api/", include("gordon.urls")),
    path("api/", include("marketdata.urls")),
]
