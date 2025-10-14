from apscheduler.schedulers.asyncio import AsyncIOScheduler
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from .data_aggregator import NewsAggregator, SentimentAnalyzer

logger = logging.getLogger(__name__)

class AutomationService:
    """Handles automated tasks like news aggregation"""
    
    def __init__(self, db):
        self.db = db
        self.scheduler = AsyncIOScheduler()
    
    async def update_news_feed(self):
        """Fetch and update news from RSS feeds"""
        try:
            logger.info("Starting news feed update...")
            articles = await NewsAggregator.aggregate_all_feeds()
            
            # Add sentiment analysis to each article
            for article in articles:
                sentiment_data = SentimentAnalyzer.analyze(
                    article['title'] + ' ' + article['content']
                )
                article.update(sentiment_data)
            
            # Insert new articles (avoid duplicates by checking title)
            inserted_count = 0
            for article in articles:
                existing = await self.db.news_articles.find_one({'title': article['title']})
                if not existing:
                    await self.db.news_articles.insert_one(article)
                    inserted_count += 1
            
            logger.info(f"News feed update complete. Inserted {inserted_count} new articles.")
        except Exception as e:
            logger.error(f"Error updating news feed: {str(e)}")
    
    async def update_crypto_prices(self):
        """Update crypto price data"""
        try:
            logger.info("Updating crypto prices...")
            from services.crypto_price_service import CryptoPriceService
            crypto_service = CryptoPriceService()
            prices = await crypto_service.get_live_prices()
            
            # Store in cache or database for quick access
            await self.db.crypto_prices.delete_many({})
            price_doc = {
                'data': prices,
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            await self.db.crypto_prices.insert_one(price_doc)
            
            logger.info(f"Crypto prices updated: {len(prices.get('crypto', []))} coins")
        except Exception as e:
            logger.error(f"Error updating crypto prices: {str(e)}")
    
    async def cleanup_old_data(self):
        """Clean up old data"""
        try:
            logger.info("Cleaning up old data...")
            # Delete news older than 30 days
            from datetime import datetime, timedelta, timezone
            cutoff_date = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
            result = await self.db.news_articles.delete_many({
                'published_at': {'$lt': cutoff_date}
            })
            logger.info(f"Deleted {result.deleted_count} old articles.")
        except Exception as e:
            logger.error(f"Error cleaning up old data: {str(e)}")
    
    def start(self):
        """Start automated tasks"""
        # Update news every hour
        self.scheduler.add_job(
            self.update_news_feed,
            'interval',
            hours=1,
            id='update_news'
        )
        
        # Update crypto prices every 5 minutes
        self.scheduler.add_job(
            self.update_crypto_prices,
            'interval',
            minutes=5,
            id='update_crypto'
        )
        
        # Cleanup old data daily
        self.scheduler.add_job(
            self.cleanup_old_data,
            'interval',
            days=1,
            id='cleanup_data'
        )
        
        self.scheduler.start()
        logger.info("Automation service started")
    
    def stop(self):
        """Stop automated tasks"""
        self.scheduler.shutdown()
        logger.info("Automation service stopped")