import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { ExternalLink, Tag } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function NFTMarketplacePage() {
  const { API } = useContext(AuthContext);
  const [nfts, setNfts] = useState([]);
  const [blockchain, setBlockchain] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNFTs();
  }, [blockchain]);

  const fetchNFTs = async () => {
    setLoading(true);
    try {
      const params = blockchain !== 'all' ? { blockchain } : {};
      const response = await axios.get(`${API}/nfts`, { params });
      setNfts(response.data);
    } catch (error) {
      toast.error('Failed to load NFTs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8" data-testid="nft-marketplace-header">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            NFT Marketplace
          </h1>
          <p className="text-gray-400">Browse, buy, and sell cannabis-themed NFTs on Ethereum and Solana</p>
        </div>

        <Tabs value={blockchain} onValueChange={setBlockchain} className="mb-8">
          <TabsList className="bg-slate-800" data-testid="blockchain-filter">
            <TabsTrigger value="all" data-testid="filter-all-nft">All</TabsTrigger>
            <TabsTrigger value="ethereum" data-testid="filter-ethereum">Ethereum</TabsTrigger>
            <TabsTrigger value="solana" data-testid="filter-solana">Solana</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-20" data-testid="nfts-loading">
            <div className="text-gray-400">Loading NFTs...</div>
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-20" data-testid="nfts-empty">
            <div className="text-gray-400">No NFTs available. Check back soon!</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="nfts-grid">
            {nfts.map((nft) => (
              <Card key={nft.id} data-testid={`nft-card-${nft.id}`} className="bg-slate-800/50 border-teal-500/20 overflow-hidden hover:border-teal-500/50 transition-all group">
                <div className="aspect-square bg-slate-700 overflow-hidden">
                  <img
                    src={nft.image_url}
                    alt={nft.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{nft.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      nft.blockchain === 'ethereum' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {nft.blockchain.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{nft.description}</p>
                  {nft.is_for_sale && nft.price && (
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-gray-500 text-xs">Price</p>
                        <p className="text-teal-400 font-semibold">{nft.price} {nft.currency}</p>
                      </div>
                      <Tag className="w-5 h-5 text-teal-400" />
                    </div>
                  )}
                  <Button size="sm" className="w-full" data-testid={`buy-nft-${nft.id}`}>
                    {nft.is_for_sale ? 'Buy Now' : 'View Details'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}