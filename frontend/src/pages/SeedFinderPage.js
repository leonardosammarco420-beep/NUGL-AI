import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Search, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function SeedFinderPage() {
  const { API } = useContext(AuthContext);
  const [seeds, setSeeds] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeeds();
  }, []);

  const fetchSeeds = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/seeds`);
      setSeeds(response.data);
    } catch (error) {
      toast.error('Failed to load seeds');
    } finally {
      setLoading(false);
    }
  };

  const filteredSeeds = seeds.filter(seed => 
    seed.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8" data-testid="seed-finder-header">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Global Seed Finder
          </h1>
          <p className="text-gray-400">Browse premium cannabis seeds from trusted wholesalers worldwide</p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search seeds..."
              data-testid="seed-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20" data-testid="seeds-loading">
            <div className="text-gray-400">Loading seeds...</div>
          </div>
        ) : filteredSeeds.length === 0 ? (
          <div className="text-center py-20" data-testid="seeds-empty">
            <div className="text-gray-400">No seeds found. Try a different search.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="seeds-grid">
            {filteredSeeds.map((seed) => (
              <Card key={seed.id} data-testid={`seed-card-${seed.id}`} className="bg-slate-800/50 border-teal-500/20 p-6 hover:border-teal-500/50 transition-all">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white mb-2">{seed.name}</h3>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                    {seed.strain_type}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4">{seed.description}</p>
                <div className="mb-4">
                  <p className="text-gray-500 text-xs mb-1">Price Range:</p>
                  <p className="text-teal-400 font-semibold">{seed.price_range}</p>
                </div>
                {seed.affiliate_links && seed.affiliate_links.length > 0 && (
                  <div className="border-t border-slate-700 pt-4">
                    <p className="text-gray-500 text-xs mb-2">Available at:</p>
                    {seed.affiliate_links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between text-teal-400 hover:text-teal-300 text-sm mb-2"
                      >
                        <span>{link.wholesaler}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}