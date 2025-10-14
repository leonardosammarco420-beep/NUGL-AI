from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
from fastapi.responses import Response
from services.cache_service import cache_service
from services.email_service import EmailService


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret')
JWT_ALGORITHM = "HS256"

# Initialize services
email_service = EmailService()

# Initialize monetization services
from services.affiliate_service import AffiliateTrackingService
from services.subscription_service import SubscriptionService
from services.referral_service import ReferralService
from services.crypto_price_service import CryptoPriceService

# Initialize crypto price service
crypto_price_service = CryptoPriceService()

from services.sponsored_content_service import SponsoredContentService



# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: Optional[str] = None
    username: Optional[str] = None
    password_hash: Optional[str] = None
    wallet_address: Optional[str] = None
    auth_method: str = "jwt"  # jwt, google, web3
    saved_articles: List[str] = []
    nft_portfolio: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: Optional[EmailStr] = None
    username: str
    password: Optional[str] = None
    wallet_address: Optional[str] = None
    auth_method: str = "jwt"

class UserLogin(BaseModel):
    username: str
    password: str

class Web3Login(BaseModel):
    wallet_address: str
    signature: str

class NewsArticle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    category: str  # cannabis, crypto, ai
    image_url: Optional[str] = None
    source_url: Optional[str] = None
    source_name: Optional[str] = None  # Leafly, Seedsman, etc.
    affiliate_link: Optional[str] = None  # Affiliate tracking link
    published_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    trending_score: float = 0.0
    sentiment: Optional[str] = 'neutral'  # bullish, bearish, neutral
    sentiment_score: Optional[int] = 50
    impact: Optional[str] = 'low'  # high, medium, low

class NewsArticleCreate(BaseModel):
    title: str
    content: str
    category: str
    image_url: Optional[str] = None
    source_url: Optional[str] = None

class Strain(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # indica, sativa, hybrid
    thc_content: Optional[float] = None
    cbd_content: Optional[float] = None
    description: str
    effects: List[str] = []
    flavors: List[str] = []
    affiliate_links: List[dict] = []  # {"dispensary": str, "url": str, "location": str}

class StrainCreate(BaseModel):
    name: str
    type: str
    thc_content: Optional[float] = None
    cbd_content: Optional[float] = None
    description: str
    effects: List[str] = []
    flavors: List[str] = []
    affiliate_links: List[dict] = []

class Seed(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    strain_type: str
    description: str
    price_range: str
    affiliate_links: List[dict] = []  # {"wholesaler": str, "url": str}

class SeedCreate(BaseModel):
    name: str
    strain_type: str
    description: str
    price_range: str
    affiliate_links: List[dict] = []

class NFT(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    token_id: str
    name: str
    description: str
    image_url: str
    blockchain: str  # ethereum, solana
    contract_address: Optional[str] = None
    owner_address: str
    price: Optional[float] = None
    currency: str = "ETH"
    is_for_sale: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NFTCreate(BaseModel):
    token_id: str
    name: str
    description: str
    image_url: str
    blockchain: str
    contract_address: Optional[str] = None
    owner_address: str
    price: Optional[float] = None
    currency: str = "ETH"
    is_for_sale: bool = False

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # nft_purchase, wallet_transfer
    amount: float
    currency: str
    tx_hash: Optional[str] = None
    status: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TransactionCreate(BaseModel):
    user_id: str
    type: str
    amount: float
    currency: str
    tx_hash: Optional[str] = None
    status: str

# Helper Functions
def create_jwt_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["user_id"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    return verify_jwt_token(token)

# Auth Routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    if user_data.email:
        existing = await db.users.find_one({"email": user_data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    if user_data.username:
        existing = await db.users.find_one({"username": user_data.username})
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    user_dict = user_data.model_dump()
    if user_data.password:
        password_hash = bcrypt.hashpw(user_data.password.encode(), bcrypt.gensalt())
        user_dict["password_hash"] = password_hash.decode()
        del user_dict["password"]
    
    user = User(**user_dict)
    doc = user.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.users.insert_one(doc)
    
    # Send welcome email
    if user.email:
        try:
            await email_service.send_welcome_email(user.email, user.username)
        except Exception as e:
            logger.error(f"Failed to send welcome email: {str(e)}")
    
    token = create_jwt_token(user.id)
    return {"token": token, "user_id": user.id, "username": user.username}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"username": credentials.username})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Invalid login method")
    
    if not bcrypt.checkpw(credentials.password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user["id"])
    return {"token": token, "user_id": user["id"], "username": user["username"]}

@api_router.post("/auth/web3")
async def web3_auth(login_data: Web3Login):
    # In production, verify signature here
    user = await db.users.find_one({"wallet_address": login_data.wallet_address})
    
    if not user:
        # Create new user
        user_create = UserCreate(
            username=login_data.wallet_address[:10],
            wallet_address=login_data.wallet_address,
            auth_method="web3"
        )
        user_dict = user_create.model_dump()
        user = User(**user_dict)
        doc = user.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        await db.users.insert_one(doc)
        user_id = user.id
    else:
        user_id = user["id"]
    
    token = create_jwt_token(user_id)
    return {"token": token, "user_id": user_id, "wallet_address": login_data.wallet_address}

@api_router.get("/auth/me")
async def get_me(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.get("/users/wallet/{wallet_address}")
async def get_user_by_wallet(wallet_address: str):
    # Check users collection first
    user = await db.users.find_one({"wallet_address": wallet_address}, {"_id": 0, "password_hash": 0})
    if user:
        return user
    
    # Check wallet_users collection
    user = await db.wallet_users.find_one({"wallet_address": wallet_address}, {"_id": 0})
    if user:
        return user
    
    raise HTTPException(status_code=404, detail="User not found")

# News Routes
@api_router.get("/news", response_model=List[NewsArticle])
async def get_news(category: Optional[str] = None, limit: int = 50):
    query = {}
    if category:
        query["category"] = category
    
    articles = await db.news_articles.find(query, {"_id": 0}).sort("published_at", -1).to_list(limit)
    for article in articles:
        if isinstance(article.get("published_at"), str):
            article["published_at"] = datetime.fromisoformat(article["published_at"])
    return articles

@api_router.post("/news", response_model=NewsArticle)
async def create_news(article: NewsArticleCreate, user_id: str = Depends(get_current_user)):
    news = NewsArticle(**article.model_dump())
    doc = news.model_dump()
    doc["published_at"] = doc["published_at"].isoformat()
    await db.news_articles.insert_one(doc)
    return news

@api_router.get("/news/trending", response_model=List[NewsArticle])
async def get_trending_news():
    articles = await db.news_articles.find({}, {"_id": 0}).sort("trending_score", -1).limit(10).to_list(10)
    for article in articles:
        if isinstance(article.get("published_at"), str):
            article["published_at"] = datetime.fromisoformat(article["published_at"])
    return articles

@api_router.post("/news/refresh")
async def refresh_news():
    """Manually trigger news refresh from all RSS feeds"""
    try:
        from services.data_aggregator import NewsAggregator, SentimentAnalyzer
        
        # Fetch articles from all feeds
        articles = await NewsAggregator.aggregate_all_feeds()
        
        # Add sentiment analysis
        for article in articles:
            sentiment_data = SentimentAnalyzer.analyze(
                article['title'] + ' ' + article.get('content', '')
            )
            article.update(sentiment_data)
        
        # Insert new articles (avoid duplicates)
        inserted_count = 0
        for article in articles:
            existing = await db.news_articles.find_one({'title': article['title']})
            if not existing:
                await db.news_articles.insert_one(article)
                inserted_count += 1
        
        return {
            'success': True,
            'message': f'Refreshed news feed. Added {inserted_count} new articles.',
            'total_fetched': len(articles),
            'new_articles': inserted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Press Release Routes
class PressRelease(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    media_source: str
    link: str
    published_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

@api_router.get("/press-releases")
async def get_press_releases():
    releases = await db.press_releases.find({}, {"_id": 0}).sort("published_at", -1).to_list(1000)
    return releases

@api_router.post("/press-releases")
async def create_press_release(release: PressRelease):
    release_dict = release.dict()
    await db.press_releases.insert_one(release_dict)
    return {"success": True, "id": release.id}

# Strain Routes
@api_router.get("/strains", response_model=List[Strain])
async def get_strains(search: Optional[str] = None, strain_type: Optional[str] = None):
    query = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if strain_type:
        query["type"] = strain_type
    
    strains = await db.strains.find(query, {"_id": 0}).to_list(100)
    return strains

@api_router.post("/strains", response_model=Strain)
async def create_strain(strain: StrainCreate, user_id: str = Depends(get_current_user)):
    strain_obj = Strain(**strain.model_dump())
    doc = strain_obj.model_dump()
    await db.strains.insert_one(doc)
    return strain_obj

@api_router.get("/strains/{strain_id}", response_model=Strain)
async def get_strain(strain_id: str):
    strain = await db.strains.find_one({"id": strain_id}, {"_id": 0})
    if not strain:
        raise HTTPException(status_code=404, detail="Strain not found")
    return strain

# Seed Routes
@api_router.get("/seeds", response_model=List[Seed])
async def get_seeds(search: Optional[str] = None):
    query = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    seeds = await db.seeds.find(query, {"_id": 0}).to_list(100)
    return seeds

@api_router.post("/seeds", response_model=Seed)
async def create_seed(seed: SeedCreate, user_id: str = Depends(get_current_user)):
    seed_obj = Seed(**seed.model_dump())
    doc = seed_obj.model_dump()
    await db.seeds.insert_one(doc)
    return seed_obj

# NFT Routes
@api_router.get("/nfts")
async def get_nfts(
    blockchain: Optional[str] = None, 
    for_sale: Optional[bool] = None,
    category: Optional[str] = None
):
    query = {}
    if blockchain:
        query["blockchain"] = blockchain
    if for_sale is not None:
        query["is_for_sale"] = for_sale
    if category and category != 'all' and category != 'trending':
        query["category"] = category
    
    nfts = await db.nfts.find(query, {"_id": 0}).to_list(100)
    
    # Sort by trending if requested
    if category == 'trending':
        nfts = sorted(nfts, key=lambda x: x.get('views', 0) + x.get('likes', 0) * 2, reverse=True)
    
    # Convert datetime to string for JSON serialization
    for nft in nfts:
        if isinstance(nft.get("created_at"), datetime):
            nft["created_at"] = nft["created_at"].isoformat()
    
    return nfts

@api_router.post("/nfts", response_model=NFT)
async def create_nft(nft: NFTCreate, user_id: str = Depends(get_current_user)):
    nft_obj = NFT(**nft.model_dump())
    doc = nft_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.nfts.insert_one(doc)
    return nft_obj

@api_router.get("/nfts/{nft_id}", response_model=NFT)
async def get_nft(nft_id: str):
    nft = await db.nfts.find_one({"id": nft_id}, {"_id": 0})
    if not nft:
        raise HTTPException(status_code=404, detail="NFT not found")
    if isinstance(nft.get("created_at"), str):
        nft["created_at"] = datetime.fromisoformat(nft["created_at"])
    return nft

@api_router.post("/nfts/{nft_id}/purchase")
async def purchase_nft(nft_id: str, purchase_data: dict):
    """Purchase an NFT with crypto wallet"""
    nft = await db.nfts.find_one({"id": nft_id})
    if not nft:
        raise HTTPException(status_code=404, detail="NFT not found")
    
    if nft.get("owner"):
        raise HTTPException(status_code=400, detail="NFT already sold")
    
    # Update NFT ownership
    await db.nfts.update_one(
        {"id": nft_id},
        {"$set": {"owner": purchase_data.get("buyer")}}
    )
    
    # Record transaction
    transaction = {
        "id": str(uuid.uuid4()),
        "nft_id": nft_id,
        "nft_name": nft.get("name"),
        "buyer": purchase_data.get("buyer"),
        "seller": nft.get("creator"),
        "price": purchase_data.get("price"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "transaction_hash": f"0x{uuid.uuid4().hex}"  # Simulated tx hash
    }
    await db.nft_transactions.insert_one(transaction)
    
    return {"success": True, "message": "NFT purchased successfully", "transaction": transaction}

@api_router.get("/wallet/user/{wallet_address}")
async def get_wallet_user(wallet_address: str):
    """Get user info by wallet address"""
    user = await db.wallet_users.find_one(
        {"wallet_address": wallet_address},
        {"_id": 0}
    )
    
    if not user:
        # Create new user on first connection
        user = {
            "wallet_address": wallet_address,
            "credits": 500,  # Starting credits
            "username": f"User {wallet_address[:6]}",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "nfts_owned": [],
            "purchases": []
        }
        await db.wallet_users.insert_one(user)
    
    return user

@api_router.get("/affiliate/dashboard")
async def get_affiliate_dashboard():
    """Get affiliate dashboard stats"""
    # Get all clicks
    clicks = await db.affiliate_clicks.find({}, {"_id": 0}).to_list(1000)
    
    # Calculate metrics
    total_clicks = len(clicks)
    total_conversions = sum(1 for c in clicks if c.get('converted'))
    total_revenue = sum(c.get('revenue', 0) for c in clicks if c.get('converted'))
    conversion_rate = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0
    
    # Partner performance
    partner_stats = {}
    for click in clicks:
        pid = click.get('partner_id')
        if pid not in partner_stats:
            partner_stats[pid] = {
                'partner_id': pid,
                'partner_name': click.get('partner_name'),
                'clicks': 0,
                'conversions': 0,
                'revenue': 0
            }
        partner_stats[pid]['clicks'] += 1
        if click.get('converted'):
            partner_stats[pid]['conversions'] += 1
            partner_stats[pid]['revenue'] += click.get('revenue', 0)
    
    # Recent clicks (last 10)
    recent_clicks = sorted(clicks, key=lambda x: x.get('clicked_at', ''), reverse=True)[:10]
    
    return {
        'summary': {
            'total_clicks': total_clicks,
            'total_conversions': total_conversions,
            'total_revenue': round(total_revenue, 2),
            'conversion_rate': round(conversion_rate, 1),
            'avg_commission': round(total_revenue / total_conversions, 2) if total_conversions > 0 else 0
        },
        'partners': sorted(partner_stats.values(), key=lambda x: x['revenue'], reverse=True),
        'recent_activity': recent_clicks
    }

@api_router.post("/affiliate/track-click")
async def track_affiliate_click(click_data: dict):
    """Track an affiliate link click"""
    click = {
        'id': str(uuid.uuid4()),
        'partner_id': click_data.get('partner_id'),
        'partner_name': click_data.get('partner_name'),
        'source_page': click_data.get('source_page'),
        'clicked_at': datetime.now(timezone.utc).isoformat(),
        'converted': False,
        'revenue': 0
    }
    
    await db.affiliate_clicks.insert_one(click)
    return {'success': True, 'click_id': click['id']}

# AI Chatbot Route
@api_router.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    session_id = message.session_id or str(uuid.uuid4())
    
    try:
        # Initialize LLM Chat
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message="You are a knowledgeable cannabis expert assistant for nugl.com. You provide accurate, helpful information about cannabis strains, effects, growing, legality, and related topics. You're friendly, professional, and always emphasize responsible use and legal compliance."
        )
        
        # Use GPT-5 model
        chat.with_model("openai", "gpt-5")
        
        # Send message
        user_msg = UserMessage(text=message.message)
        response = await chat.send_message(user_msg)
        
        # Store chat history
        chat_doc = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "user_message": message.message,
            "bot_response": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.chat_history.insert_one(chat_doc)
        
        return ChatResponse(response=response, session_id=session_id)
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")

# Transaction Routes
@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction: TransactionCreate, user_id: str = Depends(get_current_user)):
    tx = Transaction(**transaction.model_dump())
    doc = tx.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.transactions.insert_one(doc)
    return tx

@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(user_id: str = Depends(get_current_user)):
    transactions = await db.transactions.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    for tx in transactions:
        if isinstance(tx.get("created_at"), str):
            tx["created_at"] = datetime.fromisoformat(tx["created_at"])
    return transactions

# User Actions
@api_router.post("/users/save-article")
async def save_article(article_id: str, user_id: str = Depends(get_current_user)):
    await db.users.update_one(
        {"id": user_id},
        {"$addToSet": {"saved_articles": article_id}}
    )
    return {"success": True}

@api_router.get("/users/saved-articles")
async def get_saved_articles(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "saved_articles": 1})
    if not user:
        return {"saved_articles": []}
    
    article_ids = user.get("saved_articles", [])
    articles = await db.news_articles.find({"id": {"$in": article_ids}}, {"_id": 0}).to_list(100)
    return {"saved_articles": articles}

# Admin Routes
@api_router.get("/admin/stats")
async def get_admin_stats(user_id: str = Depends(get_current_user)):
    # In production, add admin role check
    stats = {
        "total_users": await db.users.count_documents({}),
        "total_articles": await db.news_articles.count_documents({}),
        "total_strains": await db.strains.count_documents({}),
        "total_nfts": await db.nfts.count_documents({}),
        "total_transactions": await db.transactions.count_documents({}),
    }
    return stats

@api_router.get("/investor/quarterly-data")
async def get_quarterly_data():
    """Get quarterly financial data for investor relations"""
    # This data should be stored in database and updated by admin
    # For now, returning hardcoded data - in production, fetch from DB
    quarterly_data = [
        {
            "quarter": "Q2 2024",
            "date": "06/30/2024",
            "revenue": 708,
            "growth": "-",
            "transactions": 1250
        },
        {
            "quarter": "Q3 2024",
            "date": "09/30/2024",
            "revenue": 726,
            "growth": "+2.5%",
            "transactions": 1420
        },
        {
            "quarter": "Q4 2024",
            "date": "12/31/2024",
            "revenue": 936,
            "growth": "+28.9%",
            "transactions": 2340
        },
        {
            "quarter": "Q1 2025",
            "date": "03/31/2025",
            "revenue": 751,
            "growth": "-19.8%",
            "transactions": 1880
        },
        {
            "quarter": "Q2 2025",
            "date": "06/30/2025",
            "revenue": 866,
            "growth": "+15.3%",
            "transactions": 2156
        }
    ]
    return {"quarterly_data": quarterly_data}

# Affiliate Links
@api_router.get("/affiliates/stake-casino")
async def get_stake_link():
    return {"url": os.environ.get('STAKE_CASINO_AFFILIATE_LINK', 'https://stake.com')}


# Social Features - Reviews
class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    item_id: str
    item_type: str  # 'strain', 'nft', 'seed'
    rating: int  # 1-5
    title: str
    content: str
    helpful_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    item_id: str
    item_type: str
    rating: int
    title: str
    content: str

@api_router.post("/reviews", response_model=Review)
async def create_review(review_data: ReviewCreate, user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "username": 1})
    review = Review(**review_data.model_dump(), user_id=user_id, username=user.get("username", "Anonymous"))
    doc = review.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.reviews.insert_one(doc)
    return review

@api_router.get("/reviews/{item_id}", response_model=List[Review])
async def get_reviews(item_id: str):
    reviews = await db.reviews.find({"item_id": item_id}, {"_id": 0}).to_list(100)
    for review in reviews:
        if isinstance(review.get("created_at"), str):
            review["created_at"] = datetime.fromisoformat(review["created_at"])
    return reviews

# Social Features - Comments
class Comment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    item_id: str
    item_type: str
    content: str
    likes: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CommentCreate(BaseModel):
    item_id: str
    item_type: str
    content: str

@api_router.post("/comments", response_model=Comment)
async def create_comment(comment_data: CommentCreate, user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "username": 1})
    comment = Comment(**comment_data.model_dump(), user_id=user_id, username=user.get("username", "Anonymous"))
    doc = comment.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.comments.insert_one(doc)
    return comment

@api_router.get("/comments/{item_id}", response_model=List[Comment])
async def get_comments(item_id: str):
    comments = await db.comments.find({"item_id": item_id}, {"_id": 0}).to_list(100)
    for comment in comments:
        if isinstance(comment.get("created_at"), str):
            comment["created_at"] = datetime.fromisoformat(comment["created_at"])
    return comments

@api_router.post("/comments/{comment_id}/like")
async def like_comment(comment_id: str, user_id: str = Depends(get_current_user)):
    await db.comments.update_one({"id": comment_id}, {"$inc": {"likes": 1}})
    return {"success": True}

# Social Features - Follow System
@api_router.post("/users/{following_id}/follow")
async def follow_user(following_id: str, user_id: str = Depends(get_current_user)):
    follow_doc = {
        "id": str(uuid.uuid4()),
        "follower_id": user_id,
        "following_id": following_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.follows.insert_one(follow_doc)
    return {"success": True}

@api_router.delete("/users/{following_id}/unfollow")
async def unfollow_user(following_id: str, user_id: str = Depends(get_current_user)):
    await db.follows.delete_one({"follower_id": user_id, "following_id": following_id})
    return {"success": True}

@api_router.get("/users/{user_id}/followers")
async def get_followers(user_id: str):
    followers = await db.follows.find({"following_id": user_id}, {"_id": 0}).to_list(100)
    return {"followers": followers}

@api_router.get("/users/{user_id}/following")
async def get_following(user_id: str):
    following = await db.follows.find({"follower_id": user_id}, {"_id": 0}).to_list(100)
    return {"following": following}

# Notification System
class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str
    message: str
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(user_id: str = Depends(get_current_user)):
    notifications = await db.notifications.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(50)
    for notif in notifications:
        if isinstance(notif.get("created_at"), str):
            notif["created_at"] = datetime.fromisoformat(notif["created_at"])
    return notifications

@api_router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user_id: str = Depends(get_current_user)):
    await db.notifications.update_one({"id": notification_id, "user_id": user_id}, {"$set": {"read": True}})
    return {"success": True}

# Price Alerts
class PriceAlert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    asset_type: str  # 'crypto', 'nft'
    asset_id: str
    target_price: float
    condition: str  # 'above', 'below'
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PriceAlertCreate(BaseModel):
    asset_type: str
    asset_id: str
    target_price: float
    condition: str

@api_router.post("/price-alerts", response_model=PriceAlert)
async def create_price_alert(alert_data: PriceAlertCreate, user_id: str = Depends(get_current_user)):
    alert = PriceAlert(**alert_data.model_dump(), user_id=user_id)
    doc = alert.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.price_alerts.insert_one(doc)
    return alert

@api_router.get("/price-alerts", response_model=List[PriceAlert])
async def get_price_alerts(user_id: str = Depends(get_current_user)):
    alerts = await db.price_alerts.find({"user_id": user_id, "active": True}, {"_id": 0}).to_list(100)
    for alert in alerts:
        if isinstance(alert.get("created_at"), str):
            alert["created_at"] = datetime.fromisoformat(alert["created_at"])
    return alerts


# ============================================
# MONETIZATION ENDPOINTS
# ============================================

# Affiliate Tracking
@api_router.post("/affiliate/track-click")
async def track_affiliate_click(
    affiliate_link: str,
    affiliate_type: str,
    item_id: Optional[str] = None,
    user_id: Optional[str] = None
):
    """Track affiliate link click"""
    affiliate_service = AffiliateTrackingService(db)
    click_data = {
        "affiliate_link": affiliate_link,
        "affiliate_type": affiliate_type,
        "item_id": item_id,
        "user_id": user_id
    }
    click_id = await affiliate_service.track_click(click_data)
    return {"click_id": click_id, "success": True}

@api_router.post("/affiliate/record-conversion")
async def record_affiliate_conversion(
    click_id: str,
    sale_value: float,
    commission_rate: float,
    user_id: str = Depends(get_current_user)
):
    """Record affiliate conversion"""
    affiliate_service = AffiliateTrackingService(db)
    conversion_id = await affiliate_service.record_conversion(click_id, sale_value, commission_rate)
    return {"conversion_id": conversion_id, "success": True}

@api_router.get("/affiliate/stats")
async def get_affiliate_stats(days: int = 30, user_id: str = Depends(get_current_user)):
    """Get affiliate statistics"""
    affiliate_service = AffiliateTrackingService(db)
    stats = await affiliate_service.get_affiliate_stats(days)
    return stats

# Subscription Management
@api_router.get("/subscriptions/plans")
async def get_subscription_plans():
    """Get all subscription plans"""
    subscription_service = SubscriptionService(db)
    return {
        "plans": [
            plan.model_dump() for plan in subscription_service.PLANS.values()
        ]
    }

@api_router.post("/subscriptions/create-checkout")
async def create_subscription_checkout(
    plan_id: str,
    user_id: str = Depends(get_current_user)
):
    """Create Stripe checkout session"""
    subscription_service = SubscriptionService(db)
    success_url = "https://nugl.com/subscription/success"
    cancel_url = "https://nugl.com/subscription/cancel"
    
    try:
        session = await subscription_service.create_checkout_session(
            user_id, plan_id, success_url, cancel_url
        )
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/subscriptions/current")
async def get_current_subscription(user_id: str = Depends(get_current_user)):
    """Get user's current subscription"""
    subscription_service = SubscriptionService(db)
    subscription = await subscription_service.get_user_subscription(user_id)
    return subscription or {"plan": "free"}

@api_router.post("/subscriptions/cancel")
async def cancel_subscription(user_id: str = Depends(get_current_user)):
    """Cancel user subscription"""
    subscription_service = SubscriptionService(db)
    success = await subscription_service.cancel_user_subscription(user_id)
    return {"success": success}

@api_router.post("/subscriptions/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    subscription_service = SubscriptionService(db)
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        import stripe
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.environ.get('STRIPE_WEBHOOK_SECRET')
        )
        await subscription_service.handle_webhook(event)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Referral System
@api_router.get("/referrals/my-code")
async def get_my_referral_code(user_id: str = Depends(get_current_user)):
    """Get user's referral code"""
    referral_service = ReferralService(db)
    code = await referral_service.generate_referral_code(user_id)
    return {"referral_code": code}

@api_router.post("/referrals/apply")
async def apply_referral_code(
    referral_code: str,
    user_id: str = Depends(get_current_user)
):
    """Apply referral code"""
    referral_service = ReferralService(db)
    try:
        referral_id = await referral_service.apply_referral_code(user_id, referral_code)
        return {"success": True, "referral_id": referral_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/referrals/stats")
async def get_referral_stats(user_id: str = Depends(get_current_user)):
    """Get user's referral statistics"""
    referral_service = ReferralService(db)
    stats = await referral_service.get_user_referrals(user_id)
    return stats

@api_router.post("/referrals/{referral_id}/complete")
async def complete_referral(referral_id: str, user_id: str = Depends(get_current_user)):
    """Complete referral and issue reward"""
    referral_service = ReferralService(db)
    success = await referral_service.complete_referral(referral_id)
    return {"success": success}

# Sponsored Content
@api_router.post("/sponsored/content")
async def create_sponsored_content(content_data: dict, user_id: str = Depends(get_current_user)):
    """Create sponsored content"""
    sponsored_service = SponsoredContentService(db)
    content_id = await sponsored_service.create_sponsored_content(content_data)
    return {"content_id": content_id, "success": True}

@api_router.post("/sponsored/featured")
async def create_featured_listing(listing_data: dict, user_id: str = Depends(get_current_user)):
    """Create featured listing"""
    sponsored_service = SponsoredContentService(db)
    listing_id = await sponsored_service.create_featured_listing(listing_data)
    return {"listing_id": listing_id, "success": True}

@api_router.get("/sponsored/content")
async def get_sponsored_content(category: Optional[str] = None, limit: int = 5):
    """Get active sponsored content"""
    sponsored_service = SponsoredContentService(db)
    content = await sponsored_service.get_active_sponsored_content(category, limit)
    return {"content": content}

@api_router.get("/sponsored/featured/{item_type}")
async def get_featured_listings(item_type: str, limit: int = 3):
    """Get featured listings"""
    sponsored_service = SponsoredContentService(db)
    listings = await sponsored_service.get_featured_listings(item_type, limit)
    return {"listings": listings}

@api_router.post("/sponsored/track/impression")
async def track_sponsored_impression(
    content_id: str,
    content_type: str,
    user_id: Optional[str] = None
):
    """Track sponsored content impression"""
    sponsored_service = SponsoredContentService(db)
    await sponsored_service.track_impression(content_id, content_type, user_id)
    return {"success": True}

@api_router.post("/sponsored/track/click")
async def track_sponsored_click(
    content_id: str,
    content_type: str,
    user_id: Optional[str] = None
):
    """Track sponsored content click"""
    sponsored_service = SponsoredContentService(db)
    await sponsored_service.track_click(content_id, content_type, user_id)
    return {"success": True}

@api_router.get("/sponsored/analytics/{sponsor_id}")
async def get_sponsor_analytics(sponsor_id: str, user_id: str = Depends(get_current_user)):
    """Get sponsor analytics"""
    sponsored_service = SponsoredContentService(db)
    analytics = await sponsored_service.get_sponsor_analytics(sponsor_id)
    return analytics

# ============================================
# CRYPTO PRICE ENDPOINTS
# ============================================

@api_router.get("/crypto/prices")
async def get_crypto_prices(coin_ids: Optional[str] = None):
    """Get live crypto prices from CoinGecko"""
    coin_list = coin_ids.split(',') if coin_ids else None
    prices = await crypto_price_service.get_live_prices(coin_list)
    return prices

@api_router.get("/crypto/price/{coin_id}")
async def get_coin_price(coin_id: str):
    """Get price for specific cryptocurrency"""
    price = await crypto_price_service.get_coin_price(coin_id)
    if not price:
        raise HTTPException(status_code=404, detail="Coin not found")
    return price

@api_router.get("/crypto/historical/{coin_id}")
async def get_historical_prices(coin_id: str, days: int = 30):
    """Get historical price data"""
    history = await crypto_price_service.get_historical_prices(coin_id, days)
    return {"coin_id": coin_id, "days": days, "prices": history}

@api_router.get("/crypto/trending")
async def get_trending_coins():
    """Get trending cryptocurrencies"""
    trending = await crypto_price_service.get_trending_coins()
    return {"trending": trending}

@api_router.post("/crypto/portfolio-value")
async def calculate_portfolio_value(holdings: List[dict], user_id: str = Depends(get_current_user)):
    """Calculate portfolio value based on current prices"""
    result = await crypto_price_service.calculate_portfolio_value(holdings)
    return result

@api_router.get("/ticker")
async def get_live_ticker():
    """Get live ticker data for crypto and cannabis stocks"""
    try:
        # Get crypto prices
        crypto_symbols = ['bitcoin', 'ethereum', 'solana']
        crypto_prices = await crypto_price_service.get_live_prices(crypto_symbols)
        
        ticker_data = []
        
        # Add crypto data
        if 'crypto' in crypto_prices and isinstance(crypto_prices['crypto'], list):
            for coin in crypto_prices['crypto']:
                ticker_data.append({
                    'symbol': coin['symbol'],
                    'price': coin['price'],
                    'change': coin.get('change_24h', 0),
                    'type': 'crypto'
                })
        
        # Add cannabis stock data (NUGL, AUXLY, TLRY, CGC)
        # Note: These are simulated for now - integrate with real stock API for production
        cannabis_stocks = [
            {'symbol': 'NUGL', 'price': 0.12, 'change': 8.5, 'type': 'stock'},
            {'symbol': 'AUXLY', 'price': 0.045, 'change': -3.2, 'type': 'stock'},
            {'symbol': 'TLRY', 'price': 3.45, 'change': -2.1, 'type': 'stock'},
            {'symbol': 'CGC', 'price': 7.23, 'change': 3.8, 'type': 'stock'},
        ]
        
        ticker_data.extend(cannabis_stocks)
        
        return {'ticker': ticker_data}
    except Exception as e:
        logger.error(f"Error fetching ticker data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch ticker data")

@api_router.get("/media/legacy/{category}")
async def get_legacy_media_content(category: str):
    """Get legacy content from nugl.com for a specific category"""
    try:
        # Fetch articles for the category
        articles = await db.legacy_articles.find(
            {'category_id': category},
            {'_id': 0}
        ).to_list(length=100)
        
        # Fetch category info
        category_info = await db.legacy_categories.find_one(
            {'category_id': category},
            {'_id': 0}
        )
        
        return {
            'category': category_info,
            'articles': articles
        }
    except Exception as e:
        logger.error(f"Error fetching legacy content: {str(e)}")
        return {'category': None, 'articles': []}

# ============================================

# Include the router in the main app

# SEO Endpoints (no /api prefix)
@app.get("/sitemap.xml", response_class=Response)
async def get_sitemap():
    """Generate XML sitemap for SEO"""
    base_url = "https://nugl.com"
    
    urls = [
        {'loc': f"{base_url}/", 'changefreq': 'daily', 'priority': '1.0'},
        {'loc': f"{base_url}/news", 'changefreq': 'hourly', 'priority': '0.9'},
        {'loc': f"{base_url}/strains", 'changefreq': 'weekly', 'priority': '0.8'},
        {'loc': f"{base_url}/seeds", 'changefreq': 'weekly', 'priority': '0.8'},
        {'loc': f"{base_url}/nft-marketplace", 'changefreq': 'daily', 'priority': '0.8'},
        {'loc': f"{base_url}/chat", 'changefreq': 'monthly', 'priority': '0.7'},
        {'loc': f"{base_url}/wallet", 'changefreq': 'monthly', 'priority': '0.7'},
        {'loc': f"{base_url}/shop", 'changefreq': 'daily', 'priority': '0.8'},
        {'loc': f"{base_url}/portfolio", 'changefreq': 'daily', 'priority': '0.7'},
    ]
    
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n'
    
    for url in urls:
        xml_content += '  <url>\\n'
        xml_content += f'    <loc>{url["loc"]}</loc>\\n'
        xml_content += f'    <lastmod>{datetime.now(timezone.utc).date().isoformat()}</lastmod>\\n'
        xml_content += f'    <changefreq>{url["changefreq"]}</changefreq>\\n'
        xml_content += f'    <priority>{url["priority"]}</priority>\\n'
        xml_content += '  </url>\\n'
    
    xml_content += '</urlset>'
    
    return Response(content=xml_content, media_type="application/xml")

@app.get("/robots.txt", response_class=Response)
async def get_robots():
    """Generate robots.txt for SEO"""
    content = """User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://nugl.com/sitemap.xml
"""
    return Response(content=content, media_type="text/plain")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize automation service
from services.automation import AutomationService
automation_service = None

@app.on_event("startup")
async def startup_event():
    global automation_service
    automation_service = AutomationService(db)
    automation_service.start()
    logger.info("Application started with automation service")

@app.on_event("shutdown")
async def shutdown_db_client():
    if automation_service:
        automation_service.stop()
    client.close()