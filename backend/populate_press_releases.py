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
    {"title": "Bus company Knutsford Express set for new hub at Drax Hall", "media_source": "Gleaner", "link": "http://jamaica-gleaner.com/article/business/20190418/bus-company-knutsford-express-set-new-hub-drax-hall"},
    {"title": "Buzz Capital Inc. provides update on Qualifying Transaction", "media_source": "Global News Wires", "link": "https://www.globenewswire.com/news-release/2018/06/27/1530421/0/en/Buzz-Capital-Inc-provides-update-on-Qualifying-Transaction-with-Kaya-Inc.html"},
    {"title": "CanEx Jamaica Business Conference & Expo 2017 in Montego Bay", "media_source": "Reggaeville", "link": "https://www.reggaeville.com/artist-details/gappy-ranks/news/view/canex-jamaica-business-conference-expo-2017-in-montego-bay/"},
    {"title": "Cannabis Licencing Authority approves 46 ganja applications, rejects 8", "media_source": "Gleaner", "link": "http://jamaica-gleaner.com/article/business/20170721/cannabis-licencing-authority-approves-46-ganja-applications-rejects-8"},
    {"title": "Chronixx – Official Website", "media_source": "Chronixx", "link": "https://chronixx.com/"},
    {"title": "Countdown begins for Jamaica's Inaugural Tmrw. Tday Culture", "media_source": "Gleaner", "link": "http://jamaica-gleaner.com/article/social/20170505/countdown-begins-jamaicas-inaugural-tmrw-tday-culture"},
    {"title": "David Rodigan @ Dubwise Jamaica 2019", "media_source": "Reggaeville", "link": "https://www.reggaeville.com/artist-details/david-rodigan/news/view/david-rodigan-dubwise-jamaica-2019/"},
    {"title": "Editorial: Removing obstacles for ganja industry", "media_source": "Gleaner", "link": "http://jamaica-gleaner.com/article/commentary/20180531/editorial-removing-obstacles-ganja-industry"},
    {"title": "Ganja company Kaya enters export market", "media_source": "Gleaner", "link": "http://jamaica-gleaner.com/article/business/20200207/ganja-company-kaya-enters-export-market"},
    {"title": "Ganja Labs confident in quest for global quality", "media_source": "Gleaner", "link": "http://jamaica-gleaner.com/article/business/20161026/ganja-labs-confident-quest-global-quality"},
    {"title": "Ganja Labs to expand", "media_source": "Gleaner", "link": "http://jamaica-gleaner.com/article/business/20160710/ganja-labs-expand"},
    {"title": "Got to have Kaya now - Marley son advocates Bob's slang", "media_source": "Gleaner", "link": "http://jamaica-gleaner.com/article/entertainment/20180318/got-have-kaya-now-marley-son-advocates-bobs-slang"},
    {"title": "Jamaica 'ganjapreneurs' awaiting US Senate verdict on marijuana bill", "media_source": "Stabrokenews", "link": "https://www.stabroeknews.com/2019/10/11/business/jamaica-ganjapreneurs-awaiting-us-senate-verdict-on-marijuana-bill/"},
    {"title": "Jamaica Based Kaya Group Ramps Up for the Five-Year Anniversary of Legal Medical Cannabis Sales", "media_source": "GlobeNewswire", "link": "https://www.globenewswire.com/news-release/2023/02/28/2617373/0/en/Jamaica-Based-Kaya-Group-Ramps-Up-for-the-Five-Year-Anniversary-of-Legal-Medical-Cannabis-Sales-on-March-10-with-the-IRIE-FM-Music-Awards.html"},
    {"title": "Jamaica está viviendo un boom en el 'turismo de marihuana'", "media_source": "Intriper (Argentina)", "link": "https://intriper.com/jamaica-esta-viviendo-un-boom-en-el-turismo-de-marihuana/"},
    {"title": "Jamaica Opens First Medical Marijuana Facility", "media_source": "Fresh Toast", "link": "https://thefreshtoast.com/cannabis/jamaica-opens-first-medical-marijuana-facility/"},
    {"title": "Jamaica Rises with the Help of Kaya Herb House's Bali Vaswani", "media_source": "CaribMagPlus", "link": "https://www.caribmagplus.com/jamaica-rises-with-the-help-of-kaya-herb-houses-bali-vaswani/"},
    {"title": "Jamaica Welcomes Its First Legal Cannabis Retailer", "media_source": "Leafly", "link": "https://www.leafly.com/news/politics/jamaica-welcomes-its-first-legal-cannabis-retailer"},
    {"title": "Jamaica, Long Opposed to Marijuana, Now Wants to Cash In on It", "media_source": "New York Times", "link": "https://www.nytimes.com/2019/01/18/world/americas/jamaica-marijuana.html"},
    {"title": "Jamaican Licensed Cannabis Producer Kaya Inc. Prepares to Go Public in Canada", "media_source": "New Cannabis Ventures", "link": "https://www.newcannabisventures.com/jamaican-licensed-cannabis-producer-kaya-inc-prepares-to-go-public-in-canada/"},
    {"title": "Jamaican Weed Exploitation & Sri Lanka Blasts: VICE News Tonight Full Episode", "media_source": "Vice", "link": "https://www.youtube.com/watch?v=yJ7xL5G1vM8"},
    {"title": "Kaya Café: Irie little joint", "media_source": "Gleaner", "link": "https://www.jamaica-gleaner.com/article/food/20180315/kaya-cafe-irie-little-joint"},
    {"title": "Kaya Cannabis company takes on first environmental project", "media_source": "Jamaica Gleaner", "link": "https://jamaica-gleaner.com/article/news/20210522/kaya-cannabis-company-takes-first-environmental-project"},
    {"title": "Kaya Farms now open for business - Jamaica's first cannabis dispensary", "media_source": "Gleaner", "link": "http://jamaica-gleaner.com/article/social/20180316/kaya-farms-now-open-business-first-cannabis-dispensary-jamaica"},
    {"title": "Kaya finds partner in Silo for magic mushroom retreats", "media_source": "Jamaica Gleaner", "link": "https://jamaica-gleaner.com/article/business/20230809/kaya-finds-partner-silo-magic-mushroom-retreats"},
    {"title": "Kaya heading to the Gap", "media_source": "Jamaica Gleaner", "link": "https://jamaica-gleaner.com/article/business/20220824/kaya-heading-gap"},
    {"title": "Kaya Herb House Expands To Kingston, Jamaica", "media_source": "Mary Jane Magazine", "link": "https://www.mary-magazine.com/travel/kaya-herb-house-expands-to-kingston/"},
    {"title": "Kaya Herb House is a Proud Sponsor and Partner of the Herb Curb at Rebel Salute", "media_source": "GlobeNewswire", "link": "https://www.globenewswire.com/news-release/2023/01/20/2592470/0/en/Kaya-Herb-House-is-a-Proud-Sponsor-and-Partner-of-the-Herb-Curb-at-Rebel-Salute-and-the-Rebel-Salute-festival.html"},
    {"title": "Kaya Herb House Opens In Kingston, Jamaica", "media_source": "Forbes", "link": "https://www.forbes.com/sites/benkollman/2023/07/14/kaya-herb-house-opens-in-kingston-jamaica/"},
    {"title": "Kaya to open herb house costing over $60 million", "media_source": "Jamaica Gleaner", "link": "https://jamaica-gleaner.com/article/business/20191218/kaya-open-herb-house-costing-over-60-million"},
    {"title": "Kaya to sell out to Silo Wellness", "media_source": "Jamaica Gleaner", "link": "https://jamaica-gleaner.com/article/business/20230830/kaya-sell-out-silo-wellness"},
    {"title": "Legal Marijuana Inches Forward in Jamaica", "media_source": "Cannabis Now", "link": "https://cannabisnow.com/jamaica-cannabis-decriminalization/"},
    {"title": "License to chill: The golden age of glamour is reborn in Jamaica", "media_source": "Tatler", "link": "https://www.tatler.com/article/license-to-chill-jamaica-glamour-reborn"},
    {"title": "Marijuana News - Jamaica Gets First Legal Ganja Retailer", "media_source": "News America Now", "link": "https://www.newsamericasnow.com/marijuana-news-jamaica-gets-first-legal-ganja-retailer/"},
    {"title": "Masterful Popcaan vanquish live", "media_source": "Jamaica Star", "link": "http://jamaica-star.com/article/entertainment/20200306/masterful-popcaan-vanquish-live"},
    {"title": "Medical ganja dispensary Kaya expands to Falmouth", "media_source": "Loop Jamaica", "link": "https://jamaica.loopnews.com/content/medical-ganja-dispensary-kaya-expands-falmouth"},
    {"title": "Meet the Mogul Bringing Great Weed Back to Jamaica", "media_source": "Rolling Stone", "link": "https://www.rollingstone.com/culture/culture-features/jamaica-weed-mogul-bali-vaswani-kaya-herb-house-1234755796/"},
    {"title": "Now Decriminalized, Could Jamaica Become Destination for Legal Weed?", "media_source": "Rolling Stone", "link": "https://www.rollingstone.com/culture/culture-news/jamaica-cannabis-decriminalization-legal-weed-880809/"},
    {"title": "Exclusive: Insight behind the vision & purpose of Kaya Herb House from CEO Balram Vaswani", "media_source": "Our Today", "link": "https://our.today/exclusive-insight-behind-the-vision-purpose-of-kaya-herb-house-from-ceo-balram-vaswani/"},
    {"title": "Exclusive: Kaya Herb House to open fourth location in Montego Bay", "media_source": "Our Today", "link": "https://our.today/exclusive-kaya-herb-house-to-open-fourth-location-in-montego-bay/"},
    {"title": "Port Antonio, Jamaica: Guide to a Music Hitmaking Paradise", "media_source": "Rolling Stone", "link": "https://www.rollingstone.com/music/music-features/port-antonio-jamaica-guide-938395/"},
    {"title": "Satisfy the munchies at Kaya Pizza", "media_source": "Gleaner", "link": "https://jamaica-gleaner.com/article/food/20210812/satisfy-munchies-kaya-pizza"},
    {"title": "Silo Wellness to Acquire Kaya Group in $43.3 Million Deal", "media_source": "BeautyMatter", "link": "https://beautymatter.com/articles/silo-wellness-to-acquire-kaya-group"},
    {"title": "SPF Weekend set to bring 'Ochi' alive again in summer 2019", "media_source": "Loop Jamaica", "link": "https://jamaica.loopnews.com/content/spf-weekend-set-bring-ochi-alive-again-summer-2019"},
    {"title": "The Oil & Grass Economy: Part Five", "media_source": "Trinidad TV CH 6", "link": "https://www.tv6tnt.com/news/7pmnews/the-oil-grass-economy-part-five/article_12cfaa2a-1dcd-11e9-bb6f-ef48b0c33a07.html"},
    {"title": "The Oil & Grass Economy: Part Four", "media_source": "Trinidad TV CH 6", "link": "https://www.tv6tnt.com/news/7pmnews/the-oil-grass-economy-part-four/article_8bd19038-1b5b-11e9-a8e5-c73060fec2bb.html"},
    {"title": "The Oil & Grass Economy: Part Three", "media_source": "Trinidad TV CH 6", "link": "https://www.tv6tnt.com/news/7pmnews/the-oil-grass-economy-part-three/article_2b2ec356-1a7d-11e9-be79-c3e48a7ac9af.html"},
    {"title": "The Oil & Grass Economy: Part Two", "media_source": "Trinidad TV CH 6", "link": "https://www.tv6tnt.com/news/7pmnews/the-oil-grass-economy-part-two/article_f0d27138-19d9-11e9-9290-ef73d8a5be9a.html"},
    {"title": "The Oil and Grass Economy: Part One", "media_source": "Trinidad TV CH 6", "link": "https://www.tv6tnt.com/news/the-oil-and-grass-economy-part-one/article_fb63ddc0-1827-11e9-9eb2-bf340e47f990.html"},
    {"title": "Toker Travels: How To Buy Marijuana Legally In Jamaica", "media_source": "Forbes", "link": "https://www.forbes.com/sites/mikeadams/2018/05/03/toker-travels-how-to-buy-marijuana-legally-in-jamaica/"},
    {"title": "Vaswani to remain head of Kaya after sale to Silo", "media_source": "Jamaica Gleaner", "link": "https://jamaica-gleaner.com/article/business/20240616/vaswani-remain-head-kaya-after-sale-silo"},
    {"title": "Si vas a Jamaica, deberías visitar estas tiendas", "media_source": "Revista Cáñamo (Spain)", "link": "https://canamo.net/noticias/mundo/si-vas-jamaica-deberias-visitar-estas-tiendas"},
    {"title": "Mike Tyson's Cannabis-Infused Pre-Rolls and Vapes Reach Jamaica Via Kaya Group Partnership", "media_source": "Benzinga", "link": "https://www.benzinga.com/markets/cannabis/24/11/42165010/mike-tysons-cannabis-infused-pre-rolls-and-vapes-reach-jamaica-via-kaya-group-partnership"},
    {"title": "4/20 Cooyah Party brings the vibes", "media_source": "Jamaica Observer", "link": "https://www.jamaicaobserver.com/entertainment/4-20-cooyah-party-brings-the-vibes/"},
    {"title": "Everyday People to host first Caribbean staging in Jamaica", "media_source": "Jamaica Observer", "link": "https://www.jamaicaobserver.com/entertainment/everyday-people-to-host-first-caribbean-staging-in-jamaica/"},
    {"title": "Kaya Herb House Cops Major Awards At CanEx Jamaica", "media_source": "Buzz Caribbean", "link": "https://buzz-caribbean.com/article/kaya-herb-house-cops-major-awards-at-canex-jamaica/"},
    {"title": "Another One! Kaya Herb House Opens New Dispensary", "media_source": "Buzz Caribbean", "link": "https://buzz-caribbean.com/article/another-one-kaya-herb-house-opens-new-dispensary/"},
    {"title": "Rodigan Returns", "media_source": "Jamaica Observer", "link": "https://www.jamaicaobserver.com/lifestyle/Rodigan-Returns_18026702?profile=1606"},
    {"title": "Ganja yoga: A review", "media_source": "Stylecaster", "link": "https://stylecaster.com/beauty/ganja-yoga-review/"},
    {"title": "Jamaica Cannabis Dispensary: Kaya", "media_source": "DOPE", "link": "https://dopemagazine.com/jamaica-cannabis-dispensary-kaya/"},
    {"title": "Rodigan, Delano & Rory look to blend roots, dancehall & dubwise", "media_source": "Loop Jamaica", "link": "http://www.loopjamaica.com/content/rodigan-delano-rory-look-blend-roots-dancehall-dubwise"},
    {"title": "Ganja exports, IPOs touted as SAFE winners", "media_source": "Gleaner", "link": "https://jamaica-gleaner.com/article/business/20201223/ganja-exports-ipos-touted-safe-winners-jamaican-ganjapreneurs-cheer-prospects-marijuana"},
    {"title": "In the land with a rich history of growing weed, cannabis capitalism is an uneasy fit", "media_source": "Financial Post", "link": "https://financialpost.com/cannabis-as-medicine/in-the-land-with-a-rich-history-of-growing-weed-cannabis-capitalism-is-an-uneasy-fit"},
    {"title": "Jamaica's medical ganja industry takes historic step: Kaya", "media_source": "Loop Jamaica", "link": "http://www.loopjamaica.com/content/jamas-medical-ganja-industry-takes-historic-step-kaya"},
    {"title": "Kaya Farms set to open Jamaica's 1st legal medical cannabis facility", "media_source": "Loop Jamaica", "link": "http://www.loopjamaica.com/content/kaya-farms-set-open-jamaicas-1st-legal-medical-cannabis-facility"},
    {"title": "Jamaica Opens Marijuana Retail", "media_source": "Jamaicans.com", "link": "https://jamaicans.com/jamaica-opens-marijuana-retail/"},
    {"title": "Jamaica's cannabis gamble", "media_source": "ECONOMIST", "link": "https://www.economist.com/the-americas/2019/04/17/jamaicas-cannabis-gamble"},
    {"title": "Jamaica: First Medical Cannabis Facility", "media_source": "Canna Business Times", "link": "https://www.cannabisbusinesstimes.com/article/jamaica-first-medical-cannabis-facility/"},
    {"title": "Jamaica Just Opened Its Very First Marijuana Dispensary", "media_source": "CIVILIZED", "link": "https://www.civilized.life/articles/jamaica-just-opened-its-very-first-marijuana-dispensary/"},
    {"title": "Montel Williams Ganja Conference In Montego Bay", "media_source": "Loop Jamaica", "link": "http://www.loopjamaica.com/content/montel-williams-ganja-conference-montego-bay"},
    {"title": "Ganja Babie and other trademarks in the pipeline", "media_source": "Gleaner", "link": "https://www.jamaica-gleaner.com/article/business/20170208/ganja-babie-other-trademarks-pipeline"},
    {"title": "Does 4/20 Still Matter?", "media_source": "Rolling Stone", "link": "https://www.rollingstone.com/culture/culture-features/does-4-20-still-matter-110210/"},
    {"title": "Bali Vaswani, Chief Ganja Officer", "media_source": "Dope Magazine", "link": "https://dopemagazine.com/bali-vaswani-chief-ganja-officer/"},
    {"title": "NorCal December: The Holiday Issue", "media_source": "Dope Magazine", "link": "https://issuu.com/dopemag/docs/norcal_december_the_holiday_issue/65"},
    {"title": "The RSVP Issue", "media_source": "Observer", "link": "http://www.jamaicaobserver.com/lifestyle/The-RSVP-Issue_18026703"},
    {"title": "Ab sofort: Medizinisches Cannabis auf Jamaika", "media_source": "Highway Magazine Germany", "link": "http://highway-magazin.de/news/international/ab-sofort-medizinisches-cannabis-auf-jamaika"},
    {"title": "Maryland Ballot Hearing", "media_source": "Cannabusiness Times", "link": "https://www.cannabisbusinesstimes.com/article/maryland-ballot-hearing/"},
    {"title": "David Rodigan for three J-Can concerts", "media_source": "Observer", "link": "http://www.jamaicaobserver.com/splash/david-rodigan-for-three-j-can-concerts_177514"},
    {"title": "When Rodigan...", "media_source": "Observer", "link": "http://www.jamaicaobserver.com/entertainment/when-rodigan_179653?profile=1606"},
    {"title": "Fully Loaded makes a comeback", "media_source": "Observer", "link": "http://www.jamaicaobserver.com/splash/fully-loaded-makes-comeback_168456?profile=1119"},
    {"title": "Travel Experts Say Jamaica Could Be King Of Marijuana Tourism", "media_source": "Travel Pulse", "link": "https://www.travelpulse.com/news/destinations/travel-experts-say-jamaica-could-be-king-of-marijuana-tourism.html"},
    {"title": "An Oakland Weed Writer Smokes Ganja in Jamaica", "media_source": "East Bay Express", "link": "https://www.eastbayexpress.com/oakland/an-oakland-weed-writer-smokes-ganja-in-jamaica/Content?oid=18390379"},
    {"title": "Pot Barons", "media_source": "CNBC", "link": "http://www.msnbc.com/pot-barons"},
    {"title": "Jamaica Cannabis Tourism", "media_source": "CVM TV", "link": "https://www.youtube.com/watch?v=nlg03wYf0j0"},
    {"title": "Cannabis Business in Jamaica", "media_source": "CVM TV", "link": "https://www.youtube.com/watch?v=DSoF69eeJ_Y"},
    {"title": "Historic Kaya Extracts Completes First Cannabis Oil Export to Cayman Islands", "media_source": "Buzz Caribbean", "link": "https://buzz-caribbean.com/article/historic-kaya-extracts-completes-first-cannabis-oil-export-to-cayman-islands/"},
    {"title": "Kaya ships ganja to Australia", "media_source": "Gleaner", "link": "https://jamaica-gleaner.com/article/business/20211126/kaya-ships-ganja-australia"},
    {"title": "Build A Vibe: Berners Vibes Collaborates With Jamaica's Kaya Herb House", "media_source": "Benzinga", "link": "https://www.benzinga.com/markets/cannabis/21/12/24698309/build-a-vibe-berners-vibes-collaborates-with-jamaicas-kaya-herb-house"},
    {"title": "Kaya eyes merger with US company for further expansion", "media_source": "Observer", "link": "https://www.jamaicaobserver.com/business-observer/kaya-eyes-merger-with-us-company-further-expansion_228429"},
    {"title": "Businessman Bali Vaswani advises a more planned approach to economic reopening", "media_source": "Observer", "link": "https://www.jamaicaobserver.com/business-report/businessman-bali-vaswani-advises-a-more-planned-approach-to-economic-reopening_225613"}
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
