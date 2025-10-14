"""
Simplified script to create structured links to legacy nugl.com content
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'nugl_database')

# Curated content from nugl.com homepage
LEGACY_CONTENT = {
    'nugl-tv': {
        'name': 'NUGL TV',
        'main_url': 'https://nugl.com/nugl-tv/',
        'articles': [
            {
                'title': '(Kre8 Genetics) Kasper – NUGL TV S2E9',
                'url': 'https://nugl.com/kre8-genetics-kasper-nugl-tv-s2e9/',
                'excerpt': 'Watch exclusive cannabis content and documentaries'
            }
        ]
    },
    'business': {
        'name': 'Business',
        'main_url': 'https://nugl.com/category/business/',
        'subcategories': [
            {'name': 'Industry', 'url': 'https://nugl.com/category/business/industry/'},
            {'name': 'Politics', 'url': 'https://nugl.com/category/business/politics/'},
            {'name': 'Economics', 'url': 'https://nugl.com/category/business/economics/'},
            {'name': 'Legalization', 'url': 'https://nugl.com/category/business/legalization/'}
        ],
        'articles': [
            {
                'title': 'Navigating Federal Cannabis Legalization and Reform in 2024',
                'url': 'https://nugl.com/navigating-federal-cannabis-legalization-and-reform-in-2024/',
                'excerpt': 'As the cannabis industry continues to evolve, 2024 stands as a pivotal year for federal cannabis reform.'
            },
            {
                'title': 'Silo Wellness Announces LOI to Acquire NUGL/Kaya in a Transaction Valued at CAD $43,289,624.60',
                'url': 'https://nugl.com/silo-wellness-announces-loi-to-acquire-nugl-kaya-in-a-transaction-valued-at-cad-43289624-60-cse-to-halt-trading-until-shareholder-approval/',
                'excerpt': 'Major acquisition announcement for NUGL Inc.'
            },
            {
                'title': 'TYSON 2.0 and Carma HoldCo Land in Jamaica, Bringing Mike Tyson\'s Knockout Cannabis Line to the Island',
                'url': 'https://nugl.com/tyson-2-0-and-carma-holdco-land-in-jamaica-bringing-mike-tysons-knockout-cannabis-line-to-the-island/',
                'excerpt': 'Mike Tyson\'s cannabis brand expands to Jamaica'
            }
        ]
    },
    'culture': {
        'name': 'Culture',
        'main_url': 'https://nugl.com/category/culture/',
        'subcategories': [
            {'name': 'Education', 'url': 'https://nugl.com/category/culture/education/'},
            {'name': 'Dispensaries', 'url': 'https://nugl.com/category/culture/dispensaries/'},
            {'name': 'Science', 'url': 'https://nugl.com/category/culture/science/'},
            {'name': 'Entertainment', 'url': 'https://nugl.com/category/culture/entertainment/'}
        ],
        'articles': [
            {
                'title': 'The Science Behind Cannabis: Understanding Its Chemical Composition and Effects',
                'url': 'https://nugl.com/the-science-behind-cannabis-understanding-its-chemical-composition-and-effects/',
                'excerpt': 'Cannabis chemical composition and how it affects the body'
            },
            {
                'title': 'CBD vs. THC: Exploring the Differences and Benefits of Cannabinoids',
                'url': 'https://nugl.com/cbd-vs-thc-exploring-the-differences-and-benefits-of-cannabinoids/',
                'excerpt': 'Understanding the key differences between CBD and THC'
            },
            {
                'title': 'The Bioengineering of Cannabis: What is It, What You Need to Know, and Why It\'s Important',
                'url': 'https://nugl.com/the-bioengineering-of-cannabis-what-is-it-what-you-need-to-know-and-why-its-important/',
                'excerpt': 'The future of cannabis through bioengineering'
            },
            {
                'title': 'The stages of cannabis growth',
                'url': 'https://nugl.com/the-stages-of-cannabis-growth/',
                'excerpt': 'Understanding cannabis plant development stages'
            },
            {
                'title': 'Which Bong Height is Best for You? A Guide for Smooth Hits',
                'url': 'https://nugl.com/which-bong-height-is-best-for-you-a-guide-for-smooth-hits/',
                'excerpt': 'Choosing the right bong size for your needs'
            }
        ]
    },
    'grow-products': {
        'name': 'Grow & Products',
        'main_url': 'https://nugl.com/category/grow/',
        'subcategories': [
            {'name': 'Growing Guides', 'url': 'https://nugl.com/category/grow/'},
            {'name': 'Products', 'url': 'https://nugl.com/category/products/'},
            {'name': 'Product Reviews', 'url': 'https://nugl.com/category/products/product-review/'}
        ],
        'articles': [
            {
                'title': 'What Is Growing Sinsemilla in a Greenhouse Possible?',
                'url': 'https://nugl.com/what-is-growing-sinsemilla-in-a-greenhouse-possible/',
                'excerpt': 'Expert guide to growing sinsemilla cannabis'
            },
            {
                'title': '6 Most Common Mistakes to Avoid Before You Start Growing Cannabis',
                'url': 'https://nugl.com/6-most-common-mistakes-to-avoid-before-you-start-growing-cannabis/',
                'excerpt': 'Essential tips for new cannabis growers'
            },
            {
                'title': '4 Simple Steps to Grow Marijuana',
                'url': 'https://nugl.com/4-simple-steps-to-grow-marijuana/',
                'excerpt': 'Beginner-friendly cannabis growing guide'
            },
            {
                'title': 'The Ultimate Guide to the Top 10 CO2 Cannabis Pens in America',
                'url': 'https://nugl.com/the-ultimate-guide-to-the-top-10-co2-cannabis-pens-in-america/',
                'excerpt': 'Best cannabis vape pens reviewed'
            },
            {
                'title': 'System of a Down: Combining Music & Cannabis With 22Red',
                'url': 'https://nugl.com/system-of-a-down-combining-music-cannabis-with-22red/',
                'excerpt': 'Celebrity cannabis brand spotlight'
            }
        ]
    },
    'wellness': {
        'name': 'Wellness',
        'main_url': 'https://nugl.com/category/wellness/',
        'subcategories': [
            {'name': 'Medical', 'url': 'https://nugl.com/category/wellness/medical/'},
            {'name': 'Psychedelics', 'url': 'https://nugl.com/category/wellness/psychedelics/'},
            {'name': 'Cooking', 'url': 'https://nugl.com/category/wellness/cooking/'},
            {'name': 'CBD', 'url': 'https://nugl.com/category/wellness/cbd/'}
        ],
        'articles': [
            {
                'title': 'Cannabis and Wellness: Exploring the Benefits and Products for a Healthier Lifestyle in Miami',
                'url': 'https://nugl.com/cannabis-and-wellness-exploring-the-benefits-and-products-for-a-healthier-lifestyle-in-miami/',
                'excerpt': 'Cannabis wellness products and benefits'
            },
            {
                'title': 'The Benefits of CBD for Inflammation in Sports: A Game Changer for Athletes',
                'url': 'https://nugl.com/the-benefits-of-cbd-for-inflammation-in-sports-a-game-changer-for-athletes/',
                'excerpt': 'How CBD helps athletes recover faster'
            },
            {
                'title': 'How Cannabis and CBD Can Help You With Pain Management',
                'url': 'https://nugl.com/how-cannabis-and-cbd-can-help-you-with-pain-management/',
                'excerpt': 'Natural pain relief with cannabis'
            },
            {
                'title': 'What Is It Like To Be High On Psilocybin Mushrooms?',
                'url': 'https://nugl.com/what-is-it-like-to-be-high-on-psilocybin-mushrooms/',
                'excerpt': 'Understanding the psychedelic experience'
            }
        ]
    },
    'events': {
        'name': 'Events',
        'main_url': 'https://nugl.com/category/events/',
        'articles': [
            {
                'title': 'USA CBD Expo Returns With Nation\'s Largest CBD Event February 13-15 in Las Vegas',
                'url': 'https://nugl.com/usa-cbd-expo-returns-with-nations-largest-cbd-event-february-13-15-in-las-vegas/',
                'excerpt': 'Major CBD industry event in Las Vegas'
            },
            {
                'title': 'Jamaica Based Kaya Group Ramps Up for the Five-Year Anniversary of Legal Medical Cannabis Sales',
                'url': 'https://nugl.com/jamaica-based-kaya-group-ramps-up-for-the-five-year-anniversary-of-legal-medical-cannabis-sales-on-march-10-with-irie-fm-music-awards/',
                'excerpt': 'Celebrating 5 years of legal cannabis in Jamaica'
            }
        ]
    }
}

async def populate_legacy_links():
    """Populate database with legacy content links"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🚀 Populating legacy content links from nugl.com...\n")
    
    total_items = 0
    
    for category_key, data in LEGACY_CONTENT.items():
        print(f"📂 {data['name']}...")
        
        # Create category document
        category_doc = {
            'category_id': category_key,
            'name': data['name'],
            'main_url': data['main_url'],
            'subcategories': data.get('subcategories', []),
            'article_count': len(data.get('articles', [])),
            'created_at': datetime.now(timezone.utc).isoformat(),
            'legacy_site': 'nugl.com'
        }
        
        # Insert or update category
        await db.legacy_categories.update_one(
            {'category_id': category_key},
            {'$set': category_doc},
            upsert=True
        )
        
        # Insert articles
        for article in data.get('articles', []):
            article_doc = {
                **article,
                'category_id': category_key,
                'category_name': data['name'],
                'created_at': datetime.now(timezone.utc).isoformat(),
                'legacy_site': 'nugl.com'
            }
            
            await db.legacy_articles.update_one(
                {'url': article['url']},
                {'$set': article_doc},
                upsert=True
            )
            total_items += 1
            print(f"   ✓ {article['title'][:70]}...")
        
        print(f"   ✅ {len(data.get('articles', []))} articles\n")
    
    print(f"🎉 Complete! Populated {total_items} legacy content items\n")
    
    # Show summary
    for category_key, data in LEGACY_CONTENT.items():
        count = await db.legacy_articles.count_documents({'category_id': category_key})
        print(f"   {data['name']}: {count} articles")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(populate_legacy_links())
