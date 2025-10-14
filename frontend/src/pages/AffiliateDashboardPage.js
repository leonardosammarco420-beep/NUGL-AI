import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import Navigation from '../components/Navigation';
import { Card } from '../components/ui/card';
import { DollarSign, TrendingUp, MousePointerClick, Target, ExternalLink } from 'lucide-react';
import axios from 'axios';

export default function AffiliateDashboardPage() {
  const { API } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API}/affiliate/dashboard`);
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <Navigation />
        <div className="flex justify-center items-center h-screen">
          <div className="text-teal-400 text-xl">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const { summary, partners, recent_activity } = dashboard;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            💰 Affiliate Dashboard
          </h1>
          <p className="text-gray-400">Track your earnings, clicks, and conversions in real-time</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-teal-500/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-400" />
              <div className="text-right">
                <p className="text-2xl font-bold text-white">${summary.total_revenue}</p>
                <p className="text-xs text-gray-400">Total Revenue</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-teal-500/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <MousePointerClick className="w-8 h-8 text-blue-400" />
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{summary.total_clicks}</p>
                <p className="text-xs text-gray-400">Total Clicks</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-teal-500/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-purple-400" />
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{summary.total_conversions}</p>
                <p className="text-xs text-gray-400">Conversions</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-teal-500/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-teal-400" />
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{summary.conversion_rate}%</p>
                <p className="text-xs text-gray-400">Conversion Rate</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Partner Performance */}
        <Card className="bg-slate-800/50 border-teal-500/20 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Partner Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 text-gray-400 font-semibold">Partner</th>
                  <th className="text-right py-3 text-gray-400 font-semibold">Clicks</th>
                  <th className="text-right py-3 text-gray-400 font-semibold">Conversions</th>
                  <th className="text-right py-3 text-gray-400 font-semibold">Conv. Rate</th>
                  <th className="text-right py-3 text-gray-400 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          idx === 0 ? 'bg-yellow-400' :
                          idx === 1 ? 'bg-gray-400' :
                          idx === 2 ? 'bg-orange-400' : 'bg-teal-400'
                        }`} />
                        <span className="text-white font-medium">{partner.partner_name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right text-gray-300">{partner.clicks}</td>
                    <td className="py-4 text-right text-gray-300">{partner.conversions}</td>
                    <td className="py-4 text-right">
                      <span className="text-teal-400 font-semibold">
                        {((partner.conversions / partner.clicks) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-green-400 font-bold">${partner.revenue.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-800/50 border-teal-500/20 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-3">
            {recent_activity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-teal-400" />
                  <div>
                    <p className="text-white text-sm font-medium">{activity.partner_name}</p>
                    <p className="text-gray-400 text-xs">
                      {activity.source_page} • {new Date(activity.clicked_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {activity.converted && (
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-sm">${activity.revenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Converted</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Info Box */}
        <Card className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-teal-500/30 p-6 mt-8">
          <h3 className="text-xl font-bold text-white mb-3">💡 How to Maximize Earnings</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full mt-2" />
              <span><strong>News Sources:</strong> Every click to Marijuana Moment, CoinTelegraph earns commission</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full mt-2" />
              <span><strong>Strain/Seed Links:</strong> Leafly, Seedsman, ILGM pay 8-12% commission on sales</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full mt-2" />
              <span><strong>Auto-Tracked:</strong> All outbound clicks are automatically monitored</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full mt-2" />
              <span><strong>Avg Commission:</strong> ${summary.avg_commission} per conversion</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
