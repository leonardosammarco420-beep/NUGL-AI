import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Users, FileText, Leaf, Package, TrendingUp, Activity, DollarSign, Eye } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import axios from 'axios';
import { toast } from 'sonner';

export default function AdminPage() {
  const { user, token, API } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    contentActivity: [],
    revenueData: [],
    trafficSources: []
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchStats();
    generateAnalytics();
  }, [user]);

  const fetchStats = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  const generateAnalytics = () => {
    // Generate user growth data
    const userGrowth = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      userGrowth.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        users: Math.floor(100 + (11 - i) * 50 + Math.random() * 100),
        active: Math.floor(80 + (11 - i) * 40 + Math.random() * 80)
      });
    }

    // Generate content activity data
    const contentActivity = [];
    const categories = ['News', 'Strains', 'NFTs', 'Seeds', 'Reviews'];
    categories.forEach(category => {
      contentActivity.push({
        name: category,
        views: Math.floor(Math.random() * 10000) + 5000,
        interactions: Math.floor(Math.random() * 5000) + 2000
      });
    });

    // Generate revenue data
    const revenueData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      revenueData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        affiliates: Math.floor(Math.random() * 500) + 200,
        nfts: Math.floor(Math.random() * 300) + 100,
        ads: Math.floor(Math.random() * 200) + 50
      });
    }

    // Generate traffic sources
    const trafficSources = [
      { name: 'Organic Search', value: 4500 },
      { name: 'Direct', value: 3200 },
      { name: 'Social Media', value: 2800 },
      { name: 'Referral', value: 1500 },
      { name: 'Other', value: 1000 }
    ];

    setAnalyticsData({
      userGrowth,
      contentActivity,
      revenueData,
      trafficSources
    });
  };

  if (!user) return null;

  const statCards = [
    { icon: <Users className="w-8 h-8" />, label: 'Total Users', value: stats?.total_users || 0, change: '+12%', color: 'teal' },
    { icon: <FileText className="w-8 h-8" />, label: 'News Articles', value: stats?.total_articles || 0, change: '+8%', color: 'blue' },
    { icon: <Leaf className="w-8 h-8" />, label: 'Strains', value: stats?.total_strains || 0, change: '+5%', color: 'green' },
    { icon: <Package className="w-8 h-8" />, label: 'NFTs', value: stats?.total_nfts || 0, change: '+15%', color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8" data-testid="admin-header">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Admin Dashboard
          </h1>
          <p className="text-gray-400">Comprehensive platform analytics and management</p>
        </div>

        {loading ? (
          <div className="text-center py-20" data-testid="admin-loading">
            <div className="text-gray-400">Loading analytics...</div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="admin-stats">
              {statCards.map((stat, index) => (
                <Card key={index} className="bg-slate-800/50 border-teal-500/20 p-6" data-testid={`stat-card-${stat.label.toLowerCase().replace(' ', '-')}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`text-${stat.color}-400`}>
                      {stat.icon}
                    </div>
                    <span className="text-green-400 text-sm font-medium">{stat.change}</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="analytics" className="w-full">
              <TabsList className="bg-slate-800 mb-6">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                {/* User Growth Chart */}
                <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">User Growth (12 Months)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData.userGrowth}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#f8fafc' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="users" stroke="#14b8a6" fillOpacity={1} fill="url(#colorUsers)" name="Total Users" />
                      <Area type="monotone" dataKey="active" stroke="#10b981" fillOpacity={1} fill="url(#colorActive)" name="Active Users" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                {/* Content Activity */}
                <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Content Engagement</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.contentActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#f8fafc' }}
                      />
                      <Legend />
                      <Bar dataKey="views" fill="#14b8a6" name="Views" />
                      <Bar dataKey="interactions" fill="#10b981" name="Interactions" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </TabsContent>

              {/* Revenue Tab */}
              <TabsContent value="revenue" className="space-y-6">
                <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Revenue Streams (7 Days)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="day" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#f8fafc' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="affiliates" stroke="#14b8a6" strokeWidth={2} name="Affiliate Sales" />
                      <Line type="monotone" dataKey="nfts" stroke="#8b5cf6" strokeWidth={2} name="NFT Sales" />
                      <Line type="monotone" dataKey="ads" stroke="#f59e0b" strokeWidth={2} name="Ad Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {/* Revenue Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/30 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <DollarSign className="w-8 h-8 text-teal-400" />
                      <h4 className="text-white font-semibold">Total Revenue</h4>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">$12,450</p>
                    <p className="text-green-400 text-sm">+18% from last week</p>
                  </Card>

                  <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Activity className="w-8 h-8 text-purple-400" />
                      <h4 className="text-white font-semibold">Affiliate Clicks</h4>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">8,245</p>
                    <p className="text-green-400 text-sm">+22% from last week</p>
                  </Card>

                  <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="w-8 h-8 text-orange-400" />
                      <h4 className="text-white font-semibold">Conversion Rate</h4>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">4.2%</p>
                    <p className="text-green-400 text-sm">+0.8% from last week</p>
                  </Card>
                </div>
              </TabsContent>

              {/* Content Management Tab */}
              <TabsContent value="content" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Content Management</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium">News Articles</p>
                          <Button size="sm" variant="outline">Manage</Button>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">Auto-updating from {analyticsData.contentActivity.length} RSS feeds</p>
                      </div>
                      <div className="p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium">Strain Database</p>
                          <Button size="sm" variant="outline">Manage</Button>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">Add and update strain information</p>
                      </div>
                      <div className="p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium">Seed Catalogue</p>
                          <Button size="sm" variant="outline">Manage</Button>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">Manage varieties and affiliate links</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Moderation Queue</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium">Pending Reviews</p>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">0</span>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium">Flagged Comments</p>
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">0</span>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium">NFT Listings</p>
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">0</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">User Activity Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Daily Active</p>
                      <p className="text-2xl font-bold text-white">1,234</p>
                    </div>
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Weekly Active</p>
                      <p className="text-2xl font-bold text-white">5,678</p>
                    </div>
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Monthly Active</p>
                      <p className="text-2xl font-bold text-white">12,345</p>
                    </div>
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Retention Rate</p>
                      <p className="text-2xl font-bold text-white">68%</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}