from django.urls import path

from .views import KitchenVaultDetailView, PaperPortfolioListView


urlpatterns = [
    path("kitchens/<uuid:kitchen_id>/vault/", KitchenVaultDetailView.as_view(), name="kitchen-vault-detail"),
    path("vault/paper-portfolios/", PaperPortfolioListView.as_view(), name="paper-portfolio-list"),
]
