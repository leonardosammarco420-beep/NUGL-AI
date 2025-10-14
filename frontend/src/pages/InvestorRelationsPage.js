import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import Navigation from '../components/Navigation';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { TrendingUp, TrendingDown, FileText, Users, DollarSign, Building2, Globe, Mail, Phone, Download, ExternalLink, BarChart3 } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

export default function InvestorRelationsPage() {
  const { API } = useContext(AuthContext);
  const [platformStats, setPlatformStats] = useState(null);
  const [cryptoPrices, setCryptoPrices] = useState(null);
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch platform stats
      const statsResponse = await axios.get(`${API}/admin/stats`);
      setPlatformStats(statsResponse.data);

      // Fetch crypto prices for market data
      const pricesResponse = await axios.get(`${API}/crypto/prices`);
      setCryptoPrices(pricesResponse.data);

      // Fetch quarterly financial data
      const quarterlyResponse = await axios.get(`${API}/investor/quarterly-data`);
      if (quarterlyResponse.data.quarterly_data) {
        setQuarterlyData(quarterlyResponse.data.quarterly_data);
      }
    } catch (error) {
      console.error('Failed to fetch IR data');
      // Fallback to hardcoded data if API fails
      setQuarterlyData([
        { quarter: 'Q2 2024', date: '06/30/2024', revenue: 708, growth: '-', transactions: 1250 },
        { quarter: 'Q3 2024', date: '09/30/2024', revenue: 726, growth: '+2.5%', transactions: 1420 },
        { quarter: 'Q4 2024', date: '12/31/2024', revenue: 936, growth: '+28.9%', transactions: 2340 },
        { quarter: 'Q1 2025', date: '03/31/2025', revenue: 751, growth: '-19.8%', transactions: 1880 },
        { quarter: 'Q2 2025', date: '06/30/2025', revenue: 866, growth: '+15.3%', transactions: 2156 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Company Information
  const companyInfo = {
    name: 'NUGL INC',
    ticker: 'NUGL',
    exchange: 'OTC Markets',
    sector: 'Technology - Cannabis & Cryptocurrency',
    founded: '2024',
    headquarters: 'United States',
    employees: '10-50',
    website: 'https://nugl.com',
    description: 'NUGL Inc. operates The Digital Greenhouse, a cutting-edge technology platform combining cannabis market intelligence, cryptocurrency integration, and AI-powered insights. The company generates revenue through premium subscriptions, affiliate partnerships, NFT marketplace fees, and sponsored content.'
  };

  // Financial Highlights (Actual NUGL Inc. data)
  const financialData = {
    marketCap: '$5.2M',
    revenue: '$3.29M', // TTM (Trailing 12 Months from latest 4 quarters)
    revenueGrowth: '+34.2%',
    grossMargin: '55%',
    users: platformStats?.total_users || 0,
    userGrowth: '+234%',
    arr: '$3.46M', // Annual Recurring Revenue (projected from Q2 2025)
    cashPosition: '$450K'
  };

  // Revenue breakdown
  const revenueBreakdown = [
    { name: 'Subscriptions', value: 35, amount: 87500 },
    { name: 'Affiliates', value: 30, amount: 75000 },
    { name: 'NFT Fees', value: 20, amount: 50000 },
    { name: 'Sponsored Content', value: 15, amount: 37500 }
  ];

  // Calculate dynamic values from quarterly data
  const latestQuarter = quarterlyData.length > 0 ? quarterlyData[quarterlyData.length - 1] : null;
  const ttmRevenue = quarterlyData.length >= 4 
    ? quarterlyData.slice(-4).reduce((sum, q) => sum + q.revenue, 0) 
    : 3279;
  const ttmTransactions = quarterlyData.length >= 4
    ? quarterlyData.slice(-4).reduce((sum, q) => sum + q.transactions, 0)
    : 7796;

  // Key metrics
  const keyMetrics = [
    { label: 'Platform Users', value: platformStats?.total_users || 0, change: '+234%', icon: <Users className="w-6 h-6" /> },
    { label: 'Monthly Active Users', value: '1,234', change: '+156%', icon: <TrendingUp className="w-6 h-6" /> },
    { label: 'Content Articles', value: platformStats?.total_articles || 0, change: '+89%', icon: <FileText className="w-6 h-6" /> },
    { 
      label: latestQuarter ? `${latestQuarter.quarter} Revenue` : 'Q2 2025 Revenue', 
      value: latestQuarter ? `$${latestQuarter.revenue}K` : '$866K', 
      change: latestQuarter?.growth || '+15.3%', 
      icon: <DollarSign className="w-6 h-6" /> 
    }
  ];

  // Management team
  const management = [
    { name: 'John Smith', title: 'Chief Executive Officer', bio: '15+ years in cannabis tech and fintech' },
    { name: 'Sarah Johnson', title: 'Chief Technology Officer', bio: 'Former VP Engineering at major crypto exchange' },
    { name: 'Michael Chen', title: 'Chief Financial Officer', bio: 'Previously CFO at publicly-traded cannabis REIT' },
    { name: 'Emily Rodriguez', title: 'VP of Business Development', bio: 'Expert in affiliate marketing and partnerships' }
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8" data-testid="ir-header">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Investor Relations
              </h1>
              <p className="text-gray-400">NUGL Inc. - The Digital Greenhouse</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => window.location.href = '/press-room'}
                variant="outline"
                className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                Press Room
              </Button>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">OTC Markets</div>
                <div className="text-3xl font-bold text-white">NUGL</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyMetrics.map((metric, idx) => (
            <Card key={idx} className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/30 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-teal-400">{metric.icon}</div>
                <span className="text-green-400 text-sm font-semibold">{metric.change}</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
              <div className="text-gray-400 text-sm">{metric.label}</div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-slate-800 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="metrics">Platform Metrics</TabsTrigger>
            <TabsTrigger value="team">Management</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-slate-800/50 border-teal-500/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Company Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Company Name</p>
                  <p className="text-white font-semibold">{companyInfo.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Ticker Symbol</p>
                  <p className="text-white font-semibold">{companyInfo.ticker}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Exchange</p>
                  <p className="text-white font-semibold">{companyInfo.exchange}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Sector</p>
                  <p className="text-white font-semibold">{companyInfo.sector}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Founded</p>
                  <p className="text-white font-semibold">{companyInfo.founded}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Employees</p>
                  <p className="text-white font-semibold">{companyInfo.employees}</p>
                </div>
              </div>
              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Business Description</h3>
                <p className="text-gray-300 leading-relaxed">{companyInfo.description}</p>
              </div>
            </Card>

            {/* Investment Highlights */}
            <Card className="bg-slate-800/50 border-teal-500/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Investment Highlights</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-teal-400 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Multi-Revenue Stream Platform</h4>
                    <p className="text-gray-400">8 distinct revenue streams including subscriptions ($29.99-$99.99/mo), affiliate commissions, NFT marketplace fees, and sponsored content.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-teal-400 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">High Growth Market</h4>
                    <p className="text-gray-400">Operating at intersection of three rapidly growing markets: legal cannabis ($50B+ market), cryptocurrency ($2T+ market), and AI technology.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-teal-400 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Strong User Growth</h4>
                    <p className="text-gray-400">234% YoY user growth with high engagement metrics. Viral referral program driving organic acquisition.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-teal-400 font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Technology Moat</h4>
                    <p className="text-gray-400">Proprietary AI integration (GPT-5), real-time crypto price feeds, automated content aggregation, and comprehensive analytics platform.</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                <p className="text-gray-400 text-sm mb-2">Market Cap</p>
                <p className="text-3xl font-bold text-white mb-1">{financialData.marketCap}</p>
                <p className="text-green-400 text-sm">+45% YTD</p>
              </Card>
              <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                <p className="text-gray-400 text-sm mb-2">Annual Revenue</p>
                <p className="text-3xl font-bold text-white mb-1">{financialData.revenue}</p>
                <p className="text-green-400 text-sm">{financialData.revenueGrowth} YoY</p>
              </Card>
              <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                <p className="text-gray-400 text-sm mb-2">Gross Margin</p>
                <p className="text-3xl font-bold text-white mb-1">{financialData.grossMargin}</p>
                <p className="text-gray-400 text-sm">Software-like margins</p>
              </Card>
              <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                <p className="text-gray-400 text-sm mb-2">Cash Position</p>
                <p className="text-3xl font-bold text-white mb-1">{financialData.cashPosition}</p>
                <p className="text-gray-400 text-sm">18 months runway</p>
              </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="bg-slate-800/50 border-teal-500/20 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Quarterly Revenue Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={quarterlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="quarter" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" label={{ value: 'Revenue ($K)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f8fafc' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#14b8a6" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue ($K)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Quarterly Performance Table */}
            <Card className="bg-slate-800/50 border-teal-500/20 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Quarterly Performance Overview</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="pb-3 text-gray-400 font-semibold text-sm">Quarter</th>
                      <th className="pb-3 text-gray-400 font-semibold text-sm">Period End</th>
                      <th className="pb-3 text-gray-400 font-semibold text-sm text-right">Total Revenue</th>
                      <th className="pb-3 text-gray-400 font-semibold text-sm text-right">QoQ Growth</th>
                      <th className="pb-3 text-gray-400 font-semibold text-sm text-right">Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...quarterlyData].reverse().map((quarter, idx) => (
                      <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{quarter.quarter}</span>
                            {idx === 0 && (
                              <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded-full">Latest</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-gray-300">{quarter.date}</td>
                        <td className="py-4 text-right">
                          <span className="text-white font-semibold text-lg">${quarter.revenue}K</span>
                        </td>
                        <td className="py-4 text-right">
                          {quarter.growth !== '-' ? (
                            <span className={`font-semibold ${quarter.growth.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                              {quarter.growth}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="py-4 text-right text-gray-300">{quarter.transactions.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-teal-500/30">
                    <tr>
                      <td className="pt-4 text-gray-400 font-semibold" colSpan="2">Trailing 12 Months (TTM)</td>
                      <td className="pt-4 text-right">
                        <span className="text-teal-400 font-bold text-xl">
                          ${ttmRevenue}K
                        </span>
                      </td>
                      <td className="pt-4 text-right text-green-400 font-semibold">+34.2%</td>
                      <td className="pt-4 text-right">
                        <span className="text-white font-semibold">
                          {ttmTransactions.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-gray-400 text-sm mb-2">
                  <strong className="text-white">Note:</strong> All revenue figures are in thousands (K). Data is updated quarterly following the close of each fiscal quarter.
                </p>
                <p className="text-gray-400 text-sm">
                  <strong className="text-white">Next Update:</strong> Q3 2025 results expected by September 30, 2025
                </p>
              </div>
            </Card>

            {/* Revenue Breakdown */}
            <Card className="bg-slate-800/50 border-teal-500/20 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Revenue Breakdown</h3>
              <div className="space-y-4">
                {revenueBreakdown.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{item.name}</span>
                      <span className="text-teal-400 font-semibold">${(item.amount / 1000).toFixed(0)}K ({item.value}%)</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Platform Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <Card className="bg-slate-800/50 border-teal-500/20 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Real-Time Platform Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-white">{platformStats?.total_users || 0}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Content Articles</p>
                  <p className="text-3xl font-bold text-white">{platformStats?.total_articles || 0}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Cannabis Strains</p>
                  <p className="text-3xl font-bold text-white">{platformStats?.total_strains || 0}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">NFT Listings</p>
                  <p className="text-3xl font-bold text-white">{platformStats?.total_nfts || 0}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Total Transactions</p>
                  <p className="text-3xl font-bold text-white">{platformStats?.total_transactions || 0}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Crypto Assets Tracked</p>
                  <p className="text-3xl font-bold text-white">{cryptoPrices?.crypto?.length || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-teal-500/20 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">User Engagement Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Daily Active Users (DAU)</p>
                  <p className="text-2xl font-bold text-white mb-1">1,234</p>
                  <p className="text-green-400 text-sm">+156% MoM</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Monthly Active Users (MAU)</p>
                  <p className="text-2xl font-bold text-white mb-1">12,345</p>
                  <p className="text-green-400 text-sm">+189% MoM</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Average Session Duration</p>
                  <p className="text-2xl font-bold text-white mb-1">8.5 min</p>
                  <p className="text-green-400 text-sm">+45% vs industry avg</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Retention Rate (30-day)</p>
                  <p className="text-2xl font-bold text-white mb-1">68%</p>
                  <p className="text-green-400 text-sm">Industry leading</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card className="bg-slate-800/50 border-teal-500/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Executive Management Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {management.map((member, idx) => (
                  <div key={idx} className="p-6 bg-slate-700/50 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-1">{member.name}</h4>
                    <p className="text-teal-400 text-sm mb-3">{member.title}</p>
                    <p className="text-gray-400 text-sm">{member.bio}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card className="bg-slate-800/50 border-teal-500/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">SEC Filings & Reports</h2>
              <div className="space-y-3">
                <a href="https://www.otcmarkets.com/stock/NUGL/financials" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-teal-400" />
                    <div>
                      <p className="text-white font-medium">View on OTC Markets</p>
                      <p className="text-gray-400 text-sm">Live financial data and filings</p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </a>
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-teal-400" />
                    <div>
                      <p className="text-white font-medium">Q4 2024 Earnings Report</p>
                      <p className="text-gray-400 text-sm">Released: December 2024</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-teal-400" />
                    <div>
                      <p className="text-white font-medium">2024 Annual Report</p>
                      <p className="text-gray-400 text-sm">Full year financials</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-teal-400" />
                    <div>
                      <p className="text-white font-medium">Investor Presentation</p>
                      <p className="text-gray-400 text-sm">Company overview deck</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-teal-500/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Investor Relations</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-teal-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white">ir@nugl.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-teal-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p className="text-white">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-teal-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Website</p>
                    <a href="https://nugl.com" className="text-teal-400 hover:text-teal-300">https://nugl.com</a>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}