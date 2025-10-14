"""
Create simple user credits system tied to wallet addresses
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'nugl_database')

async def create_wallet_users():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print('💰 Setting up wallet-based user system...\n')
    
    # Sample wallet users with credits
    demo_users = [
        {
            'wallet_address': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            'credits': 1000,
            'username': 'Demo User',
            'created_at': '2025-01-14T00:00:00Z',
            'nfts_owned': [],
            'purchases': []
        }
    ]
    
    for user in demo_users:
        existing = await db.wallet_users.find_one({'wallet_address': user['wallet_address']})
        if not existing:
            await db.wallet_users.insert_one(user)
            print(f"✅ Created user: {user['wallet_address'][:10]}... with {user['credits']} credits")
        else:
            print(f"⚠️  User already exists: {user['wallet_address'][:10]}...")
    
    print('\n✅ Wallet user system ready!')
    print('💡 Users authenticate via crypto wallet - no password needed')
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_wallet_users())
