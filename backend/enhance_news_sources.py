"""
Add source names and topics to existing news articles
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from urllib.parse import urlparse

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'nugl_database')

# Map domains to source names
SOURCE_MAP = {
    'marijuanamoment.net': 'Marijuana Moment',
    'leafly.com': 'Leafly',
    'cannabistech.com': 'CannabisTech',
    'cointelegraph.com': 'CoinTelegraph',
    'decrypt.co': 'Decrypt',
    'coindesk.com': 'CoinDesk',
    'venturebeat.com': 'VentureBeat',
    'artificialintelligence-news.com': 'AI News',
    'marketwatch.com': 'MarketWatch',
    'yahoo.com': 'Yahoo Finance',
    'aljazeera.com': 'Al Jazeera',
    'bbc.co.uk': 'BBC',
    'nytimes.com': 'NY Times',
    'jamaica-gleaner.com': 'Jamaica Gleaner',
    'rjrnewsonline.com': 'RJR News',
    'iriefm.net': 'IrieFM',
    'jamaicaobserver.com': 'Jamaica Observer',
    'jamaicatoday.org': 'Jamaica Today'
}

# Topic keywords
TOPIC_MAP = {
    'policy': ['policy', 'regulation', 'law', 'legal', 'government', 'congress', 'senate'],
    'business': ['business', 'market', 'sales', 'revenue', 'deal', 'acquisition', 'investment'],
    'cultivation': ['grow', 'cultivation', 'farm', 'harvest', 'indoor', 'outdoor'],
    'retail': ['retail', 'dispensary', 'store', 'shop', 'sales'],
    'science': ['science', 'research', 'study', 'clinical', 'cbd', 'thc'],
    'medical': ['medical', 'patient', 'treatment', 'health', 'therapeutic'],
    'legalization': ['legalization', 'decriminalization', 'reform', 'vote', 'ballot']
}

def extract_source_name(url):
    """Extract source name from URL"""
    try:
        domain = urlparse(url).netloc
        domain = domain.replace('www.', '')
        return SOURCE_MAP.get(domain, domain.split('.')[0].title())
    except:
        return 'Unknown'

def extract_topic(title, content):
    """Extract topic from title/content"""
    text = (title + ' ' + content).lower()
    for topic, keywords in TOPIC_MAP.items():
        if any(kw in text for kw in keywords):
            return topic
    return 'general'

async def enhance_articles():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print('🔧 Enhancing news articles with source names and topics...\n')
    
    articles = await db.news_articles.find({}).to_list(length=1000)
    
    updated = 0
    for article in articles:
        source_name = extract_source_name(article.get('source_url', ''))
        topic = extract_topic(article.get('title', ''), article.get('content', ''))
        
        await db.news_articles.update_one(
            {'id': article['id']},
            {'$set': {
                'source_name': source_name,
                'topic': topic
            }}
        )
        updated += 1
        
        if updated % 20 == 0:
            print(f'  Updated {updated} articles...')
    
    print(f'\n✅ Enhanced {updated} articles with source names and topics')
    
    # Show summary
    print('\n📊 Sources:')
    sources = await db.news_articles.distinct('source_name')
    for source in sorted(sources):
        count = await db.news_articles.count_documents({'source_name': source})
        print(f'   {source}: {count}')
    
    print('\n📂 Topics:')
    topics = await db.news_articles.distinct('topic')
    for topic in sorted(topics):
        count = await db.news_articles.count_documents({'topic': topic})
        print(f'   {topic}: {count}')
    
    client.close()

if __name__ == "__main__":
    asyncio.run(enhance_articles())
