import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Instagram, Twitter, Facebook, Youtube, TrendingUp, Users, Heart, MessageCircle, ExternalLink } from 'lucide-react';

export default function SocialHubPage() {
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  useEffect(() => {
    // Load Twitter widget script
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const socialAccounts = [
    {
      platform: 'instagram',
      name: 'Kaya Inc',
      handle: '@kaya.inc',
      url: 'https://www.instagram.com/kaya.inc/',
      embedUrl: 'https://www.instagram.com/kaya.inc/embed',
      icon: Instagram,
      color: 'from-purple-500 to-pink-500',
      stats: { followers: '18.7K', engagement: '8.2%' }
    },
    {
      platform: 'instagram',
      name: 'Kaya Pizza',
      handle: '@kaya.pizza',
      url: 'https://www.instagram.com/kaya.pizza/',
      embedUrl: 'https://www.instagram.com/kaya.pizza/embed',
      icon: Instagram,
      color: 'from-purple-500 to-pink-500',
      stats: { followers: '8.3K', engagement: '5.1%' }
    },
    {
      platform: 'instagram',
      name: 'Pickle Park Jamaica',
      handle: '@pickle_park_jamaica',
      url: 'https://www.instagram.com/pickle_park_jamaica/',
      embedUrl: 'https://www.instagram.com/pickle_park_jamaica/embed',
      icon: Instagram,
      color: 'from-purple-500 to-pink-500',
      stats: { followers: '3.2K', engagement: '6.8%' }
    },
    {
      platform: 'instagram',
      name: 'NUGL Official',
      handle: '@nuglofficial',
      url: 'https://www.instagram.com/nuglofficial/',
      embedUrl: 'https://www.instagram.com/nuglofficial/embed',
      icon: Instagram,
      color: 'from-purple-500 to-pink-500',
      stats: { followers: '12.5K', engagement: '4.2%' }
    },
    {
      platform: 'instagram',
      name: 'The Gap JA',
      handle: '@thegapja',
      url: 'https://www.instagram.com/thegapja/',
      embedUrl: 'https://www.instagram.com/thegapja/embed',
      icon: Instagram,
      color: 'from-purple-500 to-pink-500',
      stats: { followers: '5.4K', engagement: '4.8%' }
    },
    {
      platform: 'twitter',
      name: 'NUGL Media',
      handle: '@nuglmedia',
      url: 'https://x.com/nuglmedia',
      embedUrl: 'https://twitter.com/nuglmedia',
      icon: Twitter,
      color: 'from-blue-400 to-cyan-500',
      stats: { followers: '5.8K', engagement: '3.4%' }
    },
    {
      platform: 'facebook',
      name: 'NUGL Media',
      handle: 'NUGLmedia',
      url: 'https://www.facebook.com/NUGLmedia/',
      embedUrl: 'https://www.facebook.com/plugins/page.php?href=https://www.facebook.com/NUGLmedia',
      icon: Facebook,
      color: 'from-blue-600 to-blue-400',
      stats: { followers: '15.2K', engagement: '2.8%' }
    },
    {
      platform: 'youtube',
      name: 'NUGL Media',
      handle: '@NUGLMedia',
      url: 'https://www.youtube.com/c/NUGLMedia',
      embedUrl: 'https://www.youtube.com/embed?listType=user_uploads&list=NUGLMedia',
      icon: Youtube,
      color: 'from-red-500 to-red-600',
      stats: { followers: '22.1K', engagement: '7.5%' }
    }
  ];

  const filteredAccounts = selectedPlatform === 'all' 
    ? socialAccounts 
    : socialAccounts.filter(acc => acc.platform === selectedPlatform);

  const totalStats = {
    totalFollowers: '91K+',
    avgEngagement: '5.3%',
    totalPosts: '1.7K+',
    weeklyReach: '195K+'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-10 h-10 text-teal-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Social Hub
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Connect with NUGL across all platforms - Live feeds, community updates & engagement
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-teal-500/20 rounded-xl p-4 text-center">
            <Users className="w-8 h-8 text-teal-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalStats.totalFollowers}</div>
            <div className="text-sm text-gray-400">Total Followers</div>
          </div>
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-4 text-center">
            <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalStats.avgEngagement}</div>
            <div className="text-sm text-gray-400">Avg Engagement</div>
          </div>
          <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-4 text-center">
            <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalStats.totalPosts}</div>
            <div className="text-sm text-gray-400">Total Posts</div>
          </div>
          <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-4 text-center">
            <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalStats.weeklyReach}</div>
            <div className="text-sm text-gray-400">Weekly Reach</div>
          </div>
        </div>

        {/* Platform Filter */}
        <div className="mb-6">
          <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform} className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-2 bg-slate-800/50 p-2">
              <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">
                All Platforms
              </TabsTrigger>
              <TabsTrigger value="instagram" className="data-[state=active]:bg-slate-700">
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </TabsTrigger>
              <TabsTrigger value="twitter" className="data-[state=active]:bg-slate-700">
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </TabsTrigger>
              <TabsTrigger value="facebook" className="data-[state=active]:bg-slate-700">
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </TabsTrigger>
              <TabsTrigger value="youtube" className="data-[state=active]:bg-slate-700">
                <Youtube className="w-4 h-4 mr-2" />
                YouTube
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Social Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account, idx) => (
            <div
              key={idx}
              className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-teal-500/50 transition-all"
            >
              {/* Account Header */}
              <div className={`bg-gradient-to-r ${account.color} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <account.icon className="w-6 h-6 text-white" />
                    <div>
                      <div className="font-semibold text-white">{account.name}</div>
                      <div className="text-xs text-white/80">{account.handle}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.open(account.url, '_blank')}
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="p-4 bg-slate-900/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-400">Followers</div>
                    <div className="text-lg font-semibold text-white">{account.stats.followers}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Engagement</div>
                    <div className="text-lg font-semibold text-teal-400">{account.stats.engagement}</div>
                  </div>
                </div>
              </div>

              {/* Embedded Feed Preview */}
              <div className="aspect-square bg-slate-900 relative overflow-hidden">
                {account.platform === 'instagram' ? (
                  <iframe
                    src={`${account.url}embed/`}
                    className="w-full h-full"
                    frameBorder="0"
                    scrolling="no"
                    allowTransparency={true}
                  />
                ) : account.platform === 'twitter' ? (
                  <div className="w-full h-full overflow-auto">
                    <a 
                      className="twitter-timeline" 
                      data-height="500" 
                      data-theme="dark" 
                      href={`${account.url}?ref_src=twsrc%5Etfw`}
                    >
                      Loading Twitter feed...
                    </a>
                  </div>
                ) : account.platform === 'facebook' ? (
                  <iframe
                    src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(account.url)}&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`}
                    className="w-full h-full"
                    frameBorder="0"
                    scrolling="yes"
                    allow="encrypted-media"
                  />
                ) : account.platform === 'youtube' ? (
                  <iframe
                    src={`https://www.youtube.com/embed?listType=user_uploads&list=${account.handle.replace('@', '')}`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <account.icon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-sm text-gray-500 mb-4">
                        Click below to view live {account.platform} feed
                      </p>
                      <Button
                        onClick={() => window.open(account.url, '_blank')}
                        className={`bg-gradient-to-r ${account.color} text-white hover:opacity-90`}
                      >
                        View Feed
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/30 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-2">
            Join the NUGL Community
          </h3>
          <p className="text-gray-400 mb-6">
            Follow us on all platforms for exclusive content, updates, and community engagement
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => window.open('https://www.instagram.com/nuglofficial/', '_blank')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Follow on Instagram
            </Button>
            <Button
              onClick={() => window.open('https://x.com/nuglmedia', '_blank')}
              className="bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600"
            >
              <Twitter className="w-4 h-4 mr-2" />
              Follow on Twitter
            </Button>
            <Button
              onClick={() => window.open('https://www.youtube.com/c/NUGLMedia', '_blank')}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              <Youtube className="w-4 h-4 mr-2" />
              Subscribe on YouTube
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
