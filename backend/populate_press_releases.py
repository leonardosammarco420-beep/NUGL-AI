"""
Populate press releases database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
import uuid

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'nugl_database')

press_data = [
    {"title": "A local's guide to Jamaica: 10 top tips", "media_source": "The Guardian", "link": "https://www.theguardian.com/travel/2023/oct/02/a-locals-guide-to-jamaica-10-top-tips"},
    {"title": "Jamaica Based Kaya Group Ramps Up for the Five-Year Anniversary of Legal Medical Cannabis Sales", "media_source": "GlobeNewswire", "link": "https://www.globenewswire.com/news-release/2023/02/28/2617373/0/en/Jamaica-Based-Kaya-Group-Ramps-Up-for-the-Five-Year-Anniversary-of-Legal-Medical-Cannabis-Sales-on-March-10-with-the-IRIE-FM-Music-Awards.html"},
    {"title": "Kaya Herb House Opens In Kingston, Jamaica", "media_source": "Forbes", "link": "https://www.forbes.com/sites/benkollman/2023/07/14/kaya-herb-house-opens-in-kingston-jamaica/"},
    {"title": "Kaya Herb House is a Proud Sponsor and Partner of the Herb Curb at Rebel Salute", "media_source": "GlobeNewswire", "link": "https://www.globenewswire.com/news-release/2023/01/20/2592470/0/en/Kaya-Herb-House-is-a-Proud-Sponsor-and-Partner-of-the-Herb-Curb-at-Rebel-Salute-and-the-Rebel-Salute-festival.html"},
    {"title": "Kaya finds partner in Silo for magic mushroom retreats", "media_source": "Jamaica Gleaner", "link": "https://jamaica-gleaner.com/article/business/20230809/kaya-finds-partner-silo-magic-mushroom-retreats"},
    {"title": "Kaya to sell out to Silo Wellness", "media_source": "Jamaica Gleaner", "link": "https://jamaica-gleaner.com/article/business/20230830/kaya-sell-out-silo-wellness"},
    {"title": "Silo Wellness to Acquire Kaya Group in $43.3 Million Deal", "media_source": "BeautyMatter", "link": "https://beautymatter.com/articles/silo-wellness-to-acquire-kaya-group"},
    {"title": "Vaswani to remain head of Kaya after sale to Silo", "media_source": "Jamaica Gleaner", "link": "https://jamaica-gleaner.com/article/business/20240616/vaswani-remain-head-kaya-after-sale-silo"},
    {"title": "Mike Tyson's Cannabis-Infused Pre-Rolls and Vapes Reach Jamaica Via Kaya Group Partnership", "media_source": "Benzinga", "link": "https://www.benzinga.com/markets/cannabis/24/11/42165010/mike-tysons-cannabis-infused-pre-rolls-and-vapes-reach-jamaica-via-kaya-group-partnership"},
    {"title": "Kaya heading to the Gap", "media_source": "Jamaica Gleaner", "link": "https://jamaica-gleaner.com/article/business/20220824/kaya-heading-gap"},
    {"title": "Kaya Cannabis company takes on first environmental project", "media_source": "Jamaica Gleaner", "link": "https://jamaica-gleaner.com/article/news/20210522/kaya-cannabis-company-takes-first-environmental-project"},
    {"title": "Build A Vibe: Berners Vibes Collaborates With Jamaica's Kaya Herb House", "media_source": "Benzinga", "link": "https://www.benzinga.com/markets/cannabis/21/12/24698309/build-a-vibe-berners-vibes-collaborates-with-jamaicas-kaya-herb-house"},
    {"title": "Kaya ships ganja to Australia", "media_source": "Gleaner", "link": "https://jamaica-gleaner.com/article/business/20211126/kaya-ships-ganja-australia"},
    {"title": "Satisfy the munchies at Kaya Pizza", "media_source": "Gleaner", "link": "https://jamaica-gleaner.com/article/food/20210812/satisfy-munchies-kaya-pizza"},
    {"title": "Kaya to open herb house costing over $60 million", "media_source": "Jamaica Gleaner", "link": "https://jamaica-gleaner.com/article/business/20191218/kaya-open-herb-house-costing-over-60-million"},
    {"title": "Ganja company Kaya enters export market", "media_source": "Gleaner", "link": "http://jamaica-gleaner.com/article/business/20200207/ganja-company-kaya-enters-export-market"},
    {"title": "Historic Kaya Extracts Completes First Cannabis Oil Export to Cayman Islands", "media_source": "Buzz Caribbean", "link": "https://buzz-caribbean.com/article/historic-kaya-extracts-completes-first-cannabis-oil-export-to-cayman-islands/"},
    {"title": "Jamaica, Long Opposed to Marijuana, Now Wants to Cash In on It", "media_source": "New York Times", "link": "https://www.nytimes.com/2019/01/18/world/americas/jamaica-marijuana.html"},
    {"title": "Meet the Mogul Bringing Great Weed Back to Jamaica", "media_source": "Rolling Stone", "link": "https://www.rollingstone.com/culture/culture-features/jamaica-weed-mogul-bali-vaswani-kaya-herb-house-1234755796/"},
    {"title": "Jamaica Welcomes Its First Legal Cannabis Retailer", "media_source": "Leafly", "link": "https://www.leafly.com/news/politics/jamaica-welcomes-its-first-legal-cannabis-retailer"},
    {"title": "Kaya Farms now open for business - Jamaica's first cannabis dispensary", "media_source": "Gleaner", "link": "http://jamaica-gleaner.com/article/social/20180316/kaya-farms-now-open-business-first-cannabis-dispensary-jamaica"},
    {"title": "Jamaica Opens First Medical Marijuana Facility", "media_source": "Fresh Toast", "link": "https://thefreshtoast.com/cannabis/jamaica-opens-first-medical-marijuana-facility/"},
    {"title": "Toker Travels: How To Buy Marijuana Legally In Jamaica", "media_source": "Forbes", "link": "https://www.forbes.com/sites/mikeadams/2018/05/03/toker-travels-how-to-buy-marijuana-legally-in-jamaica/"},
    {"title": "Kaya Herb House Expands To Kingston, Jamaica", "media_source": "Mary Jane Magazine", "link": "https://www.mary-magazine.com/travel/kaya-herb-house-expands-to-kingston/"},
    {"title": "Kaya Café: Irie little joint", "media_source": "Gleaner", "link": "https://www.jamaica-gleaner.com/article/food/20180315/kaya-cafe-irie-little-joint"},
    {"title": "Got to have Kaya now - Marley son advocates Bob's slang", "media_source": "Gleaner", "link": "http://jamaica-gleaner.com/article/entertainment/20180318/got-have-kaya-now-marley-son-advocates-bobs-slang"},
    {"title": "Jamaican Licensed Cannabis Producer Kaya Inc. Prepares to Go Public in Canada", "media_source": "New Cannabis Ventures", "link": "https://www.newcannabisventures.com/jamaican-licensed-cannabis-producer-kaya-inc-prepares-to-go-public-in-canada/"},
    {"title": "Kaya Herb House Cops Major Awards At CanEx Jamaica", "media_source": "Buzz Caribbean", "link": "https://buzz-caribbean.com/article/kaya-herb-house-cops-major-awards-at-canex-jamaica/"},
    {"title": "Another One! Kaya Herb House Opens New Dispensary", "media_source": "Buzz Caribbean", "link": "https://buzz-caribbean.com/article/another-one-kaya-herb-house-opens-new-dispensary/"},
    {"title": "Medical ganja dispensary Kaya expands to Falmouth", "media_source": "Loop Jamaica", "link": "https://jamaica.loopnews.com/content/medical-ganja-dispensary-kaya-expands-falmouth"}
]

async def populate_press_releases():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("📰 Populating Press Room with releases...")
    
    # Check if already populated
    count = await db.press_releases.count_documents({})
    if count > 0:
        print(f"⚠️  Press releases already exist ({count} found). Skipping...")
        return
    
    # Insert press releases
    for item in press_data:
        release = {
            "id": str(uuid.uuid4()),
            "title": item["title"],
            "media_source": item["media_source"],
            "link": item["link"],
            "published_at": datetime.now(timezone.utc).isoformat()
        }
        await db.press_releases.insert_one(release)
    
    print(f"✅ Inserted {len(press_data)} press releases")
    client.close()

if __name__ == "__main__":
    asyncio.run(populate_press_releases())
