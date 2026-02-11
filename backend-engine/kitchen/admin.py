from django.contrib import admin
from .models import Kitchen, TradeProposal, Vote

# Register your models here.
admin.site.register(Kitchen)
admin.site.register(TradeProposal)
admin.site.register(Vote)
