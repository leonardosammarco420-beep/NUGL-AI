import feedparser
import asyncio
from datetime import datetime, timezone
import uuid
import logging

logger = logging.getLogger(__name__)

class NewsAggregator:
    """Aggregates news from multiple RSS feeds"""
    
    RSS_FEEDS = {
        'cannabis': [
            'https://www.marijuanamoment.net/feed/',
            'https://www.leafly.com/news/feed',
            'https://www.cannabistech.com/feed/',
        ],
        'crypto': [
            'https://cointelegraph.com/rss',
            'https://decrypt.co/feed',
            'https://www.coindesk.com/arc/outboundfeeds/rss/',
        ],
        'ai': [
            'https://venturebeat.com/category/ai/feed/',
            'https://www.artificialintelligence-news.com/feed/',
        ],
        'market': [
            'https://www.bloomberg.com/feed/podcast/etf-iq',
            'https://www.marketwatch.com/rss/topstories',
            'https://finance.yahoo.com/news/rssindex',
        ],
        'international': [
            'https://www.aljazeera.com/xml/rss/all.xml',
            'https://www.bbc.co.uk/news/world/rss.xml',
            'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
        ],
        'jamaica': [
            'https://jamaica-gleaner.com/feed',
            'https://rjrnewsonline.com/feed/',
            'https://iriefm.net/feed/',
            'https://www.jamaicaobserver.com/feed/',
            'http://www.jamaicatoday.org/feed/',
        ]
    }
    
    @staticmethod
    async def fetch_rss_feed(url, category):
        """Fetch and parse RSS feed"""
        try:
            loop = asyncio.get_event_loop()
            feed = await loop.run_in_executor(None, feedparser.parse, url)
            
            articles = []
            for entry in feed.entries[:10]:  # Limit to 10 most recent
                article = {
                    'id': str(uuid.uuid4()),
                    'title': entry.get('title', ''),
                    'content': entry.get('summary', entry.get('description', ''))[:500],
                    'category': category,
                    'source_url': entry.get('link', ''),
                    'published_at': datetime.now(timezone.utc).isoformat(),
                    'trending_score': 0.5,
                    'image_url': None
                }
                
                # Try to extract image
                if 'media_content' in entry:
                    article['image_url'] = entry.media_content[0].get('url')
                elif 'media_thumbnail' in entry:
                    article['image_url'] = entry.media_thumbnail[0].get('url')
                
                articles.append(article)
            
            return articles
        except Exception as e:
            logger.error(f"Error fetching RSS feed {url}: {str(e)}")
            return []
    
    @classmethod
    async def aggregate_all_feeds(cls):
        """Aggregate news from all RSS feeds"""
        all_articles = []
        
        for category, feeds in cls.RSS_FEEDS.items():
            for feed_url in feeds:
                articles = await cls.fetch_rss_feed(feed_url, category)
                all_articles.extend(articles)
        
        return all_articles
    
    @classmethod
    async def aggregate_category(cls, category):
        """Aggregate news from a specific category"""
        articles = []
        
        if category in cls.RSS_FEEDS:
            for feed_url in cls.RSS_FEEDS[category]:
                category_articles = await cls.fetch_rss_feed(feed_url, category)
                articles.extend(category_articles)
        
        return articles


class SentimentAnalyzer:
    """Simple sentiment analysis for news articles"""
    
    BULLISH_KEYWORDS = [
        'surge', 'rally', 'gain', 'growth', 'positive', 'bullish', 'up', 'increase',
        'legalization', 'approve', 'pass', 'success', 'breakthrough', 'record'
    ]
    
    BEARISH_KEYWORDS = [
        'fall', 'drop', 'decline', 'crash', 'negative', 'bearish', 'down', 'decrease',
        'ban', 'reject', 'fail', 'crisis', 'concern', 'warning'
    ]
    
    @classmethod
    def analyze(cls, text):
        """Analyze sentiment of text"""
        text_lower = text.lower()
        
        bullish_count = sum(1 for word in cls.BULLISH_KEYWORDS if word in text_lower)
        bearish_count = sum(1 for word in cls.BEARISH_KEYWORDS if word in text_lower)
        
        if bullish_count > bearish_count:
            sentiment = 'bullish'
            score = min(50 + (bullish_count * 10), 100)
        elif bearish_count > bullish_count:
            sentiment = 'bearish'
            score = min(50 + (bearish_count * 10), 100)
        else:
            sentiment = 'neutral'
            score = 50
        
        # Determine impact
        total_keywords = bullish_count + bearish_count
        if total_keywords >= 4:
            impact = 'high'
        elif total_keywords >= 2:
            impact = 'medium'
        else:
            impact = 'low'
        
        return {
            'sentiment': sentiment,
            'sentiment_score': score,
            'impact': impact
        }


class CryptoDataProvider:
    """Provides crypto price data"""
    
    @staticmethod
    async def get_live_prices():
        """Get live crypto prices (placeholder - integrate with CoinGecko API)"""
        # In production, integrate with CoinGecko or CoinMarketCap API
        return [
            {'symbol': 'BTC', 'price': 45234.56, 'change_24h': 5.2},
            {'symbol': 'ETH', 'price': 2342.78, 'change_24h': 4.1},
            {'symbol': 'SOL', 'price': 98.34, 'change_24h': -1.3},
        ]


class CannabisStockProvider:
    """Provides cannabis stock data"""
    
    @staticmethod
    async def get_stock_prices():
        """Get cannabis stock prices (placeholder)"""
        # In production, integrate with stock market API
        return [
            {'symbol': 'TLRY', 'price': 3.45, 'change': -2.1},
            {'symbol': 'CGC', 'price': 7.23, 'change': 3.8},
            {'symbol': 'SNDL', 'price': 2.15, 'change': 1.5},
        ]