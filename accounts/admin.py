from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import ChefUser, EmailVerificationToken, KitchenSeatCounter, PasswordResetToken

@admin.register(ChefUser)
class ChefUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Young Investors", {
            "fields": ("chef_alias", "member_number", "age", "intent", "profile_icon", "profile_picture", "email_verified", "email_verified_at", "is_training_mode", "academy_score", "kitchen_score", "personal_prediction_score")
        }),
    )
    readonly_fields = ("member_number",)
    list_display = ("member_number", "username", "email", "chef_alias", "age", "email_verified", "is_training_mode")
    list_display_links = ("username", "email")
    ordering = ("member_number",)
    list_filter = UserAdmin.list_filter + ("email_verified", "is_training_mode")
    search_fields = UserAdmin.search_fields + ("chef_alias",)


@admin.register(KitchenSeatCounter)
class KitchenSeatCounterAdmin(admin.ModelAdmin):
    list_display = ("id", "last_seat")

@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "is_used", "expires_at")
    list_filter = ("is_used", "expires_at")
    search_fields = ("user__email",)

@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "is_used", "expires_at")
    list_filter = ("is_used", "expires_at")
    search_fields = ("user__email",)
