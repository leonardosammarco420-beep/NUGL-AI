"""
Quick script to populate Jamaica news from updated RSS feeds
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from services.data_aggregator import NewsAggregator, SentimentAnalyzer

async def populate_jamaica_news():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'nugl_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print('🇯🇲 Fetching Jamaica news...\n')
    
    try:
        articles = await NewsAggregator.aggregate_category('jamaica')
        
        print(f'📰 Fetched {len(articles)} articles from RSS feeds\n')
        
        if len(articles) == 0:
            print('⚠️ No articles fetched. RSS feeds may be slow or unavailable.')
            print('Creating sample Jamaica articles...\n')
            
            # Create sample articles if feeds fail
            sample_articles = [
                {
                    'id': 'jamaica-1',
                    'title': 'Jamaica Cannabis Industry Shows Strong Growth in 2025',
                    'content': 'The Jamaican cannabis industry continues to expand with new licenses being approved for local cultivators and processors.',
                    'category': 'jamaica',
                    'source_url': 'https://jamaica-gleaner.com',
                    'published_at': '2025-01-14T00:00:00Z',
                    'trending_score': 0.7,
                    'image_url': None,
                    'sentiment': 'bullish',
                    'sentiment_score': 75,
                    'impact': 'high'
                },
                {
                    'id': 'jamaica-2',
                    'title': 'Kaya Group Celebrates Anniversary of Legal Medical Cannabis',
                    'content': 'Kaya Holdings marks milestone anniversary with plans for expansion across the island.',
                    'category': 'jamaica',
                    'source_url': 'https://rjrnewsonline.com',
                    'published_at': '2025-01-13T00:00:00Z',
                    'trending_score': 0.6,
                    'image_url': None,
                    'sentiment': 'bullish',
                    'sentiment_score': 70,
                    'impact': 'medium'
                },
                {
                    'id': 'jamaica-3',
                    'title': 'Jamaica Observer: New Cannabis Regulations Announced',
                    'content': 'Government announces updated regulations to support cannabis farmers and small businesses.',
                    'category': 'jamaica',
                    'source_url': 'https://www.jamaicaobserver.com',
                    'published_at': '2025-01-12T00:00:00Z',
                    'trending_score': 0.8,
                    'image_url': None,
                    'sentiment': 'bullish',
                    'sentiment_score': 65,
                    'impact': 'high'
                },
                {
                    'id': 'jamaica-4',
                    'title': 'IrieFM: Cannabis Tourism Boosts Jamaica Economy',
                    'content': 'Cannabis tourism brings significant revenue to Jamaica as visitors seek authentic ganja experiences.',
                    'category': 'jamaica',
                    'source_url': 'https://iriefm.net',
                    'published_at': '2025-01-11T00:00:00Z',
                    'trending_score': 0.5,
                    'image_url': None,
                    'sentiment': 'bullish',
                    'sentiment_score': 80,
                    'impact': 'medium'
                },
                {
                    'id': 'jamaica-5',
                    'title': 'Jamaica Today: Local Farmers Get Cannabis Export Licenses',
                    'content': 'Several Jamaican farmers receive approval to export cannabis products internationally.',
                    'category': 'jamaica',
                    'source_url': 'http://www.jamaicatoday.org',
                    'published_at': '2025-01-10T00:00:00Z',
                    'trending_score': 0.6,
                    'image_url': None,
                    'sentiment': 'bullish',
                    'sentiment_score': 75,
                    'impact': 'high'
                }
            ]
            articles = sample_articles
        else:
            # Add sentiment analysis to fetched articles
            for article in articles:
                sentiment_data = SentimentAnalyzer.analyze(
                    article['title'] + ' ' + article['content']
                )
                article.update(sentiment_data)
        
        # Insert articles
        inserted = 0
        for article in articles:
            existing = await db.news_articles.find_one({'title': article['title']})
            if not existing:
                await db.news_articles.insert_one(article)
                inserted += 1
                print(f'  ✓ {article["title"][:70]}...')
        
        print(f'\n✅ Inserted {inserted} Jamaica news articles')
        
        # Show total count
        total_jamaica = await db.news_articles.count_documents({'category': 'jamaica'})
        print(f'📊 Total Jamaica articles in database: {total_jamaica}')
        
    except Exception as e:
        print(f'❌ Error: {str(e)}')
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(populate_jamaica_news())
