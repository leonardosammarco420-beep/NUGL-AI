import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Copy, Users, DollarSign, TrendingUp, Gift, Share2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function EarningsPage() {
  const { user, token, API } = useContext(AuthContext);
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState(null);
  const [affiliateStats, setAffiliateStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchReferralData();
    fetchAffiliateStats();
  }, [user]);

  const fetchReferralData = async () => {
    if (!token) return;
    try {
      const codeResponse = await axios.get(`${API}/referrals/my-code`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReferralCode(codeResponse.data.referral_code);

      const statsResponse = await axios.get(`${API}/referrals/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReferralStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to fetch referral data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAffiliateStats = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API}/affiliate/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAffiliateStats(response.data);
    } catch (error) {
      console.error('Failed to fetch affiliate stats');
    }
  };

  const copyReferralLink = () => {
    const link = `https://nugl.com/register?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const text = `Join me on NUGL - The Digital Greenhouse! Use my referral code ${referralCode} to get started.`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=https://nugl.com/register?ref=${referralCode}`;
    window.open(url, '_blank');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8" data-testid="earnings-header">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Earnings Dashboard
          </h1>
          <p className="text-gray-400">Track your referrals and affiliate commissions</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-gray-400">Loading earnings data...</div>
          </div>
        ) : (
          <>
            {/* Earnings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/30 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-8 h-8 text-teal-400" />
                  <h3 className="text-white font-semibold">Total Earned</h3>
                </div>
                <p className="text-3xl font-bold text-white mb-2">
                  ${((referralStats?.total_earned || 0) + (affiliateStats?.total_commission || 0)).toFixed(2)}
                </p>
                <p className="text-green-400 text-sm">All time</p>
              </Card>

              <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-8 h-8 text-purple-400" />
                  <h3 className="text-white font-semibold">Referrals</h3>
                </div>
                <p className="text-3xl font-bold text-white mb-2">{referralStats?.total_referrals || 0}</p>
                <p className="text-gray-400 text-sm">{referralStats?.completed_referrals || 0} completed</p>
              </Card>

              <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-8 h-8 text-orange-400" />
                  <h3 className="text-white font-semibold">Conversions</h3>
                </div>
                <p className="text-3xl font-bold text-white mb-2">{affiliateStats?.total_conversions || 0}</p>
                <p className="text-gray-400 text-sm">{affiliateStats?.conversion_rate?.toFixed(1) || 0}% rate</p>
              </Card>

              <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Gift className="w-8 h-8 text-green-400" />
                  <h3 className="text-white font-semibold">Pending</h3>
                </div>
                <p className="text-3xl font-bold text-white mb-2">
                  ${(referralStats?.pending_rewards || 0).toFixed(2)}
                </p>
                <p className="text-gray-400 text-sm">Pending rewards</p>
              </Card>
            </div>

            <Tabs defaultValue="referrals" className="w-full">
              <TabsList className="bg-slate-800 mb-6">
                <TabsTrigger value="referrals">Referral Program</TabsTrigger>
                <TabsTrigger value="affiliates">Affiliate Earnings</TabsTrigger>
              </TabsList>

              {/* Referral Tab */}
              <TabsContent value="referrals" className="space-y-6">
                {/* Referral Code Card */}
                <Card className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/30 p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Your Referral Code</h3>
                      <p className="text-gray-400">Share your code and earn $10 for each friend who signs up!</p>
                    </div>
                    <Share2 className="w-8 h-8 text-teal-400" />
                  </div>

                  <div className="flex gap-4 mb-6">
                    <Input
                      value={referralCode}
                      readOnly
                      className="bg-slate-800 border-slate-700 text-white text-xl font-bold"
                      data-testid="referral-code-input"
                    />
                    <Button
                      onClick={copyReferralLink}
                      className="bg-teal-500 hover:bg-teal-600 text-white"
                      data-testid="copy-referral-button"
                    >
                      {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={shareOnTwitter}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                      data-testid="share-twitter"
                    >
                      Share on Twitter
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                    >
                      Copy Link
                    </Button>
                  </div>
                </Card>

                {/* How It Works */}
                <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">How It Works</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-3">
                        <span className="text-teal-400 font-bold text-xl">1</span>
                      </div>
                      <h4 className="text-white font-semibold mb-2">Share Your Code</h4>
                      <p className="text-gray-400 text-sm">Invite friends using your unique referral code</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-3">
                        <span className="text-teal-400 font-bold text-xl">2</span>
                      </div>
                      <h4 className="text-white font-semibold mb-2">They Sign Up</h4>
                      <p className="text-gray-400 text-sm">Your friend creates an account and makes their first purchase</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-3">
                        <span className="text-teal-400 font-bold text-xl">3</span>
                      </div>
                      <h4 className="text-white font-semibold mb-2">You Get Paid</h4>
                      <p className="text-gray-400 text-sm">Receive $10 credit instantly to your account</p>
                    </div>
                  </div>
                </Card>

                {/* Recent Referrals */}
                <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Recent Referrals</h3>
                  {referralStats?.referrals?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No referrals yet. Start sharing your code!</p>
                  ) : (
                    <div className="space-y-3">
                      {referralStats?.referrals?.slice(0, 5).map((referral) => (
                        <div key={referral.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                          <div>
                            <p className="text-white font-medium">Referral</p>
                            <p className="text-gray-400 text-sm">
                              {new Date(referral.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              referral.status === 'completed' ? 'text-green-400' :
                              referral.status === 'pending' ? 'text-yellow-400' :
                              'text-gray-400'
                            }`}>
                              {referral.status.toUpperCase()}
                            </p>
                            <p className="text-gray-400 text-sm">${referral.reward_amount}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* Affiliate Tab */}
              <TabsContent value="affiliates" className="space-y-6">
                <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Affiliate Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Total Clicks</p>
                      <p className="text-3xl font-bold text-white">{affiliateStats?.total_clicks || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-white">${(affiliateStats?.total_revenue || 0).toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Commission Earned</p>
                      <p className="text-3xl font-bold text-teal-400">${(affiliateStats?.total_commission || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Top Performing Links</h3>
                  {affiliateStats?.top_performers?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No affiliate data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {affiliateStats?.top_performers?.map((performer, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{performer.name}</p>
                            <p className="text-gray-400 text-sm">{performer.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-teal-400 font-semibold">${performer.total_commission?.toFixed(2)}</p>
                            <p className="text-gray-400 text-sm">{performer.total_clicks} clicks</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}