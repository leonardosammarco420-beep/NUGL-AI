import stripe
import os
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid
import logging

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')

class SubscriptionPlan(BaseModel):
    """Subscription plan details"""
    id: str
    name: str
    price: float
    interval: str  # 'month', 'year'
    features: List[str]
    stripe_price_id: Optional[str] = None

class UserSubscription(BaseModel):
    """User subscription details"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan_id: str
    stripe_subscription_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    status: str = "active"  # active, canceled, expired
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubscriptionService:
    """Handle subscription management with Stripe"""
    
    # Define subscription plans
    PLANS = {
        "free": SubscriptionPlan(
            id="free",
            name="Free",
            price=0,
            interval="month",
            features=[
                "Basic news access",
                "Strain finder (limited)",
                "AI chat (5 messages/day)",
                "Standard support"
            ]
        ),
        "pro": SubscriptionPlan(
            id="pro",
            name="Pro",
            price=29.99,
            interval="month",
            features=[
                "Unlimited news access",
                "Advanced strain finder",
                "Unlimited AI chat",
                "Price alerts",
                "Portfolio tracking",
                "Priority support",
                "No ads"
            ],
            stripe_price_id=os.environ.get('STRIPE_PRICE_PRO_MONTHLY')
        ),
        "premium": SubscriptionPlan(
            id="premium",
            name="Premium",
            price=99.99,
            interval="month",
            features=[
                "All Pro features",
                "Exclusive market insights",
                "Advanced analytics",
                "API access",
                "White-label reports",
                "Dedicated account manager",
                "Early access to new features"
            ],
            stripe_price_id=os.environ.get('STRIPE_PRICE_PREMIUM_MONTHLY')
        )
    }
    
    def __init__(self, db):
        self.db = db
    
    async def create_checkout_session(self, user_id: str, plan_id: str, success_url: str, cancel_url: str):
        """Create Stripe checkout session"""
        try:
            plan = self.PLANS.get(plan_id)
            if not plan or not plan.stripe_price_id:
                raise ValueError("Invalid plan")
            
            # Get or create Stripe customer
            user = await self.db.users.find_one({"id": user_id})
            customer_id = user.get("stripe_customer_id")
            
            if not customer_id:
                customer = stripe.Customer.create(
                    email=user.get("email"),
                    metadata={"user_id": user_id}
                )
                customer_id = customer.id
                await self.db.users.update_one(
                    {"id": user_id},
                    {"$set": {"stripe_customer_id": customer_id}}
                )
            
            # Create checkout session
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=['card'],
                line_items=[{
                    'price': plan.stripe_price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    'user_id': user_id,
                    'plan_id': plan_id
                }
            )
            
            return session
        except Exception as e:
            logger.error(f"Error creating checkout session: {str(e)}")
            raise
    
    async def handle_webhook(self, event):
        """Handle Stripe webhook events"""
        try:
            if event['type'] == 'checkout.session.completed':
                session = event['data']['object']
                await self._handle_successful_payment(session)
            
            elif event['type'] == 'customer.subscription.updated':
                subscription = event['data']['object']
                await self._update_subscription_status(subscription)
            
            elif event['type'] == 'customer.subscription.deleted':
                subscription = event['data']['object']
                await self._cancel_subscription(subscription)
            
            logger.info(f"Webhook handled: {event['type']}")
        except Exception as e:
            logger.error(f"Error handling webhook: {str(e)}")
    
    async def _handle_successful_payment(self, session):
        """Handle successful subscription payment"""
        user_id = session['metadata']['user_id']
        plan_id = session['metadata']['plan_id']
        
        subscription = UserSubscription(
            user_id=user_id,
            plan_id=plan_id,
            stripe_subscription_id=session['subscription'],
            stripe_customer_id=session['customer'],
            current_period_start=datetime.now(timezone.utc),
            current_period_end=datetime.now(timezone.utc) + timedelta(days=30),
            status="active"
        )
        
        doc = subscription.model_dump()
        doc["current_period_start"] = doc["current_period_start"].isoformat()
        doc["current_period_end"] = doc["current_period_end"].isoformat()
        doc["created_at"] = doc["created_at"].isoformat()
        
        await self.db.subscriptions.insert_one(doc)
        await self.db.users.update_one(
            {"id": user_id},
            {"$set": {"subscription_plan": plan_id}}
        )
    
    async def _update_subscription_status(self, subscription):
        """Update subscription status"""
        await self.db.subscriptions.update_one(
            {"stripe_subscription_id": subscription['id']},
            {"$set": {"status": subscription['status']}}
        )
    
    async def _cancel_subscription(self, subscription):
        """Cancel subscription"""
        await self.db.subscriptions.update_one(
            {"stripe_subscription_id": subscription['id']},
            {"$set": {"status": "canceled"}}
        )
    
    async def get_user_subscription(self, user_id: str):
        """Get user's current subscription"""
        subscription = await self.db.subscriptions.find_one(
            {"user_id": user_id, "status": "active"},
            {"_id": 0}
        )
        return subscription
    
    async def cancel_user_subscription(self, user_id: str):
        """Cancel user subscription"""
        try:
            subscription = await self.get_user_subscription(user_id)
            if subscription and subscription.get('stripe_subscription_id'):
                stripe.Subscription.modify(
                    subscription['stripe_subscription_id'],
                    cancel_at_period_end=True
                )
                await self.db.subscriptions.update_one(
                    {"id": subscription['id']},
                    {"$set": {"cancel_at_period_end": True}}
                )
                return True
            return False
        except Exception as e:
            logger.error(f"Error canceling subscription: {str(e)}")
            raise