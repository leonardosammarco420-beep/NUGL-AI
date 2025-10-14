"""
Affiliate partner mapping for news sources and products
Maps news sources to affiliate programs with commission rates
"""

AFFILIATE_PARTNERS = {
    # Cannabis News & Info
    'Leafly': {
        'partner_id': 'leafly',
        'affiliate_url': 'https://www.leafly.com/?ref=nugl',
        'commission_rate': 0.10,  # 10% commission
        'category': 'cannabis'
    },
    'Marijuana Moment': {
        'partner_id': 'marijuana-moment',
        'affiliate_url': 'https://www.marijuanamoment.net/?ref=nugl',
        'commission_rate': 0.05,
        'category': 'cannabis'
    },
    'CannabisNow': {
        'partner_id': 'cannabis-now',
        'affiliate_url': 'https://cannabisnow.com/?ref=nugl',
        'commission_rate': 0.08,
        'category': 'cannabis'
    },
    
    # Seed Banks
    'Seedsman': {
        'partner_id': 'seedsman',
        'affiliate_url': 'https://www.seedsman.com/?a_aid=nugl',
        'commission_rate': 0.15,
        'category': 'seeds'
    },
    'ILGM': {
        'partner_id': 'ilgm',
        'affiliate_url': 'https://ilgm.com/?ref=nugl',
        'commission_rate': 0.20,
        'category': 'seeds'
    },
    
    # Crypto News
    'CoinTelegraph': {
        'partner_id': 'cointelegraph',
        'affiliate_url': 'https://cointelegraph.com/?ref=nugl',
        'commission_rate': 0.05,
        'category': 'crypto'
    },
    'CoinDesk': {
        'partner_id': 'coindesk',
        'affiliate_url': 'https://www.coindesk.com/?ref=nugl',
        'commission_rate': 0.05,
        'category': 'crypto'
    },
    
    # Jamaica News
    'Jamaica Gleaner': {
        'partner_id': 'jamaica-gleaner',
        'affiliate_url': 'https://jamaica-gleaner.com/?ref=nugl',
        'commission_rate': 0.08,
        'category': 'jamaica'
    },
    'Jamaica Observer': {
        'partner_id': 'jamaica-observer',
        'affiliate_url': 'http://www.jamaicaobserver.com/?ref=nugl',
        'commission_rate': 0.08,
        'category': 'jamaica'
    },
    
    # Market Data
    'Bloomberg': {
        'partner_id': 'bloomberg',
        'affiliate_url': 'https://www.bloomberg.com/?ref=nugl',
        'commission_rate': 0.03,
        'category': 'market'
    },
    'Yahoo Finance': {
        'partner_id': 'yahoo-finance',
        'affiliate_url': 'https://finance.yahoo.com/?ref=nugl',
        'commission_rate': 0.02,
        'category': 'market'
    }
}

def get_affiliate_link(source_name: str) -> dict:
    """Get affiliate link for a news source"""
    if source_name in AFFILIATE_PARTNERS:
        return AFFILIATE_PARTNERS[source_name]
    return None

def generate_tracking_link(source_name: str, article_id: str) -> str:
    """Generate a tracked affiliate link"""
    partner = get_affiliate_link(source_name)
    if partner:
        return f"{partner['affiliate_url']}&article={article_id}"
    return None
