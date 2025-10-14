import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import ReviewSection from '../components/ReviewSection';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Search, Filter, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function StrainFinderPage() {
  const { API } = useContext(AuthContext);
  const [strains, setStrains] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStrains();
  }, []);

  const fetchStrains = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/strains`);
      setStrains(response.data);
    } catch (error) {
      toast.error('Failed to load strains');
    } finally {
      setLoading(false);
    }
  };

  const filteredStrains = strains.filter(strain => {
    const matchesSearch = strain.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || strain.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8" data-testid="strain-finder-header">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Global Strain Finder
          </h1>
          <p className="text-gray-400">Discover thousands of cannabis strains with affiliate links to dispensaries worldwide</p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search strains..."
              data-testid="strain-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setTypeFilter('all')}
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              data-testid="filter-all"
            >
              All
            </Button>
            <Button
              onClick={() => setTypeFilter('indica')}
              variant={typeFilter === 'indica' ? 'default' : 'outline'}
              data-testid="filter-indica"
            >
              Indica
            </Button>
            <Button
              onClick={() => setTypeFilter('sativa')}
              variant={typeFilter === 'sativa' ? 'default' : 'outline'}
              data-testid="filter-sativa"
            >
              Sativa
            </Button>
            <Button
              onClick={() => setTypeFilter('hybrid')}
              variant={typeFilter === 'hybrid' ? 'default' : 'outline'}
              data-testid="filter-hybrid"
            >
              Hybrid
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20" data-testid="strains-loading">
            <div className="text-gray-400">Loading strains...</div>
          </div>
        ) : filteredStrains.length === 0 ? (
          <div className="text-center py-20" data-testid="strains-empty">
            <div className="text-gray-400">No strains found. Try a different search.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="strains-grid">
            {filteredStrains.map((strain) => (
              <Card key={strain.id} data-testid={`strain-card-${strain.id}`} className="bg-slate-800/50 border-teal-500/20 p-6 hover:border-teal-500/50 transition-all">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white mb-2">{strain.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    strain.type === 'indica' ? 'bg-purple-500/20 text-purple-400' :
                    strain.type === 'sativa' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {strain.type}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4">{strain.description}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">THC:</span>
                    <span className="text-teal-400 font-medium">{strain.thc_content || 'N/A'}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">CBD:</span>
                    <span className="text-teal-400 font-medium">{strain.cbd_content || 'N/A'}%</span>
                  </div>
                </div>
                {strain.effects && strain.effects.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-500 text-xs mb-2">Effects:</p>
                    <div className="flex flex-wrap gap-2">
                      {strain.effects.slice(0, 3).map((effect, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-700 rounded text-xs text-gray-300">
                          {effect}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Add Review Section */}
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <ReviewSection itemId={strain.id} itemType="strain" />
                </div>
                
                {strain.affiliate_links && strain.affiliate_links.length > 0 && (
                  <div className="border-t border-slate-700 pt-4 mt-4">
                    <p className="text-gray-500 text-xs mb-2">Available at:</p>
                    {strain.affiliate_links.slice(0, 2).map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between text-teal-400 hover:text-teal-300 text-sm mb-2"
                      >
                        <span>{link.dispensary} - {link.location}</span>
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