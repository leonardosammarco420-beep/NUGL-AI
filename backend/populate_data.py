# Script to populate database with real strain data
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
import uuid

# Real cannabis strain data
STRAINS_DATA = [
    {
        'name': 'Blue Dream',
        'type': 'hybrid',
        'thc_content': 18.0,
        'cbd_content': 2.0,
        'description': 'A sativa-dominant hybrid originating in California, Blue Dream delivers swift symptom relief without heavy sedative effects. This makes Blue Dream a popular daytime medicine for patients treating pain, depression, nausea, and other ailments requiring high THC.',
        'effects': ['Happy', 'Relaxed', 'Euphoric', 'Uplifted', 'Creative'],
        'flavors': ['Blueberry', 'Sweet', 'Berry'],
        'affiliate_links': [
            {'dispensary': 'Green Valley Dispensary', 'url': 'https://example.com', 'location': 'California'},
            {'dispensary': 'Cannabis Central', 'url': 'https://example.com', 'location': 'Colorado'}
        ]
    },
    {
        'name': 'OG Kush',
        'type': 'hybrid',
        'thc_content': 20.0,
        'cbd_content': 0.3,
        'description': 'With a complex aroma of fuel, skunk, and spice, OG Kush offers a heady and potent high that can help patients find relief from pain, insomnia, and stress.',
        'effects': ['Relaxed', 'Happy', 'Euphoric', 'Uplifted', 'Sleepy'],
        'flavors': ['Earthy', 'Pine', 'Woody'],
        'affiliate_links': [
            {'dispensary': 'Premium Cannabis', 'url': 'https://example.com', 'location': 'California'}
        ]
    },
    {
        'name': 'Girl Scout Cookies',
        'type': 'hybrid',
        'thc_content': 28.0,
        'cbd_content': 0.2,
        'description': 'GSC offers full-body relaxation with powerful happy, euphoric effects. Medical patients choose GSC to help relieve symptoms associated with pain, nausea, and appetite loss.',
        'effects': ['Relaxed', 'Happy', 'Euphoric', 'Giggly', 'Hungry'],
        'flavors': ['Sweet', 'Earthy', 'Pungent'],
        'affiliate_links': [
            {'dispensary': 'Top Shelf Dispensary', 'url': 'https://example.com', 'location': 'Nevada'}
        ]
    },
    {
        'name': 'Sour Diesel',
        'type': 'sativa',
        'thc_content': 22.0,
        'cbd_content': 0.2,
        'description': 'A fast-acting strain that delivers energizing, dreamy cerebral effects. Sour Diesel is a great choice for treating depression, pain, and fatigue.',
        'effects': ['Energetic', 'Happy', 'Uplifted', 'Euphoric', 'Creative'],
        'flavors': ['Diesel', 'Pungent', 'Earthy'],
        'affiliate_links': [
            {'dispensary': 'Emerald Dispensary', 'url': 'https://example.com', 'location': 'Washington'}
        ]
    },
    {
        'name': 'Granddaddy Purple',
        'type': 'indica',
        'thc_content': 17.0,
        'cbd_content': 0.1,
        'description': 'GDP blesses growers with big, dense buds that are striped with deep purple hues and are coated with white crystal resin. The potent effects are clearly detectable in both mind and body.',
        'effects': ['Relaxed', 'Sleepy', 'Happy', 'Euphoric', 'Hungry'],
        'flavors': ['Grape', 'Berry', 'Sweet'],
        'affiliate_links': [
            {'dispensary': 'Purple Haven', 'url': 'https://example.com', 'location': 'Oregon'}
        ]
    },
    {
        'name': 'Green Crack',
        'type': 'sativa',
        'thc_content': 21.0,
        'cbd_content': 0.1,
        'description': 'A potent sativa providing a mentally invigorating high. Green Crack is great for combating fatigue, stress, and depression.',
        'effects': ['Energetic', 'Happy', 'Uplifted', 'Focused', 'Creative'],
        'flavors': ['Citrus', 'Sweet', 'Earthy'],
        'affiliate_links': [
            {'dispensary': 'Energy Dispensary', 'url': 'https://example.com', 'location': 'California'}
        ]
    },
    {
        'name': 'Northern Lights',
        'type': 'indica',
        'thc_content': 16.0,
        'cbd_content': 0.1,
        'description': 'One of the most famous indica strains of all time. Northern Lights produces euphoric effects that settle in firmly throughout the body, relaxing muscles and easing the mind.',
        'effects': ['Relaxed', 'Sleepy', 'Happy', 'Euphoric', 'Hungry'],
        'flavors': ['Earthy', 'Sweet', 'Pungent'],
        'affiliate_links': [
            {'dispensary': 'Northern Cannabis', 'url': 'https://example.com', 'location': 'Alaska'}
        ]
    },
    {
        'name': 'White Widow',
        'type': 'hybrid',
        'thc_content': 20.0,
        'cbd_content': 0.2,
        'description': 'A balanced hybrid that has sparked a new generation of hybrids. White Widow delivers a burst of euphoria and energy while remaining physically relaxed.',
        'effects': ['Happy', 'Energetic', 'Uplifted', 'Euphoric', 'Creative'],
        'flavors': ['Earthy', 'Woody', 'Flowery'],
        'affiliate_links': [
            {'dispensary': 'White Mountain Dispensary', 'url': 'https://example.com', 'location': 'Vermont'}
        ]
    },
    {
        'name': 'Pineapple Express',
        'type': 'hybrid',
        'thc_content': 19.0,
        'cbd_content': 0.1,
        'description': 'A sativa-dominant hybrid made famous by the movie. This hard-hitting hybrid provides a long-lasting energetic buzz perfect for productive afternoons and creative escapes.',
        'effects': ['Happy', 'Energetic', 'Uplifted', 'Euphoric', 'Relaxed'],
        'flavors': ['Tropical', 'Pineapple', 'Sweet'],
        'affiliate_links': [
            {'dispensary': 'Tropical Cannabis Co', 'url': 'https://example.com', 'location': 'Hawaii'}
        ]
    },
    {
        'name': 'Jack Herer',
        'type': 'sativa',
        'thc_content': 18.0,
        'cbd_content': 0.1,
        'description': 'Named after the marijuana activist and author, Jack Herer is a sativa-dominant strain that delivers blissful, clear-headed effects while reducing stress.',
        'effects': ['Happy', 'Uplifted', 'Energetic', 'Euphoric', 'Creative'],
        'flavors': ['Earthy', 'Pine', 'Woody'],
        'affiliate_links': [
            {'dispensary': 'Jack\'s Cannabis', 'url': 'https://example.com', 'location': 'Oregon'}
        ]
    },
    {
        'name': 'AK-47',
        'type': 'hybrid',
        'thc_content': 20.0,
        'cbd_content': 1.5,
        'description': 'Despite its violent name, AK-47 delivers a steady and long-lasting cerebral buzz that keeps you mentally alert and engaged in creative or social activities.',
        'effects': ['Relaxed', 'Happy', 'Uplifted', 'Euphoric', 'Creative'],
        'flavors': ['Earthy', 'Pungent', 'Sweet'],
        'affiliate_links': [
            {'dispensary': 'Mountain Peak Dispensary', 'url': 'https://example.com', 'location': 'Colorado'}
        ]
    },
    {
        'name': 'Purple Haze',
        'type': 'sativa',
        'thc_content': 17.0,
        'cbd_content': 0.1,
        'description': 'Made famous by Jimi Hendrix, Purple Haze delivers a dreamy burst of euphoria that brings veteran consumers back to their psychedelic heyday.',
        'effects': ['Energetic', 'Happy', 'Uplifted', 'Euphoric', 'Creative'],
        'flavors': ['Berry', 'Sweet', 'Earthy'],
        'affiliate_links': [
            {'dispensary': 'Purple Dreams', 'url': 'https://example.com', 'location': 'Washington'}
        ]
    }
]

SEEDS_DATA = [
    {
        'name': 'Northern Lights Auto',
        'strain_type': 'Indica Autoflower',
        'description': 'Classic indica autoflower with fast flowering time (8-9 weeks) and high yields. Perfect for beginners. Indoor/outdoor compatible.',
        'price_range': '$50-$80 per 10 seeds',
        'affiliate_links': [
            {'wholesaler': 'Seed Supreme', 'url': 'https://example.com'},
            {'wholesaler': 'ILGM', 'url': 'https://example.com'}
        ]
    },
    {
        'name': 'Blue Dream Feminized',
        'strain_type': 'Hybrid Feminized',
        'description': 'Premium feminized seeds of the legendary Blue Dream. High THC, balanced effects, fruity flavor. 9-10 week flowering.',
        'price_range': '$60-$100 per 10 seeds',
        'affiliate_links': [
            {'wholesaler': 'Seedsman', 'url': 'https://example.com'},
            {'wholesaler': 'Crop King Seeds', 'url': 'https://example.com'}
        ]
    },
    {
        'name': 'OG Kush Feminized',
        'strain_type': 'Hybrid Feminized',
        'description': 'Original OG Kush genetics in feminized form. Powerful effects, classic flavors. 8-9 week flowering period.',
        'price_range': '$70-$110 per 10 seeds',
        'affiliate_links': [
            {'wholesaler': 'Dutch Passion', 'url': 'https://example.com'}
        ]
    },
    {
        'name': 'Gorilla Glue #4 Feminized',
        'strain_type': 'Hybrid Feminized',
        'description': 'Award-winning strain with massive THC production. Sticky resin, powerful effects. 8-9 weeks flowering.',
        'price_range': '$80-$120 per 10 seeds',
        'affiliate_links': [
            {'wholesaler': 'Barney\'s Farm', 'url': 'https://example.com'}
        ]
    },
    {
        'name': 'White Widow Feminized',
        'strain_type': 'Hybrid Feminized',
        'description': 'Legendary Dutch genetics. Resin-coated buds, balanced effects. 8-9 week flowering time.',
        'price_range': '$55-$85 per 10 seeds',
        'affiliate_links': [
            {'wholesaler': 'White Label Seeds', 'url': 'https://example.com'}
        ]
    }
]

async def populate_database():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'nugl_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🌱 Populating NUGL database with real data...")
    
    # Add strains
    print(f"\n📦 Adding {len(STRAINS_DATA)} strains...")
    for strain_data in STRAINS_DATA:
        strain_data['id'] = str(uuid.uuid4())
        existing = await db.strains.find_one({'name': strain_data['name']})
        if not existing:
            await db.strains.insert_one(strain_data)
            print(f"  ✓ Added: {strain_data['name']} ({strain_data['type']})")
        else:
            print(f"  ⊘ Skipped (exists): {strain_data['name']}")
    
    # Add seeds
    print(f"\n🌾 Adding {len(SEEDS_DATA)} seed varieties...")
    for seed_data in SEEDS_DATA:
        seed_data['id'] = str(uuid.uuid4())
        existing = await db.seeds.find_one({'name': seed_data['name']})
        if not existing:
            await db.seeds.insert_one(seed_data)
            print(f"  ✓ Added: {seed_data['name']}")
        else:
            print(f"  ⊘ Skipped (exists): {seed_data['name']}")
    
    # Get counts
    total_strains = await db.strains.count_documents({})
    total_seeds = await db.seeds.count_documents({})
    
    print(f"\n✅ Database population complete!")
    print(f"   Total strains: {total_strains}")
    print(f"   Total seeds: {total_seeds}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(populate_database())