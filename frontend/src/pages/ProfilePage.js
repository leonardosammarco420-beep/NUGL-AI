import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { User, Bookmark, Wallet, Package } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, token, API } = useContext(AuthContext);
  const navigate = useNavigate();
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchSavedArticles();
  }, [user]);

  const fetchSavedArticles = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API}/users/saved-articles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedArticles(response.data.saved_articles || []);
    } catch (error) {
      console.error('Failed to fetch saved articles');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8" data-testid="profile-header">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            My Profile
          </h1>
          <p className="text-gray-400">Manage your account and view your activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-teal-500/20 p-6" data-testid="profile-info-card">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white" data-testid="profile-username">{user.username}</h2>
                {user.email && <p className="text-gray-400 text-sm">{user.email}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">User ID</p>
                <p className="text-white font-mono text-sm truncate">{user.id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Auth Method</p>
                <p className="text-teal-400 capitalize">{user.auth_method || 'jwt'}</p>
              </div>
              {user.wallet_address && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Wallet Address</p>
                  <p className="text-white font-mono text-xs truncate">{user.wallet_address}</p>
                </div>
              )}
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-teal-500/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bookmark className="w-5 h-5 text-teal-400" />
                <h3 className="text-xl font-semibold text-white">Saved Articles</h3>
              </div>
              {loading ? (
                <p className="text-gray-400">Loading...</p>
              ) : savedArticles.length === 0 ? (
                <p className="text-gray-400" data-testid="no-saved-articles">No saved articles yet</p>
              ) : (
                <div className="space-y-3" data-testid="saved-articles-list">
                  {savedArticles.map((article) => (
                    <div key={article.id} className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                      <h4 className="text-white font-medium mb-1">{article.title}</h4>
                      <p className="text-gray-400 text-sm line-clamp-2">{article.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="w-5 h-5 text-teal-400" />
                  <h3 className="text-lg font-semibold text-white">My Wallet</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">View and manage your crypto wallet</p>
                <Button onClick={() => navigate('/wallet')} className="w-full" data-testid="go-to-wallet-button">
                  Open Wallet
                </Button>
              </Card>

              <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-teal-400" />
                  <h3 className="text-lg font-semibold text-white">NFT Portfolio</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">Browse your NFT collection</p>
                <Button onClick={() => navigate('/nft-marketplace')} variant="outline" className="w-full" data-testid="go-to-nfts-button">
                  View NFTs
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}