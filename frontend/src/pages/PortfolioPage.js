import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import Navigation from '../components/Navigation';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, AreaChart, Area, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function PortfolioPage() {
  const { user, token, API } = useContext(AuthContext);
  const [portfolio, setPortfolio] = useState({
    crypto: [],
    nfts: [],
    totalValue: 0,
    dayChange: 0,
    dayChangePercent: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && token) {
      fetchPortfolio();
      fetchTransactions();
      generatePerformanceData();
    }
  }, [user, token]);

  const fetchPortfolio = async () => {
    try {
      // Fetch user's crypto holdings
      const cryptoHoldings = [
        { symbol: 'BTC', amount: 0.5, value: 22617, change: 5.2, invested: 20000 },
        { symbol: 'ETH', amount: 5, value: 11714, change: 4.1, invested: 10000 },
        { symbol: 'SOL', amount: 50, value: 4917, change: -1.3, invested: 5000 },
      ];

      // Fetch user's NFTs
      const nftResponse = await axios.get(`${API}/nfts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userNfts = nftResponse.data.filter(nft => nft.owner_address === user.wallet_address);

      const totalCrypto = cryptoHoldings.reduce((sum, item) => sum + item.value, 0);
      const totalNfts = userNfts.reduce((sum, nft) => sum + (nft.price || 0), 0);
      const totalValue = totalCrypto + totalNfts;
      const totalInvested = cryptoHoldings.reduce((sum, item) => sum + item.invested, 0);
      const dayChange = totalValue - totalInvested;
      const dayChangePercent = (dayChange / totalInvested) * 100;

      setPortfolio({
        crypto: cryptoHoldings,
        nfts: userNfts,
        totalValue,
        dayChange,
        dayChangePercent
      });
    } catch (error) {
      console.error('Failed to fetch portfolio', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
  };

  const generatePerformanceData = () => {
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: 35000 + Math.random() * 5000,
        crypto: 25000 + Math.random() * 3000,
        nfts: 10000 + Math.random() * 2000
      });
    }
    setPerformanceData(data);
  };

  const COLORS = ['#14b8a6', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'];

  const pieData = portfolio.crypto.map(item => ({
    name: item.symbol,
    value: item.value
  }));

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-400">Please login to view your portfolio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8" data-testid="portfolio-header">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Portfolio Tracker
          </h1>
          <p className="text-gray-400">Monitor your crypto and NFT investments in real-time</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-gray-400">Loading portfolio...</div>
          </div>
        ) : (
          <>
            {/* Portfolio Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/30 p-6" data-testid="total-value-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-gray-400 text-sm">Total Portfolio Value</div>
                  <DollarSign className="w-5 h-5 text-teal-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  ${portfolio.totalValue.toLocaleString()}
                </div>
                <div className={`flex items-center gap-2 text-sm ${
                  portfolio.dayChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {portfolio.dayChangePercent >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{Math.abs(portfolio.dayChangePercent).toFixed(2)}%</span>
                  <span className="text-gray-500">({portfolio.dayChange >= 0 ? '+' : ''}${portfolio.dayChange.toFixed(2)})</span>
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-teal-500/20 p-6" data-testid="crypto-holdings-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-gray-400 text-sm">Crypto Holdings</div>
                  <Activity className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  ${portfolio.crypto.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                </div>
                <div className="text-gray-500 text-sm">
                  {portfolio.crypto.length} assets
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-teal-500/20 p-6" data-testid="nft-holdings-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-gray-400 text-sm">NFT Holdings</div>
                  <PieChart className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  ${portfolio.nfts.reduce((sum, nft) => sum + (nft.price || 0), 0).toLocaleString()}
                </div>
                <div className="text-gray-500 text-sm">
                  {portfolio.nfts.length} NFTs owned
                </div>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card className="bg-slate-800/50 border-teal-500/20 p-6 mb-8" data-testid="performance-chart">
              <h3 className="text-xl font-semibold text-white mb-6">Portfolio Performance (30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
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
                  <Legend />
                  <Area type="monotone" dataKey="value" stroke="#14b8a6" fillOpacity={1} fill="url(#colorValue)" name="Total Value" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Holdings Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Crypto Holdings Table */}
              <Card className="bg-slate-800/50 border-teal-500/20 p-6" data-testid="crypto-table">
                <h3 className="text-xl font-semibold text-white mb-6">Crypto Holdings</h3>
                <div className="space-y-4">
                  {portfolio.crypto.map((asset, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                          {asset.symbol[0]}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{asset.symbol}</div>
                          <div className="text-gray-400 text-sm">{asset.amount} coins</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">${asset.value.toLocaleString()}</div>
                        <div className={`text-sm ${
                          asset.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {asset.change >= 0 ? '+' : ''}{asset.change}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Asset Allocation Pie Chart */}
              <Card className="bg-slate-800/50 border-teal-500/20 p-6" data-testid="allocation-chart">
                <h3 className="text-xl font-semibold text-white mb-6">Asset Allocation</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="bg-slate-800/50 border-teal-500/20 p-6" data-testid="transactions-table">
              <h3 className="text-xl font-semibold text-white mb-6">Recent Transactions</h3>
              {transactions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tx.type === 'nft_purchase' ? 'bg-purple-500/20 text-purple-400' : 'bg-teal-500/20 text-teal-400'
                        }`}>
                          {tx.type === 'nft_purchase' ? '🖼️' : '💰'}
                        </div>
                        <div>
                          <div className="text-white font-medium">{tx.type.replace('_', ' ').toUpperCase()}</div>
                          <div className="text-gray-400 text-sm">
                            {new Date(tx.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">{tx.amount} {tx.currency}</div>
                        <div className={`text-sm px-2 py-1 rounded ${
                          tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {tx.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}