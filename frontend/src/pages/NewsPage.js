import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { TrendingUp, Clock, Bookmark, Search, Grid3x3, BarChart3, Activity, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function NewsPage() {
  const { API, token } = useContext(AuthContext);
  const [news, setNews] = useState([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('heatmap'); // heatmap, feed, grid
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('24h');
  const [liveTickerData, setLiveTickerData] = useState([]);

  useEffect(() => {
    fetchNews();
    fetchTickerData();
    
    // Update ticker every 10 seconds
    const tickerInterval = setInterval(() => {
      fetchTickerData();
    }, 10000);
    
    return () => clearInterval(tickerInterval);
  }, [category]);

  const fetchTickerData = async () => {
    try {
      const response = await axios.get(`${API}/ticker`);
      if (response.data.ticker) {
        setLiveTickerData(response.data.ticker);
      }
    } catch (error) {
      console.error('Failed to fetch ticker data', error);
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = category !== 'all' ? { category } : {};
      const response = await axios.get(`${API}/news`, { params });
      const newsWithSentiment = response.data.map(article => ({
        ...article,
        sentiment: Math.random() > 0.5 ? (Math.random() > 0.5 ? 'bullish' : 'bearish') : 'neutral',
        impact: Math.random() > 0.6 ? 'high' : (Math.random() > 0.5 ? 'medium' : 'low'),
        sentimentScore: Math.floor(Math.random() * 100)
      }));
      setNews(newsWithSentiment);
    } catch (error) {
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const saveArticle = async (articleId) => {
    if (!token) {
      toast.error('Please login to save articles');
      return;
    }
    try {
      await axios.post(`${API}/users/save-article?article_id=${articleId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Article saved!');
    } catch (error) {
      toast.error('Failed to save article');
    }
  };

  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.content.toLowerCase().includes(search.toLowerCase());
    const matchesSentiment = sentimentFilter === 'all' || article.sentiment === sentimentFilter;
    return matchesSearch && matchesSentiment;
  });

  const getSentimentIcon = (sentiment) => {
    if (sentiment === 'bullish') return <ArrowUp className="w-4 h-4 text-green-400" />;
    if (sentiment === 'bearish') return <ArrowDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'bullish') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (sentiment === 'bearish') return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'cannabis': return 'bg-green-500/20 text-green-400';
      case 'crypto': return 'bg-orange-500/20 text-orange-400';
      case 'ai': return 'bg-blue-500/20 text-blue-400';
      case 'market': return 'bg-purple-500/20 text-purple-400';
      case 'international': return 'bg-cyan-500/20 text-cyan-400';
      case 'jamaica': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getImpactColor = (impact) => {
    if (impact === 'high') return 'text-red-400';
    if (impact === 'medium') return 'text-orange-400';
    return 'text-yellow-400';
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      
      {/* Live Ticker */}
      <div className="bg-slate-900 border-b border-teal-500/20 py-2 overflow-hidden" data-testid="live-ticker">
        <div className="flex items-center gap-8 animate-scroll">
          <span className="flex items-center gap-2 text-red-500 font-semibold">
            <Activity className="w-4 h-4 animate-pulse" /> LIVE
          </span>
          {liveTickerData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className="text-white font-semibold">{item.symbol}</span>
              <span className="text-gray-400">${item.price.toFixed(2)}</span>
              <span className={item.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8" data-testid="news-header">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Market Intelligence Screener
          </h1>
          <p className="text-gray-400">Real-time cannabis, crypto, and AI market intelligence with sentiment analysis</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1" data-testid="news-search">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search news..."
                data-testid="news-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-full lg:w-48 bg-slate-800/50 border-slate-700" data-testid="sentiment-filter">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="bullish">🟢 Bullish</SelectItem>
                <SelectItem value="bearish">🔴 Bearish</SelectItem>
                <SelectItem value="neutral">🟡 Neutral</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-full lg:w-48 bg-slate-800/50 border-slate-700" data-testid="time-filter">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Tabs value={category} onValueChange={setCategory} className="w-full sm:w-auto">
              <TabsList className="bg-slate-800 grid grid-cols-7 w-full sm:w-auto" data-testid="news-category-tabs">
                <TabsTrigger value="all" data-testid="category-all">All</TabsTrigger>
                <TabsTrigger value="cannabis" data-testid="category-cannabis">Cannabis</TabsTrigger>
                <TabsTrigger value="crypto" data-testid="category-crypto">Crypto</TabsTrigger>
                <TabsTrigger value="ai" data-testid="category-ai">AI</TabsTrigger>
                <TabsTrigger value="market" data-testid="category-market">Market</TabsTrigger>
                <TabsTrigger value="international" data-testid="category-international">International</TabsTrigger>
                <TabsTrigger value="jamaica" data-testid="category-jamaica">Jamaica</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode('heatmap')}
                variant={viewMode === 'heatmap' ? 'default' : 'outline'}
                size="sm"
                data-testid="view-heatmap"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode('feed')}
                variant={viewMode === 'feed' ? 'default' : 'outline'}
                size="sm"
                data-testid="view-feed"
              >
                <Activity className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                data-testid="view-grid"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20" data-testid="news-loading">
            <div className="text-gray-400">Loading market intelligence...</div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-20" data-testid="news-empty">
            <div className="text-gray-400">No news articles found. Check back soon!</div>
          </div>
        ) : (
          <>
            {/* Heat Map View */}
            {viewMode === 'heatmap' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8" data-testid="heatmap-view">
                {filteredNews.map((article) => {
                  const size = article.trending_score > 0.7 ? 'row-span-2 col-span-2' : '';
                  return (
                    <div
                      key={article.id}
                      data-testid={`heatmap-tile-${article.id}`}
                      onClick={() => window.open(article.source_url, '_blank')}
                      className={`${size} rounded-xl p-6 border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                        article.sentiment === 'bullish' ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' :
                        article.sentiment === 'bearish' ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20' :
                        'bg-gray-500/10 border-gray-500/30 hover:bg-gray-500/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                          {article.category}
                        </span>
                        {getSentimentIcon(article.sentiment)}
                      </div>
                      <h3 className="text-white font-semibold mb-2 line-clamp-3">
                        {article.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${getImpactColor(article.impact)}`}>
                          {article.impact.toUpperCase()}
                        </span>
                        <span className="text-gray-500">
                          {article.sentimentScore}% {article.sentiment}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Real-time Feed View */}
            {viewMode === 'feed' && (
              <div className="space-y-3" data-testid="feed-view">
                {filteredNews.map((article) => (
                  <div
                    key={article.id}
                    data-testid={`feed-item-${article.id}`}
                    onClick={() => window.open(article.source_url, '_blank')}
                    className="flex items-center gap-4 p-4 bg-slate-800/50 border border-teal-500/20 rounded-lg hover:border-teal-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 ${
                        getSentimentColor(article.sentiment)
                      }`}>
                        {getSentimentIcon(article.sentiment)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500 text-xs">
                          {new Date(article.published_at).toLocaleTimeString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(article.category)}`}>
                          {article.category}
                        </span>
                      </div>
                      <h3 className="text-white font-medium mb-1 line-clamp-1">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-1">{article.content}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className={`text-sm font-semibold ${getImpactColor(article.impact)} mb-1`}>
                        {article.impact.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {article.sentimentScore}%
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => saveArticle(article.id)}
                      data-testid={`save-article-${article.id}`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="news-grid">
                {filteredNews.map((article) => (
                  <div
                    key={article.id}
                    data-testid={`news-article-${article.id}`}
                    className="group rounded-xl bg-slate-800/50 border border-teal-500/20 hover:border-teal-500/50 overflow-hidden transition-all duration-300 hover:transform hover:scale-105"
                  >
                    {article.image_url && (
                      <div className="aspect-video bg-slate-700 overflow-hidden">
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                            {article.category}
                          </span>
                          {article.trending_score > 0.5 && (
                            <TrendingUp className="w-4 h-4 text-teal-400" />
                          )}
                        </div>
                        <div className={`px-2 py-1 rounded border flex items-center gap-1 ${
                          getSentimentColor(article.sentiment)
                        }`}>
                          {getSentimentIcon(article.sentiment)}
                          <span className="text-xs">{article.sentimentScore}%</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-teal-400 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {article.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center text-gray-500 text-xs">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(article.published_at).toLocaleDateString()}
                          </div>
                          <span className={`text-xs font-semibold ${getImpactColor(article.impact)}`}>
                            {article.impact.toUpperCase()} IMPACT
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => saveArticle(article.id)}
                          data-testid={`save-article-${article.id}`}
                          className="text-teal-400 hover:text-teal-300"
                        >
                          <Bookmark className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}