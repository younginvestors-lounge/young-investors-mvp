from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal

class Kitchen(models.Model):
    name = models.CharField(max_length=100)
    # The 'Chef' is the admin of the squad
    head_chef = models.ForeignKey(User, related_name='managed_kitchens', on_delete=models.CASCADE)
    members = models.ManyToManyField(User, related_name='kitchens')
    # Total Cash available to trade
    cash_balance = models.DecimalField(max_digits=12, decimal_places=2, default=10000.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class TradeProposal(models.Model):
    ACTION_CHOICES = [('BUY', 'Buy'), ('SELL', 'Sell')]
    
    kitchen = models.ForeignKey(Kitchen, on_delete=models.CASCADE)
    proposer = models.ForeignKey(User, on_delete=models.CASCADE)
    ticker = models.CharField(max_length=10) # e.g., JSE:NPN
    action = models.CharField(max_length=4, choices=ACTION_CHOICES)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_executed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} {self.quantity} {self.ticker}"

class Vote(models.Model):
    DECISION_CHOICES = [('YES', 'Approve'), ('NO', 'Reject')]
    
    proposal = models.ForeignKey(TradeProposal, related_name='votes', on_delete=models.CASCADE)
    voter = models.ForeignKey(User, on_delete=models.CASCADE)
    decision = models.CharField(max_length=3, choices=DECISION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('proposal', 'voter') # One person, one vote
        