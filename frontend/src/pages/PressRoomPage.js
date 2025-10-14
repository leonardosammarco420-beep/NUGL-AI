import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Newspaper, ExternalLink, Upload, Search, Calendar } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function PressRoomPage() {
  const { API } = useContext(AuthContext);
  const [pressReleases, setPressReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newRelease, setNewRelease] = useState({ title: '', media_source: '', link: '' });

  useEffect(() => {
    fetchPressReleases();
  }, []);

  const fetchPressReleases = async () => {
    try {
      const response = await axios.get(`${API}/press-releases`);
      setPressReleases(response.data);
    } catch (error) {
      console.error('Failed to fetch press releases', error);
      toast.error('Failed to load press releases');
    } finally {
      setLoading(false);
    }
  };

  // Extract date from URL or use title
  const extractDateFromArticle = (release) => {
    // Try format: /2021/11/26/ (full year)
    let urlDateMatch = release.link.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
    if (urlDateMatch) {
      return new Date(urlDateMatch[1], urlDateMatch[2] - 1, urlDateMatch[3]);
    }
    
    // Try format: /20211126/ (Gleaner format)
    urlDateMatch = release.link.match(/\/(\d{4})(\d{2})(\d{2})\//);
    if (urlDateMatch) {
      return new Date(urlDateMatch[1], urlDateMatch[2] - 1, urlDateMatch[3]);
    }
    
    // Try format: /24/11/ (Benzinga 2-digit year: YY/MM/)
    urlDateMatch = release.link.match(/\/(\d{2})\/(\d{2})\/\d+/);
    if (urlDateMatch) {
      const year = parseInt(urlDateMatch[1]);
      const month = parseInt(urlDateMatch[2]);
      // Convert 2-digit year: 18-99 = 2018-2099, 00-17 = 2000-2017
      const fullYear = year >= 18 ? 2000 + year : 2000 + year;
      return new Date(fullYear, month - 1, 1);
    }
    
    // Extract year from title as fallback
    const titleDateMatch = release.title.match(/\b(20\d{2})\b/);
    if (titleDateMatch) {
      return new Date(titleDateMatch[1], 0, 1);
    }
    
    // Default to 2018 for old articles without dates
    return new Date(2018, 0, 1);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Date N/A';
    }
  };

  // Logo/favicon mapping for publications
  const getPublicationLogo = (mediaSource) => {
    const logos = {
      'Forbes': 'https://logo.clearbit.com/forbes.com',
      'Rolling Stone': 'https://logo.clearbit.com/rollingstone.com',
      'New York Times': 'https://logo.clearbit.com/nytimes.com',
      'Gleaner': 'https://logo.clearbit.com/jamaica-gleaner.com',
      'Jamaica Gleaner': 'https://logo.clearbit.com/jamaica-gleaner.com',
      'Jamaica Observer': 'https://logo.clearbit.com/jamaicaobserver.com',
      'Observer': 'https://logo.clearbit.com/jamaicaobserver.com',
      'Benzinga': 'https://logo.clearbit.com/benzinga.com',
      'Leafly': 'https://logo.clearbit.com/leafly.com',
      'Loop Jamaica': 'https://logo.clearbit.com/loopjamaica.com',
      'Vice': 'https://logo.clearbit.com/vice.com',
      'ECONOMIST': 'https://logo.clearbit.com/economist.com',
      'Financial Post': 'https://logo.clearbit.com/financialpost.com',
      'GlobeNewswire': 'https://logo.clearbit.com/globenewswire.com',
      'The Guardian': 'https://logo.clearbit.com/theguardian.com',
      'CNBC': 'https://logo.clearbit.com/cnbc.com',
      'Buzz Caribbean': 'https://logo.clearbit.com/buzz-caribbean.com'
    };
    
    return logos[mediaSource] || 'https://via.placeholder.com/32x32?text=' + (mediaSource ? mediaSource.charAt(0) : 'N');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newRelease.title || !newRelease.link) {
      toast.error('Please fill in title and link');
      return;
    }

    try {
      await axios.post(`${API}/press-releases`, newRelease);
      toast.success('Press release added successfully!');
      setNewRelease({ title: '', media_source: '', link: '' });
      setShowUploadForm(false);
      fetchPressReleases();
    } catch (error) {
      console.error('Failed to upload press release', error);
      toast.error('Failed to add press release');
    }
  };

  const filteredReleases = pressReleases
    .filter(release =>
      release.title.toLowerCase().includes(search.toLowerCase()) ||
      release.media_source.toLowerCase().includes(search.toLowerCase())
    )
    .map(release => ({
      ...release,
      extractedDate: extractDateFromArticle(release)
    }))
    .sort((a, b) => b.extractedDate - a.extractedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Newspaper className="w-10 h-10 text-teal-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Press Room
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Latest news coverage, press releases & media mentions
          </p>
        </div>

        {/* Search & Upload */}
        <div className="mb-8 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search press releases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
          <Button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload New
          </Button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="mb-8 bg-slate-800/50 border border-teal-500/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Add New Press Release</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Title *</label>
                <Input
                  type="text"
                  placeholder="Press release title"
                  value={newRelease.title}
                  onChange={(e) => setNewRelease({...newRelease, title: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Media Source</label>
                <Input
                  type="text"
                  placeholder="e.g., Forbes, Gleaner, Rolling Stone"
                  value={newRelease.media_source}
                  onChange={(e) => setNewRelease({...newRelease, media_source: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Link *</label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={newRelease.link}
                  onChange={(e) => setNewRelease({...newRelease, link: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  Add Press Release
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadForm(false)}
                  className="border-slate-700 text-gray-400"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-teal-500/20 rounded-xl p-4">
            <div className="text-3xl font-bold text-white">{filteredReleases.length}</div>
            <div className="text-sm text-gray-400">Total Press Releases</div>
          </div>
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-4">
            <div className="text-3xl font-bold text-white">{new Set(pressReleases.map(r => r.media_source)).size}</div>
            <div className="text-sm text-gray-400">Media Outlets</div>
          </div>
          <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-4">
            <div className="text-3xl font-bold text-white">30+</div>
            <div className="text-sm text-gray-400">Countries Reached</div>
          </div>
        </div>

        {/* Press Releases List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading press releases...</div>
          </div>
        ) : filteredReleases.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400">No press releases found</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReleases.map((release) => (
              <div
                key={release.id}
                className="bg-slate-800/50 border border-slate-700 hover:border-teal-500/50 rounded-xl p-6 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Publication Logo */}
                    {release.media_source && (
                      <img 
                        src={getPublicationLogo(release.media_source)}
                        alt={release.media_source}
                        className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {release.media_source && (
                          <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 text-xs font-semibold">
                            {release.media_source}
                          </span>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(release.extractedDate || release.published_at)}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 hover:text-teal-400 transition-colors">
                        {release.title}
                      </h3>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.open(release.link, '_blank')}
                    variant="outline"
                    size="sm"
                    className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Read
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
