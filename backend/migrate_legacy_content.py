"""
Script to populate media content from www.nugl.com legacy site
This script fetches articles from various categories and stores them in MongoDB
"""

import asyncio
import aiohttp
from bs4 import BeautifulSoup
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
import re

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'nugl_database')

# Category mappings from old site to new structure
CATEGORY_MAPPINGS = {
    'nugl-tv': {
        'new_category': 'nugl-tv',
        'urls': ['https://nugl.com/nugl-tv/'],
        'description': 'NUGL TV video content'
    },
    'business': {
        'new_category': 'business',
        'urls': [
            'https://nugl.com/category/business/',
            'https://nugl.com/category/business/industry/',
            'https://nugl.com/category/business/politics/',
            'https://nugl.com/category/business/economics/',
            'https://nugl.com/category/business/legalization/'
        ],
        'description': 'Cannabis business news and insights'
    },
    'culture': {
        'new_category': 'culture',
        'urls': [
            'https://nugl.com/category/culture/',
            'https://nugl.com/category/culture/education/',
            'https://nugl.com/category/culture/dispensaries/',
            'https://nugl.com/category/culture/science/',
            'https://nugl.com/category/culture/entertainment/'
        ],
        'description': 'Cannabis culture and education'
    },
    'grow-products': {
        'new_category': 'grow-products',
        'urls': [
            'https://nugl.com/category/grow/',
            'https://nugl.com/category/products/',
            'https://nugl.com/category/products/product-review/'
        ],
        'description': 'Growing guides and product reviews'
    },
    'wellness': {
        'new_category': 'wellness',
        'urls': [
            'https://nugl.com/category/wellness/',
            'https://nugl.com/category/wellness/psychedelics/',
            'https://nugl.com/category/wellness/cooking/',
            'https://nugl.com/category/wellness/cbd/',
            'https://nugl.com/category/wellness/medical/'
        ],
        'description': 'Wellness, medical, and CBD content'
    },
    'events': {
        'new_category': 'events',
        'urls': ['https://nugl.com/category/events/'],
        'description': 'Cannabis industry events'
    }
}

async def fetch_articles_from_category(session, url, category):
    """Fetch article links from a category page"""
    try:
        async with session.get(url) as response:
            if response.status == 200:
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                articles = []
                # Find article links (adjust selectors based on actual HTML structure)
                article_links = soup.find_all('a', href=True)
                
                for link in article_links:
                    href = link.get('href', '')
                    # Filter for actual article URLs
                    if 'nugl.com' in href and '/category/' not in href and href.endswith('/'):
                        title_elem = link.find('h3') or link.find('h2')
                        if title_elem:
                            title = title_elem.get_text(strip=True)
                            if title and len(title) > 10:  # Basic validation
                                articles.append({
                                    'title': title,
                                    'url': href,
                                    'category': category
                                })
                
                # Remove duplicates
                seen = set()
                unique_articles = []
                for article in articles:
                    if article['url'] not in seen:
                        seen.add(article['url'])
                        unique_articles.append(article)
                
                return unique_articles
            
    except Exception as e:
        print(f"Error fetching {url}: {str(e)}")
        return []

async def populate_media_content():
    """Main function to populate all media content"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🚀 Starting media content migration from nugl.com...")
    
    total_articles = 0
    
    async with aiohttp.ClientSession() as session:
        for old_cat, mapping in CATEGORY_MAPPINGS.items():
            print(f"\n📂 Processing {mapping['new_category']}...")
            category_articles = []
            
            for url in mapping['urls']:
                print(f"   Fetching from: {url}")
                articles = await fetch_articles_from_category(session, url, mapping['new_category'])
                if articles:
                    category_articles.extend(articles)
                await asyncio.sleep(1)  # Be respectful with requests
            
            # Insert into database
            inserted = 0
            for article in category_articles:
                # Check if already exists
                existing = await db.legacy_media.find_one({'url': article['url']})
                if not existing:
                    article['created_at'] = datetime.now(timezone.utc).isoformat()
                    article['legacy_site'] = 'nugl.com'
                    article['migrated'] = True
                    await db.legacy_media.insert_one(article)
                    inserted += 1
                    print(f"      ✓ {article['title'][:60]}...")
            
            print(f"   ✅ Inserted {inserted} new articles for {mapping['new_category']}")
            total_articles += inserted
    
    print(f"\n🎉 Migration complete! Total articles migrated: {total_articles}")
    client.close()

if __name__ == "__main__":
    asyncio.run(populate_media_content())
