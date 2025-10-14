from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid
import logging

logger = logging.getLogger(__name__)

class AffiliateClick(BaseModel):
    """Track affiliate link clicks"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    affiliate_link: str
    affiliate_type: str  # 'dispensary', 'seed_wholesaler', 'stake_casino', 'shopify'
    item_id: Optional[str] = None  # strain_id, seed_id, product_id
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    referrer: Optional[str] = None
    clicked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    converted: bool = False
    conversion_value: float = 0.0
    commission_earned: float = 0.0

class AffiliateConversion(BaseModel):
    """Track affiliate conversions/sales"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    click_id: str
    user_id: Optional[str] = None
    affiliate_type: str
    sale_value: float
    commission_rate: float  # Percentage
    commission_amount: float
    status: str = "pending"  # pending, approved, paid
    converted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    paid_at: Optional[datetime] = None

class AffiliatePartner(BaseModel):
    """Affiliate partner information"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # 'dispensary', 'seed_wholesaler', 'casino', 'retail'
    commission_rate: float
    tracking_url: str
    contact_email: str
    status: str = "active"  # active, paused, terminated
    total_clicks: int = 0
    total_conversions: int = 0
    total_revenue: float = 0.0
    total_commission: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AffiliateStats(BaseModel):
    """Aggregate affiliate statistics"""
    total_clicks: int
    total_conversions: int
    conversion_rate: float
    total_revenue: float
    total_commission: float
    top_performers: List[dict]
    recent_conversions: List[dict]

class AffiliateTrackingService:
    """Service for tracking affiliate clicks and conversions"""
    
    def __init__(self, db):
        self.db = db
    
    async def track_click(self, affiliate_data: dict):
        """Track affiliate link click"""
        try:
            click = AffiliateClick(**affiliate_data)
            doc = click.model_dump()
            doc["clicked_at"] = doc["clicked_at"].isoformat()
            await self.db.affiliate_clicks.insert_one(doc)
            
            # Update partner stats
            await self.db.affiliate_partners.update_one(
                {"tracking_url": affiliate_data.get("affiliate_link")},
                {"$inc": {"total_clicks": 1}}
            )
            
            logger.info(f"Tracked affiliate click: {click.id}")
            return click.id
        except Exception as e:
            logger.error(f"Error tracking click: {str(e)}")
            return None
    
    async def record_conversion(self, click_id: str, sale_value: float, commission_rate: float):
        """Record affiliate conversion"""
        try:
            commission_amount = sale_value * (commission_rate / 100)
            
            conversion = AffiliateConversion(
                click_id=click_id,
                sale_value=sale_value,
                commission_rate=commission_rate,
                commission_amount=commission_amount
            )
            
            doc = conversion.model_dump()
            doc["converted_at"] = doc["converted_at"].isoformat()
            await self.db.affiliate_conversions.insert_one(doc)
            
            # Update click record
            await self.db.affiliate_clicks.update_one(
                {"id": click_id},
                {
                    "$set": {
                        "converted": True,
                        "conversion_value": sale_value,
                        "commission_earned": commission_amount
                    }
                }
            )
            
            # Update partner stats
            await self.db.affiliate_partners.update_one(
                {"type": conversion.affiliate_type},
                {
                    "$inc": {
                        "total_conversions": 1,
                        "total_revenue": sale_value,
                        "total_commission": commission_amount
                    }
                }
            )
            
            logger.info(f"Recorded conversion: {conversion.id} - ${commission_amount}")
            return conversion.id
        except Exception as e:
            logger.error(f"Error recording conversion: {str(e)}")
            return None
    
    async def get_affiliate_stats(self, days: int = 30):
        """Get aggregate affiliate statistics"""
        try:
            cutoff_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
            
            # Get clicks and conversions
            clicks = await self.db.affiliate_clicks.count_documents({
                "clicked_at": {"$gte": cutoff_date}
            })
            
            conversions = await self.db.affiliate_conversions.count_documents({
                "converted_at": {"$gte": cutoff_date}
            })
            
            # Calculate conversion rate
            conversion_rate = (conversions / clicks * 100) if clicks > 0 else 0
            
            # Get revenue and commission
            pipeline = [
                {"$match": {"converted_at": {"$gte": cutoff_date}}},
                {
                    "$group": {
                        "_id": None,
                        "total_revenue": {"$sum": "$sale_value"},
                        "total_commission": {"$sum": "$commission_amount"}
                    }
                }
            ]
            
            result = await self.db.affiliate_conversions.aggregate(pipeline).to_list(1)
            totals = result[0] if result else {"total_revenue": 0, "total_commission": 0}
            
            # Get top performers
            top_performers = await self.db.affiliate_partners.find(
                {},
                {"_id": 0}
            ).sort("total_commission", -1).limit(5).to_list(5)
            
            # Get recent conversions
            recent_conversions = await self.db.affiliate_conversions.find(
                {},
                {"_id": 0}
            ).sort("converted_at", -1).limit(10).to_list(10)
            
            return AffiliateStats(
                total_clicks=clicks,
                total_conversions=conversions,
                conversion_rate=conversion_rate,
                total_revenue=totals["total_revenue"],
                total_commission=totals["total_commission"],
                top_performers=top_performers,
                recent_conversions=recent_conversions
            )
        except Exception as e:
            logger.error(f"Error getting affiliate stats: {str(e)}")
            return None