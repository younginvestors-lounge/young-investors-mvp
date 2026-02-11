from django.contrib import admin
from django.urls import path
from kitchen.views import cast_vote, get_kitchen_data

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/kitchen/', get_kitchen_data), # New viewer
    path('api/vote/<int:proposal_id>/', cast_vote),
]
