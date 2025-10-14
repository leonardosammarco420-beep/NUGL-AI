from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid
import logging

logger = logging.getLogger(__name__)

class SponsoredContent(BaseModel):
    """Sponsored article or content"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sponsor_id: str
    sponsor_name: str
    content_type: str  # 'article', 'strain', 'nft_listing', 'banner'
    title: str
    content: str
    image_url: Optional[str] = None
    cta_text: Optional[str] = None  # Call to action
    cta_url: Optional[str] = None
    target_category: str  # 'cannabis', 'crypto', 'ai'
    budget: float
    cost_per_impression: float = 0.01
    cost_per_click: float = 0.50
    impressions: int = 0
    clicks: int = 0
    total_spent: float = 0.0
    status: str = "active"  # active, paused, completed, expired
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FeaturedListing(BaseModel):
    """Featured/promoted strain or product"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    item_type: str  # 'strain', 'seed', 'nft'
    item_id: str
    sponsor_id: str
    position: int = 1  # Featured position (1 = top)
    duration_days: int
    price_paid: float
    impressions: int = 0
    clicks: int = 0
    status: str = "active"
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_date: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdImpression(BaseModel):
    """Track ad impressions"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_id: str
    content_type: str
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdClick(BaseModel):
    """Track ad clicks"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_id: str
    content_type: str
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SponsoredContentService:
    """Manage sponsored content and featured listings"""
    
    def __init__(self, db):
        self.db = db
    
    async def create_sponsored_content(self, content_data: dict):
        """Create new sponsored content"""
        try:
            content = SponsoredContent(**content_data)
            doc = content.model_dump()
            doc["start_date"] = doc["start_date"].isoformat()
            if doc.get("end_date"):
                doc["end_date"] = doc["end_date"].isoformat()
            doc["created_at"] = doc["created_at"].isoformat()
            
            await self.db.sponsored_content.insert_one(doc)
            logger.info(f"Created sponsored content: {content.id}")
            return content.id
        except Exception as e:
            logger.error(f"Error creating sponsored content: {str(e)}")
            raise
    
    async def create_featured_listing(self, listing_data: dict):
        """Create featured listing"""
        try:
            # Calculate end date
            start_date = datetime.now(timezone.utc)
            end_date = start_date + timedelta(days=listing_data.get("duration_days", 7))
            listing_data["end_date"] = end_date
            
            listing = FeaturedListing(**listing_data)
            doc = listing.model_dump()
            doc["start_date"] = doc["start_date"].isoformat()
            doc["end_date"] = doc["end_date"].isoformat()
            doc["created_at"] = doc["created_at"].isoformat()
            
            await self.db.featured_listings.insert_one(doc)
            logger.info(f"Created featured listing: {listing.id}")
            return listing.id
        except Exception as e:
            logger.error(f"Error creating featured listing: {str(e)}")
            raise
    
    async def track_impression(self, content_id: str, content_type: str, user_id: Optional[str] = None, ip_address: Optional[str] = None):
        """Track ad impression"""
        try:
            impression = AdImpression(
                content_id=content_id,
                content_type=content_type,
                user_id=user_id,
                ip_address=ip_address
            )
            
            doc = impression.model_dump()
            doc["timestamp"] = doc["timestamp"].isoformat()
            await self.db.ad_impressions.insert_one(doc)
            
            # Update content impressions and calculate cost
            if content_type == "sponsored":
                result = await self.db.sponsored_content.find_one({"id": content_id})
                if result:
                    new_impressions = result["impressions"] + 1
                    cost = result["cost_per_impression"]
                    new_spent = result["total_spent"] + cost
                    
                    await self.db.sponsored_content.update_one(
                        {"id": content_id},
                        {
                            "$set": {
                                "impressions": new_impressions,
                                "total_spent": new_spent
                            }
                        }
                    )
                    
                    # Check if budget exhausted
                    if new_spent >= result["budget"]:
                        await self.db.sponsored_content.update_one(
                            {"id": content_id},
                            {"$set": {"status": "completed"}}
                        )
            
            elif content_type == "featured":
                await self.db.featured_listings.update_one(
                    {"id": content_id},
                    {"$inc": {"impressions": 1}}
                )
        except Exception as e:
            logger.error(f"Error tracking impression: {str(e)}")
    
    async def track_click(self, content_id: str, content_type: str, user_id: Optional[str] = None, ip_address: Optional[str] = None):
        """Track ad click"""
        try:
            click = AdClick(
                content_id=content_id,
                content_type=content_type,
                user_id=user_id,
                ip_address=ip_address
            )
            
            doc = click.model_dump()
            doc["timestamp"] = doc["timestamp"].isoformat()
            await self.db.ad_clicks.insert_one(doc)
            
            # Update content clicks and calculate cost
            if content_type == "sponsored":
                result = await self.db.sponsored_content.find_one({"id": content_id})
                if result:
                    new_clicks = result["clicks"] + 1
                    cost = result["cost_per_click"]
                    new_spent = result["total_spent"] + cost
                    
                    await self.db.sponsored_content.update_one(
                        {"id": content_id},
                        {
                            "$set": {
                                "clicks": new_clicks,
                                "total_spent": new_spent
                            }
                        }
                    )
                    
                    # Check if budget exhausted
                    if new_spent >= result["budget"]:
                        await self.db.sponsored_content.update_one(
                            {"id": content_id},
                            {"$set": {"status": "completed"}}
                        )
            
            elif content_type == "featured":
                await self.db.featured_listings.update_one(
                    {"id": content_id},
                    {"$inc": {"clicks": 1}}
                )
        except Exception as e:
            logger.error(f"Error tracking click: {str(e)}")
    
    async def get_active_sponsored_content(self, category: Optional[str] = None, limit: int = 5):
        """Get active sponsored content"""
        try:
            query = {"status": "active"}
            if category:
                query["target_category"] = category
            
            content = await self.db.sponsored_content.find(
                query,
                {"_id": 0}
            ).limit(limit).to_list(limit)
            
            return content
        except Exception as e:
            logger.error(f"Error getting sponsored content: {str(e)}")
            return []
    
    async def get_featured_listings(self, item_type: str, limit: int = 3):
        """Get active featured listings"""
        try:
            now = datetime.now(timezone.utc).isoformat()
            content = await self.db.featured_listings.find(
                {
                    "item_type": item_type,
                    "status": "active",
                    "end_date": {"$gt": now}
                },
                {"_id": 0}
            ).sort("position", 1).limit(limit).to_list(limit)
            
            return content
        except Exception as e:
            logger.error(f"Error getting featured listings: {str(e)}")
            return []
    
    async def get_sponsor_analytics(self, sponsor_id: str):
        """Get analytics for sponsor"""
        try:
            # Get all content
            content = await self.db.sponsored_content.find(
                {"sponsor_id": sponsor_id},
                {"_id": 0}
            ).to_list(100)
            
            featured = await self.db.featured_listings.find(
                {"sponsor_id": sponsor_id},
                {"_id": 0}
            ).to_list(100)
            
            # Calculate totals
            total_spent = sum(c["total_spent"] for c in content)
            total_impressions = sum(c["impressions"] for c in content) + sum(f["impressions"] for f in featured)
            total_clicks = sum(c["clicks"] for c in content) + sum(f["clicks"] for f in featured)
            ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
            
            return {
                "total_campaigns": len(content) + len(featured),
                "total_spent": total_spent,
                "total_impressions": total_impressions,
                "total_clicks": total_clicks,
                "click_through_rate": ctr,
                "content": content,
                "featured": featured
            }
        except Exception as e:
            logger.error(f"Error getting sponsor analytics: {str(e)}")
            return None