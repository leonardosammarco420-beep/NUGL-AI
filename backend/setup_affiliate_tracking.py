"""
Setup affiliate tracking system with sample data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta, timezone
import os
import random
import uuid

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'nugl_database')

async def setup_affiliate_system():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print('💰 Setting up Affiliate Tracking System...\n')
    
    # Affiliate partners
    partners = [
        {'id': 'marijuana-moment', 'name': 'Marijuana Moment', 'commission_rate': 0.05, 'type': 'news'},
        {'id': 'leafly', 'name': 'Leafly', 'commission_rate': 0.08, 'type': 'dispensary'},
        {'id': 'seedsman', 'name': 'Seedsman', 'commission_rate': 0.10, 'type': 'seeds'},
        {'id': 'ilgm', 'name': 'ILGM', 'commission_rate': 0.12, 'type': 'seeds'},
        {'id': 'cointelegraph', 'name': 'CoinTelegraph', 'commission_rate': 0.03, 'type': 'news'},
        {'id': 'jamaica-gleaner', 'name': 'Jamaica Gleaner', 'commission_rate': 0.04, 'type': 'news'},
    ]
    
    for partner in partners:
        await db.affiliate_partners.update_one(
            {'id': partner['id']},
            {'$set': partner},
            upsert=True
        )
    
    print(f'✅ Added {len(partners)} affiliate partners\n')
    
    # Generate sample tracking data (last 30 days)
    clicks = []
    conversions = []
    
    for i in range(150):  # 150 clicks
        partner = random.choice(partners)
        click_date = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))
        
        click = {
            'id': str(uuid.uuid4()),
            'partner_id': partner['id'],
            'partner_name': partner['name'],
            'source_page': random.choice(['news', 'strains', 'seeds', 'home']),
            'clicked_at': click_date.isoformat(),
            'ip_address': f'192.168.{random.randint(1,255)}.{random.randint(1,255)}',
            'converted': False,
            'revenue': 0
        }
        
        # 15% conversion rate
        if random.random() < 0.15:
            click['converted'] = True
            sale_amount = random.uniform(20, 200)
            click['revenue'] = round(sale_amount * partner['commission_rate'], 2)
            click['sale_amount'] = round(sale_amount, 2)
            click['converted_at'] = (click_date + timedelta(hours=random.randint(1, 48))).isoformat()
        
        clicks.append(click)
    
    if clicks:
        await db.affiliate_clicks.insert_many(clicks)
    
    # Calculate summary stats
    total_clicks = len(clicks)
    total_conversions = sum(1 for c in clicks if c['converted'])
    total_revenue = sum(c['revenue'] for c in clicks if c['converted'])
    
    print(f'📊 Generated Sample Data:')
    print(f'   Total Clicks: {total_clicks}')
    print(f'   Conversions: {total_conversions}')
    print(f'   Total Revenue: ${total_revenue:.2f}')
    print(f'   Conversion Rate: {(total_conversions/total_clicks*100):.1f}%\n')
    
    # Top performers
    print('🏆 Top Performing Partners:')
    partner_revenue = {}
    for click in clicks:
        if click['converted']:
            pid = click['partner_id']
            partner_revenue[pid] = partner_revenue.get(pid, 0) + click['revenue']
    
    for pid, rev in sorted(partner_revenue.items(), key=lambda x: x[1], reverse=True)[:3]:
        partner_name = next(p['name'] for p in partners if p['id'] == pid)
        print(f'   {partner_name}: ${rev:.2f}')
    
    print('\n✅ Affiliate tracking system ready!')
    
    client.close()

if __name__ == "__main__":
    asyncio.run(setup_affiliate_system())
