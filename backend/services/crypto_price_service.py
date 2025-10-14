from pycoingecko import CoinGeckoAPI
import logging
from typing import List, Dict, Optional
import asyncio
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class CryptoPriceService:
    """Service for fetching live crypto prices from CoinGecko"""
    
    # Supported cryptocurrencies
    SUPPORTED_COINS = {
        'bitcoin': {'symbol': 'BTC', 'name': 'Bitcoin'},
        'ethereum': {'symbol': 'ETH', 'name': 'Ethereum'},
        'solana': {'symbol': 'SOL', 'name': 'Solana'},
        'cardano': {'symbol': 'ADA', 'name': 'Cardano'},
        'polkadot': {'symbol': 'DOT', 'name': 'Polkadot'},
        'dogecoin': {'symbol': 'DOGE', 'name': 'Dogecoin'},
        'ripple': {'symbol': 'XRP', 'name': 'XRP'},
        'binancecoin': {'symbol': 'BNB', 'name': 'Binance Coin'},
        'usd-coin': {'symbol': 'USDC', 'name': 'USD Coin'},
        'tether': {'symbol': 'USDT', 'name': 'Tether'}
    }
    
    # Cannabis stocks (using crypto as proxy - in production use stock API)
    CANNABIS_STOCKS = {
        'TLRY': {'name': 'Tilray Brands', 'price': 3.45, 'change': -2.1},
        'CGC': {'name': 'Canopy Growth', 'price': 7.23, 'change': 3.8},
        'SNDL': {'name': 'Sundial Growers', 'price': 2.15, 'change': 1.5},
        'CRON': {'name': 'Cronos Group', 'price': 3.12, 'change': -1.2},
        'ACB': {'name': 'Aurora Cannabis', 'price': 4.56, 'change': 2.3}
    }
    
    def __init__(self):
        self.cg = CoinGeckoAPI()
        self._cache = {}
        self._cache_timestamp = None
        self._cache_duration = 30  # Cache for 30 seconds
    
    async def get_live_prices(self, coin_ids: Optional[List[str]] = None) -> Dict:
        """Get live crypto prices"""
        try:
            # Use cache if available and fresh
            if self._is_cache_valid():
                return self._cache
            
            # Get coins to fetch
            if coin_ids is None:
                coin_ids = list(self.SUPPORTED_COINS.keys())
            
            # Fetch prices from CoinGecko
            loop = asyncio.get_event_loop()
            prices_data = await loop.run_in_executor(
                None,
                lambda: self.cg.get_price(
                    ids=','.join(coin_ids),
                    vs_currencies='usd',
                    include_24hr_change=True,
                    include_24hr_vol=True,
                    include_market_cap=True
                )
            )
            
            # Format response
            result = {
                'crypto': [],
                'stocks': [],
                'last_updated': datetime.now(timezone.utc).isoformat()
            }
            
            # Process crypto prices
            for coin_id, data in prices_data.items():
                if coin_id in self.SUPPORTED_COINS:
                    coin_info = self.SUPPORTED_COINS[coin_id]
                    result['crypto'].append({
                        'id': coin_id,
                        'symbol': coin_info['symbol'],
                        'name': coin_info['name'],
                        'price': data.get('usd', 0),
                        'change_24h': data.get('usd_24h_change', 0),
                        'volume_24h': data.get('usd_24h_vol', 0),
                        'market_cap': data.get('usd_market_cap', 0)
                    })
            
            # Add cannabis stocks (simulated for now)
            for symbol, data in self.CANNABIS_STOCKS.items():
                result['stocks'].append({
                    'symbol': symbol,
                    'name': data['name'],
                    'price': data['price'],
                    'change': data['change']
                })
            
            # Update cache
            self._cache = result
            self._cache_timestamp = datetime.now(timezone.utc)
            
            logger.info(f"Fetched prices for {len(result['crypto'])} cryptocurrencies")
            return result
            
        except Exception as e:
            logger.error(f"Error fetching crypto prices: {str(e)}")
            # Return cached data if available, otherwise return empty
            return self._cache if self._cache else {'crypto': [], 'stocks': [], 'last_updated': None}
    
    async def get_coin_price(self, coin_id: str) -> Optional[Dict]:
        """Get price for a specific coin"""
        try:
            loop = asyncio.get_event_loop()
            data = await loop.run_in_executor(
                None,
                lambda: self.cg.get_price(
                    ids=coin_id,
                    vs_currencies='usd',
                    include_24hr_change=True
                )
            )
            
            if coin_id in data:
                coin_info = self.SUPPORTED_COINS.get(coin_id, {'symbol': coin_id.upper(), 'name': coin_id})
                return {
                    'id': coin_id,
                    'symbol': coin_info['symbol'],
                    'name': coin_info['name'],
                    'price': data[coin_id].get('usd', 0),
                    'change_24h': data[coin_id].get('usd_24h_change', 0)
                }
            return None
        except Exception as e:
            logger.error(f"Error fetching price for {coin_id}: {str(e)}")
            return None
    
    async def get_historical_prices(self, coin_id: str, days: int = 30) -> List[Dict]:
        """Get historical price data"""
        try:
            loop = asyncio.get_event_loop()
            data = await loop.run_in_executor(
                None,
                lambda: self.cg.get_coin_market_chart_by_id(
                    id=coin_id,
                    vs_currency='usd',
                    days=days
                )
            )
            
            # Format data for charts
            prices = []
            for timestamp, price in data['prices']:
                prices.append({
                    'timestamp': timestamp,
                    'date': datetime.fromtimestamp(timestamp / 1000, tz=timezone.utc).isoformat(),
                    'price': price
                })
            
            return prices
        except Exception as e:
            logger.error(f"Error fetching historical prices for {coin_id}: {str(e)}")
            return []
    
    async def get_trending_coins(self) -> List[Dict]:
        """Get trending cryptocurrencies"""
        try:
            loop = asyncio.get_event_loop()
            data = await loop.run_in_executor(None, self.cg.get_search_trending)
            
            trending = []
            for item in data.get('coins', [])[:10]:
                coin = item['item']
                trending.append({
                    'id': coin['id'],
                    'symbol': coin['symbol'],
                    'name': coin['name'],
                    'market_cap_rank': coin.get('market_cap_rank', 0),
                    'thumb': coin.get('thumb', '')
                })
            
            return trending
        except Exception as e:
            logger.error(f"Error fetching trending coins: {str(e)}")
            return []
    
    def _is_cache_valid(self) -> bool:
        """Check if cache is still valid"""
        if not self._cache or not self._cache_timestamp:
            return False
        
        age = (datetime.now(timezone.utc) - self._cache_timestamp).total_seconds()
        return age < self._cache_duration
    
    async def calculate_portfolio_value(self, holdings: List[Dict]) -> Dict:
        """Calculate total portfolio value"""
        try:
            # Get current prices
            prices = await self.get_live_prices()
            price_map = {item['symbol']: item['price'] for item in prices['crypto']}
            
            total_value = 0
            holdings_value = []
            
            for holding in holdings:
                symbol = holding.get('symbol')
                amount = holding.get('amount', 0)
                
                if symbol in price_map:
                    current_price = price_map[symbol]
                    value = amount * current_price
                    total_value += value
                    
                    holdings_value.append({
                        'symbol': symbol,
                        'amount': amount,
                        'price': current_price,
                        'value': value,
                        'invested': holding.get('invested', 0)
                    })
            
            return {
                'total_value': total_value,
                'holdings': holdings_value,
                'last_updated': datetime.now(timezone.utc).isoformat()
            }
        except Exception as e:
            logger.error(f"Error calculating portfolio value: {str(e)}")
            return {'total_value': 0, 'holdings': [], 'last_updated': None}