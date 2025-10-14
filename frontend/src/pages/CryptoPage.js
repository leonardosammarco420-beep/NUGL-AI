import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, Zap, BarChart3, Bell, Star } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { toast } from 'sonner';

export default function CryptoPage() {
  const { user, token, API } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cryptoPrices, setCryptoPrices] = useState({ crypto: [], stocks: [] });
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [historicalData, setHistoricalData] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [orderType, setOrderType] = useState('buy');
  const [orderAmount, setOrderAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCryptoPrices();
    fetchHistoricalData('bitcoin');
    if (user && token) {
      fetchPortfolio();
    }
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchCryptoPrices();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user, token]);

  const fetchCryptoPrices = async () => {
    try {
      const response = await axios.get(`${API}/crypto/prices`);
      setCryptoPrices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch crypto prices');
      setLoading(false);
    }
  };

  const fetchHistoricalData = async (coinId) => {
    try {
      const response = await axios.get(`${API}/crypto/historical/${coinId}?days=7`);
      // Format for charts
      const formatted = response.data.prices.map(item => ({
        date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: item.price
      }));
      setHistoricalData(formatted);
    } catch (error) {
      console.error('Failed to fetch historical data');
    }
  };

  const fetchPortfolio = async () => {
    if (!token) return;
    try {
      // Mock portfolio data - in production, fetch from user's actual holdings
      const holdings = [
        { symbol: 'BTC', amount: 0.5, invested: 20000 },
        { symbol: 'ETH', amount: 5, invested: 10000 },
        { symbol: 'SOL', amount: 50, invested: 5000 }
      ];
      
      const response = await axios.post(
        `${API}/crypto/portfolio-value`,
        holdings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPortfolio(response.data);
    } catch (error) {
      console.error('Failed to fetch portfolio');
    }
  };

  const handleTrade = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to trade');
      return;
    }
    if (!orderAmount || parseFloat(orderAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // In production, integrate with actual crypto exchange API
    toast.success(`${orderType === 'buy' ? 'Buy' : 'Sell'} order placed for ${orderAmount} ${selectedCoin.toUpperCase()}`);
    setOrderAmount('');
    
    // Record transaction
    try {
      await axios.post(
        `${API}/transactions`,
        {
          user_id: user.id,
          type: `crypto_${orderType}`,
          amount: parseFloat(orderAmount),
          currency: selectedCoin.toUpperCase(),
          status: 'completed'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh portfolio
      fetchPortfolio();
    } catch (error) {
      console.error('Failed to record transaction');
    }
  };

  const handleCoinSelect = (coinId) => {
    setSelectedCoin(coinId);
    fetchHistoricalData(coinId);
  };

  const selectedCoinData = cryptoPrices.crypto.find(c => c.id === selectedCoin);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8" data-testid="crypto-header">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Crypto Hub
          </h1>
          <p className="text-gray-400">Exchange, Portfolio & Market Intelligence</p>
        </div>

        {/* Live Price Ticker */}
        <Card className="bg-slate-800/50 border-teal-500/20 p-4 mb-8">
          <div className="flex items-center gap-6 overflow-x-auto">
            <span className="text-gray-400 text-sm whitespace-nowrap flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal-400" /> LIVE PRICES
            </span>
            {cryptoPrices.crypto.slice(0, 6).map((coin) => (
              <div key={coin.symbol} className="flex items-center gap-3 whitespace-nowrap">
                <span className="text-white font-semibold">{coin.symbol}</span>
                <span className="text-gray-400">${coin.price.toLocaleString()}</span>
                <span className={`text-sm font-medium flex items-center gap-1 ${
                  coin.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {coin.change_24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(coin.change_24h).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Tabs defaultValue="exchange" className="w-full">
          <TabsList className="bg-slate-800 mb-6">
            <TabsTrigger value="exchange">Exchange</TabsTrigger>
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="news">Crypto News</TabsTrigger>
          </TabsList>

          {/* Exchange Tab */}
          <TabsContent value="exchange" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trading Panel */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Trade Cryptocurrency</h3>
                  
                  {/* Coin Selector */}
                  <div className="mb-6">
                    <label className="text-gray-400 text-sm mb-2 block">Select Asset</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {cryptoPrices.crypto.slice(0, 10).map((coin) => (
                        <button
                          key={coin.id}
                          onClick={() => handleCoinSelect(coin.id)}
                          className={`p-3 rounded-lg border transition-all ${
                            selectedCoin === coin.id
                              ? 'bg-teal-500/20 border-teal-500 text-white'
                              : 'bg-slate-700/50 border-slate-600 text-gray-400 hover:border-teal-500/50'
                          }`}
                        >
                          <div className="font-semibold text-sm">{coin.symbol}</div>
                          <div className={`text-xs ${
                            coin.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {coin.change_24h >= 0 ? '+' : ''}{coin.change_24h.toFixed(1)}%
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Chart */}
                  {selectedCoinData && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">{selectedCoinData.name}</p>
                          <p className="text-3xl font-bold text-white">${selectedCoinData.price.toLocaleString()}</p>
                        </div>
                        <div className={`flex items-center gap-2 ${
                          selectedCoinData.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {selectedCoinData.change_24h >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                          <span className="text-2xl font-semibold">
                            {selectedCoinData.change_24h >= 0 ? '+' : ''}{selectedCoinData.change_24h.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={historicalData}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                            labelStyle={{ color: '#f8fafc' }}
                          />
                          <Area type="monotone" dataKey="price" stroke="#14b8a6" fillOpacity={1} fill="url(#colorPrice)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Order Form */}
                  <form onSubmit={handleTrade}>
                    <div className="flex gap-2 mb-4">
                      <Button
                        type="button"
                        onClick={() => setOrderType('buy')}
                        className={`flex-1 ${
                          orderType === 'buy'
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        data-testid="buy-button"
                      >
                        Buy
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setOrderType('sell')}
                        className={`flex-1 ${
                          orderType === 'sell'
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        data-testid="sell-button"
                      >
                        Sell
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">Amount ({selectedCoinData?.symbol})</label>
                        <Input
                          type="number"
                          step="0.00000001"
                          placeholder="0.00"
                          value={orderAmount}
                          onChange={(e) => setOrderAmount(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                          data-testid="order-amount-input"
                        />
                      </div>

                      {selectedCoinData && orderAmount && (
                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-400">Total (USD)</span>
                            <span className="text-white font-semibold">
                              ${(parseFloat(orderAmount) * selectedCoinData.price).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Trading Fee (0.5%)</span>
                            <span className="text-white font-semibold">
                              ${((parseFloat(orderAmount) * selectedCoinData.price) * 0.005).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className={`w-full ${
                          orderType === 'buy'
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-red-500 hover:bg-red-600'
                        } text-white`}
                        data-testid="submit-order-button"
                      >
                        {orderType === 'buy' ? 'Buy' : 'Sell'} {selectedCoinData?.symbol}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>

              {/* Market Stats Sidebar */}
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-teal-400" />
                    Top Gainers (24h)
                  </h4>
                  <div className="space-y-3">
                    {cryptoPrices.crypto
                      .sort((a, b) => b.change_24h - a.change_24h)
                      .slice(0, 5)
                      .map((coin) => (
                        <div key={coin.symbol} className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{coin.symbol}</p>
                            <p className="text-gray-400 text-xs">{coin.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white text-sm">${coin.price.toLocaleString()}</p>
                            <p className="text-green-400 text-xs font-semibold">+{coin.change_24h.toFixed(2)}%</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>

                <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                  <h4 className="text-white font-semibold mb-4">Trading Volume (24h)</h4>
                  <div className="space-y-3">
                    {cryptoPrices.crypto
                      .filter(c => c.volume_24h)
                      .sort((a, b) => b.volume_24h - a.volume_24h)
                      .slice(0, 3)
                      .map((coin) => (
                        <div key={coin.symbol}>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-400 text-sm">{coin.symbol}</span>
                            <span className="text-white text-sm">${(coin.volume_24h / 1e9).toFixed(2)}B</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full"
                              style={{ width: `${Math.min((coin.volume_24h / cryptoPrices.crypto[0]?.volume_24h) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            {!user ? (
              <Card className="bg-slate-800/50 border-teal-500/20 p-12 text-center">
                <Wallet className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Login to View Portfolio</h3>
                <p className="text-gray-400 mb-6">Track your crypto holdings and performance</p>
                <Button onClick={() => navigate('/')} className="bg-teal-500 hover:bg-teal-600">
                  Sign In
                </Button>
              </Card>
            ) : portfolio ? (
              <>
                {/* Portfolio Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/30 p-6">
                    <p className="text-gray-400 text-sm mb-2">Total Portfolio Value</p>
                    <p className="text-3xl font-bold text-white mb-2">${portfolio.total_value?.toLocaleString()}</p>
                    <p className="text-green-400 text-sm">All time</p>
                  </Card>
                  <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                    <p className="text-gray-400 text-sm mb-2">Total Invested</p>
                    <p className="text-3xl font-bold text-white mb-2">$35,000</p>
                    <p className="text-gray-400 text-sm">Initial capital</p>
                  </Card>
                  <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                    <p className="text-gray-400 text-sm mb-2">Total Gain/Loss</p>
                    <p className="text-3xl font-bold text-green-400 mb-2">+$4,248</p>
                    <p className="text-green-400 text-sm">+12.14%</p>
                  </Card>
                </div>

                {/* Holdings */}
                <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Your Holdings</h3>
                  <div className="space-y-4">
                    {portfolio.holdings?.map((holding, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                            {holding.symbol[0]}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{holding.symbol}</p>
                            <p className="text-gray-400 text-sm">{holding.amount} coins</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">${holding.value?.toLocaleString()}</p>
                          <p className={`text-sm ${
                            holding.value > holding.invested ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {holding.value > holding.invested ? '+' : ''}
                            ${(holding.value - holding.invested).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400">Loading portfolio...</p>
              </div>
            )}
          </TabsContent>

          {/* Markets Tab */}
          <TabsContent value="markets" className="space-y-6">
            <Card className="bg-slate-800/50 border-teal-500/20 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">All Markets</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-gray-400 text-sm pb-3">#</th>
                      <th className="text-left text-gray-400 text-sm pb-3">Name</th>
                      <th className="text-right text-gray-400 text-sm pb-3">Price</th>
                      <th className="text-right text-gray-400 text-sm pb-3">24h %</th>
                      <th className="text-right text-gray-400 text-sm pb-3">Market Cap</th>
                      <th className="text-right text-gray-400 text-sm pb-3">Volume (24h)</th>
                      <th className="text-right text-gray-400 text-sm pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cryptoPrices.crypto.map((coin, idx) => (
                      <tr key={coin.symbol} className="border-b border-slate-700/50">
                        <td className="py-4 text-gray-400">{idx + 1}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                              {coin.symbol[0]}
                            </div>
                            <div>
                              <p className="text-white font-medium">{coin.symbol}</p>
                              <p className="text-gray-400 text-xs">{coin.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-right text-white">${coin.price.toLocaleString()}</td>
                        <td className={`py-4 text-right font-semibold ${
                          coin.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {coin.change_24h >= 0 ? '+' : ''}{coin.change_24h.toFixed(2)}%
                        </td>
                        <td className="py-4 text-right text-white">
                          {coin.market_cap ? `$${(coin.market_cap / 1e9).toFixed(2)}B` : '-'}
                        </td>
                        <td className="py-4 text-right text-white">
                          {coin.volume_24h ? `$${(coin.volume_24h / 1e9).toFixed(2)}B` : '-'}
                        </td>
                        <td className="py-4 text-right">
                          <Button
                            size="sm"
                            onClick={() => {
                              handleCoinSelect(coin.id);
                              document.querySelector('[value="exchange"]').click();
                            }}
                            className="bg-teal-500 hover:bg-teal-600"
                          >
                            Trade
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Crypto News Tab */}
          <TabsContent value="news" className="space-y-6">
            <Card className="bg-slate-800/50 border-teal-500/20 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Latest Crypto News</h3>
              <p className="text-gray-400">Integrated crypto news coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}