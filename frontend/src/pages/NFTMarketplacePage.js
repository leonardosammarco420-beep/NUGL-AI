import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Wallet, Heart, Eye, ShoppingCart, Sparkles, Filter, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import detectEthereumProvider from '@metamask/detect-provider';

export default function NFTMarketplacePage() {
  const { API } = useContext(AuthContext);
  const [nfts, setNfts] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    fetchNFTs();
    checkWalletConnection();
  }, [category]);

  const checkWalletConnection = async () => {
    const provider = await detectEthereumProvider();
    if (provider && provider.selectedAddress) {
      setWalletConnected(true);
      setWalletAddress(provider.selectedAddress);
    }
  };

  const connectWallet = async () => {
    try {
      const provider = await detectEthereumProvider();
      if (provider) {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
        toast.success('Wallet connected!');
      } else {
        toast.error('Please install MetaMask');
      }
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  const fetchNFTs = async () => {
    setLoading(true);
    try {
      const params = category !== 'all' ? { category } : {};
      const response = await axios.get(`${API}/nfts`, { params });
      setNfts(response.data);
    } catch (error) {
      console.error('Failed to load NFTs', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (nft) => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      toast.success(`Purchase initiated for ${nft.name}!`, {
        description: `${nft.price} ETH will be deducted from your wallet`
      });
      
      await axios.post(`${API}/nfts/${nft.id}/purchase`, {
        buyer: walletAddress,
        price: nft.price
      });

      toast.success('NFT purchased successfully! 🎉');
      fetchNFTs();
    } catch (error) {
      toast.error('Purchase failed. Please try again.');
    }
  };

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'rare': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'uncommon': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2 flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <Sparkles className="w-10 h-10 text-teal-400" />
              NFT Marketplace
            </h1>
            <p className="text-gray-400 text-lg">Collect exclusive cannabis-themed digital art</p>
          </div>
          
          {!walletConnected ? (
            <Button 
              onClick={connectWallet}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
              size="lg"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet to Buy
            </Button>
          ) : (
            <Card className="bg-slate-800/50 border-teal-500/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <div>
                  <p className="text-xs text-gray-400">Connected</p>
                  <p className="text-white font-mono text-sm">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <Tabs value={category} onValueChange={setCategory} className="mb-8">
          <TabsList className="bg-slate-800 grid grid-cols-5">
            <TabsTrigger value="all"><Filter className="w-4 h-4 mr-2" />All</TabsTrigger>
            <TabsTrigger value="art">Art</TabsTrigger>
            <TabsTrigger value="photography">Photography</TabsTrigger>
            <TabsTrigger value="digital">Digital</TabsTrigger>
            <TabsTrigger value="trending"><TrendingUp className="w-4 h-4 mr-2" />Trending</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-slate-800/50 border-teal-500/20 p-4 animate-pulse">
                <div className="w-full h-64 bg-slate-700 rounded-lg mb-4" />
                <div className="h-4 bg-slate-700 rounded mb-2" />
                <div className="h-4 bg-slate-700 rounded w-2/3" />
              </Card>
            ))}
          </div>
        )}

        {!loading && nfts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <Card 
                key={nft.id} 
                className="bg-slate-800/50 border-teal-500/20 overflow-hidden hover:scale-105 transition-all duration-300 hover:border-teal-500/50 group"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={nft.image_url} 
                    alt={nft.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white ${getRarityColor(nft.rarity)}`}>
                    {nft.rarity.toUpperCase()}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                    {nft.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {nft.description}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {nft.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {nft.views}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div>
                      <p className="text-xs text-gray-400">Price</p>
                      <p className="text-xl font-bold text-teal-400">{nft.price} ETH</p>
                    </div>
                    
                    {nft.owner ? (
                      <Badge variant="secondary" className="bg-slate-700 text-gray-300">
                        Owned
                      </Badge>
                    ) : (
                      <Button 
                        onClick={() => handlePurchase(nft)}
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Creator: {nft.creator.slice(0, 6)}...{nft.creator.slice(-4)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && nfts.length === 0 && (
          <Card className="bg-slate-800/50 border-teal-500/20 p-12 text-center">
            <Sparkles className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No NFTs Found</h3>
            <p className="text-gray-400">Try selecting a different category</p>
          </Card>
        )}

        <Card className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-teal-500/30 p-6 mt-12">
          <div className="flex items-start gap-4">
            <Wallet className="w-8 h-8 text-teal-400 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Secure Wallet-Based Purchases</h3>
              <p className="text-gray-300 mb-3">
                All NFT purchases are secured through your crypto wallet. Connect your MetaMask to start collecting 
                exclusive cannabis-themed digital art. Your wallet credentials remain secure - we never store private keys.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2" />
                  <div>
                    <p className="text-white font-semibold text-sm">Secure Transactions</p>
                    <p className="text-gray-400 text-xs">Blockchain-verified purchases</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2" />
                  <div>
                    <p className="text-white font-semibold text-sm">True Ownership</p>
                    <p className="text-gray-400 text-xs">NFTs stored in your wallet</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2" />
                  <div>
                    <p className="text-white font-semibold text-sm">Easy Resale</p>
                    <p className="text-gray-400 text-xs">Trade anytime on marketplace</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
