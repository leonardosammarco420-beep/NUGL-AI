"""
Populate NFT Marketplace with Cannabis-themed NFTs
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
import uuid

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'nugl_database')

CANNABIS_NFTS = [
    {
        'id': str(uuid.uuid4()),
        'name': 'Neon Dreams',
        'description': 'A vibrant neon cannabis ice cream sign that captures the essence of modern cannabis culture with artistic flair.',
        'image_url': 'https://images.unsplash.com/photo-1758186608140-05ba8d36e293',
        'price': 0.5,  # ETH
        'creator': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        'owner': None,
        'category': 'art',
        'rarity': 'rare',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'likes': 42,
        'views': 156
    },
    {
        'id': str(uuid.uuid4()),
        'name': 'Glass Artisan',
        'description': 'Masterful glasswork showcasing the intricate art of cannabis pipe creation, a celebration of craftsmanship.',
        'image_url': 'https://images.unsplash.com/photo-1611095237852-5d9f160277cc',
        'price': 0.35,
        'creator': '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
        'owner': None,
        'category': 'art',
        'rarity': 'uncommon',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'likes': 28,
        'views': 92
    },
    {
        'id': str(uuid.uuid4()),
        'name': 'Justice & Liberty',
        'description': 'Shepard Fairey inspired artwork advocating for cannabis justice and reform. A powerful statement piece.',
        'image_url': 'https://images.unsplash.com/photo-1608319892140-94fc8eee801d',
        'price': 1.2,
        'creator': '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
        'owner': None,
        'category': 'art',
        'rarity': 'legendary',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'likes': 89,
        'views': 342
    },
    {
        'id': str(uuid.uuid4()),
        'name': 'Minimalist Leaf',
        'description': 'A striking black cannabis leaf on white background. Pure minimalist perfection for digital collectors.',
        'image_url': 'https://images.unsplash.com/photo-1625249011101-fd3947e09343',
        'price': 0.25,
        'creator': '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
        'owner': None,
        'category': 'photography',
        'rarity': 'common',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'likes': 15,
        'views': 67
    },
    {
        'id': str(uuid.uuid4()),
        'name': 'Emerald Icon',
        'description': 'Clean, vibrant green cannabis leaf on pristine white. A classic representation of the plant.',
        'image_url': 'https://images.unsplash.com/photo-1637091064126-7c39c8b560f5',
        'price': 0.3,
        'creator': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        'owner': None,
        'category': 'photography',
        'rarity': 'common',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'likes': 19,
        'views': 78
    },
    {
        'id': str(uuid.uuid4()),
        'name': 'Midnight Green',
        'description': 'Dramatic large green leaf against deep black background. Bold and captivating visual statement.',
        'image_url': 'https://images.unsplash.com/photo-1635874295750-a20459ee78db',
        'price': 0.45,
        'creator': '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
        'owner': None,
        'category': 'photography',
        'rarity': 'uncommon',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'likes': 31,
        'views': 124
    },
    {
        'id': str(uuid.uuid4()),
        'name': 'Natural Beauty',
        'description': 'Intimate close-up of a cannabis plant showcasing nature\'s intricate design and organic beauty.',
        'image_url': 'https://images.unsplash.com/photo-1498671546682-94a232c26d17',
        'price': 0.4,
        'creator': '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
        'owner': None,
        'category': 'photography',
        'rarity': 'uncommon',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'likes': 25,
        'views': 98
    },
    {
        'id': str(uuid.uuid4()),
        'name': 'Digital Euphoria',
        'description': 'Vibrant 3D digital sculpture with explosive colors. Next-gen NFT art meets cannabis culture.',
        'image_url': 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d',
        'price': 0.8,
        'creator': '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
        'owner': None,
        'category': 'digital',
        'rarity': 'rare',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'likes': 56,
        'views': 234
    },
    {
        'id': str(uuid.uuid4()),
        'name': 'Botanical Dreams',
        'description': 'Digital mannequin adorned with flowers, representing the harmony between technology and nature.',
        'image_url': 'https://images.unsplash.com/photo-1641391503184-a2131018701b',
        'price': 0.65,
        'creator': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        'owner': None,
        'category': 'digital',
        'rarity': 'rare',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'likes': 44,
        'views': 187
    },
    {
        'id': str(uuid.uuid4()),
        'name': 'Forest Spirits',
        'description': 'Atmospheric digital forest scene evoking mystery and connection to nature\'s healing powers.',
        'image_url': 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01',
        'price': 0.55,
        'creator': '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
        'owner': None,
        'category': 'digital',
        'rarity': 'uncommon',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'likes': 38,
        'views': 145
    },
    {
        'id': str(uuid.uuid4()),
        'name': 'Culture Canvas',
        'description': 'Contemporary cannabis-themed art piece celebrating the evolution of cannabis acceptance.',
        'image_url': 'https://images.pexels.com/photos/8139103/pexels-photo-8139103.jpeg',
        'price': 0.6,
        'creator': '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
        'owner': None,
        'category': 'art',
        'rarity': 'uncommon',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'likes': 33,
        'views': 118
    },
    {
        'id': str(uuid.uuid4()),
        'name': 'Heritage Collection',
        'description': 'Artistic homage to cannabis heritage and the journey toward legalization and acceptance.',
        'image_url': 'https://images.pexels.com/photos/7668055/pexels-photo-7668055.jpeg',
        'price': 0.7,
        'creator': '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
        'owner': None,
        'category': 'art',
        'rarity': 'rare',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'likes': 47,
        'views': 201
    }
]

async def populate_nfts():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print('🎨 Populating NFT Marketplace...\n')
    
    inserted = 0
    for nft in CANNABIS_NFTS:
        existing = await db.nfts.find_one({'name': nft['name']})
        if not existing:
            await db.nfts.insert_one(nft)
            inserted += 1
            print(f'  ✓ {nft["name"]} - {nft["price"]} ETH ({nft["rarity"]})')
    
    total = await db.nfts.count_documents({})
    
    print(f'\n✅ Populated {inserted} new NFTs')
    print(f'📊 Total NFTs in marketplace: {total}')
    
    # Show breakdown by category
    print(f'\n📂 By Category:')
    for cat in ['art', 'photography', 'digital']:
        count = await db.nfts.count_documents({'category': cat})
        print(f'   {cat}: {count}')
    
    # Show breakdown by rarity
    print(f'\n💎 By Rarity:')
    for rarity in ['common', 'uncommon', 'rare', 'legendary']:
        count = await db.nfts.count_documents({'rarity': rarity})
        print(f'   {rarity}: {count}')
    
    client.close()

if __name__ == "__main__":
    asyncio.run(populate_nfts())
