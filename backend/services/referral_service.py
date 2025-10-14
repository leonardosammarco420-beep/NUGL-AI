from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import uuid
import secrets
import logging

logger = logging.getLogger(__name__)

class ReferralCode(BaseModel):
    """User referral code"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    code: str
    uses: int = 0
    max_uses: Optional[int] = None
    reward_type: str = "credits"  # credits, subscription_discount, cash
    reward_amount: float = 10.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None

class Referral(BaseModel):
    """Referral tracking"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    referrer_id: str  # User who referred
    referred_id: str  # User who was referred
    referral_code: str
    status: str = "pending"  # pending, completed, rewarded
    reward_amount: float
    reward_type: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

class ReferralReward(BaseModel):
    """Reward record"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    referral_id: str
    reward_type: str
    reward_amount: float
    status: str = "pending"  # pending, credited, paid
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    paid_at: Optional[datetime] = None

class ReferralService:
    """Manage referral program"""
    
    def __init__(self, db):
        self.db = db
    
    async def generate_referral_code(self, user_id: str, custom_code: Optional[str] = None):
        """Generate unique referral code for user"""
        try:
            # Check if user already has a code
            existing = await self.db.referral_codes.find_one({"user_id": user_id})
            if existing:
                return existing["code"]
            
            # Generate or use custom code
            if custom_code:
                # Check if custom code is available
                taken = await self.db.referral_codes.find_one({"code": custom_code})
                if taken:
                    raise ValueError("Code already taken")
                code = custom_code
            else:
                # Generate random code
                code = secrets.token_urlsafe(8).upper()[:8]
            
            referral_code = ReferralCode(
                user_id=user_id,
                code=code
            )
            
            doc = referral_code.model_dump()
            doc["created_at"] = doc["created_at"].isoformat()
            if doc.get("expires_at"):
                doc["expires_at"] = doc["expires_at"].isoformat()
            
            await self.db.referral_codes.insert_one(doc)
            logger.info(f"Generated referral code {code} for user {user_id}")
            return code
        except Exception as e:
            logger.error(f"Error generating referral code: {str(e)}")
            raise
    
    async def apply_referral_code(self, referred_user_id: str, referral_code: str):
        """Apply referral code when new user signs up"""
        try:
            # Find referral code
            code_doc = await self.db.referral_codes.find_one({"code": referral_code})
            if not code_doc:
                raise ValueError("Invalid referral code")
            
            # Check if code is still valid
            if code_doc.get("max_uses") and code_doc["uses"] >= code_doc["max_uses"]:
                raise ValueError("Referral code limit reached")
            
            if code_doc.get("expires_at"):
                expires = datetime.fromisoformat(code_doc["expires_at"])
                if datetime.now(timezone.utc) > expires:
                    raise ValueError("Referral code expired")
            
            # Create referral record
            referral = Referral(
                referrer_id=code_doc["user_id"],
                referred_id=referred_user_id,
                referral_code=referral_code,
                reward_amount=code_doc["reward_amount"],
                reward_type=code_doc["reward_type"]
            )
            
            doc = referral.model_dump()
            doc["created_at"] = doc["created_at"].isoformat()
            if doc.get("completed_at"):
                doc["completed_at"] = doc["completed_at"].isoformat()
            
            await self.db.referrals.insert_one(doc)
            
            # Increment code usage
            await self.db.referral_codes.update_one(
                {"code": referral_code},
                {"$inc": {"uses": 1}}
            )
            
            # Add referral metadata to user
            await self.db.users.update_one(
                {"id": referred_user_id},
                {"$set": {"referred_by": code_doc["user_id"], "referral_code_used": referral_code}}
            )
            
            logger.info(f"Applied referral code {referral_code} for user {referred_user_id}")
            return referral.id
        except Exception as e:
            logger.error(f"Error applying referral code: {str(e)}")
            raise
    
    async def complete_referral(self, referral_id: str):
        """Mark referral as completed and issue reward"""
        try:
            referral = await self.db.referrals.find_one({"id": referral_id})
            if not referral:
                raise ValueError("Referral not found")
            
            # Update referral status
            await self.db.referrals.update_one(
                {"id": referral_id},
                {
                    "$set": {
                        "status": "completed",
                        "completed_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            # Create reward for referrer
            reward = ReferralReward(
                user_id=referral["referrer_id"],
                referral_id=referral_id,
                reward_type=referral["reward_type"],
                reward_amount=referral["reward_amount"]
            )
            
            doc = reward.model_dump()
            doc["created_at"] = doc["created_at"].isoformat()
            if doc.get("paid_at"):
                doc["paid_at"] = doc["paid_at"].isoformat()
            
            await self.db.referral_rewards.insert_one(doc)
            
            # Credit reward based on type
            if referral["reward_type"] == "credits":
                await self.db.users.update_one(
                    {"id": referral["referrer_id"]},
                    {"$inc": {"credits": referral["reward_amount"]}}
                )
                
                # Update reward status
                await self.db.referral_rewards.update_one(
                    {"id": reward.id},
                    {"$set": {"status": "credited"}}
                )
            
            logger.info(f"Completed referral {referral_id} and issued reward")
            return True
        except Exception as e:
            logger.error(f"Error completing referral: {str(e)}")
            raise
    
    async def get_user_referrals(self, user_id: str):
        """Get user's referral statistics"""
        try:
            # Get referral code
            code = await self.db.referral_codes.find_one({"user_id": user_id}, {"_id": 0})
            
            # Get referrals made
            referrals = await self.db.referrals.find(
                {"referrer_id": user_id},
                {"_id": 0}
            ).to_list(100)
            
            # Get total rewards
            rewards = await self.db.referral_rewards.find(
                {"user_id": user_id},
                {"_id": 0}
            ).to_list(100)
            
            total_earned = sum(r["reward_amount"] for r in rewards if r["status"] == "credited")
            pending_rewards = sum(r["reward_amount"] for r in rewards if r["status"] == "pending")
            
            return {
                "referral_code": code,
                "total_referrals": len(referrals),
                "completed_referrals": len([r for r in referrals if r["status"] == "completed"]),
                "total_earned": total_earned,
                "pending_rewards": pending_rewards,
                "referrals": referrals,
                "rewards": rewards
            }
        except Exception as e:
            logger.error(f"Error getting user referrals: {str(e)}")
            raise