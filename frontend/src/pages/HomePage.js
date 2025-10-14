import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { ArrowRight, TrendingUp, Leaf, Bitcoin, Brain, ShoppingBag, MessageSquare } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Cannabis News Radar',
      description: 'Real-time trending cannabis, crypto, and AI news in a dynamic dashboard',
      link: '/news',
      testid: 'feature-news'
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: 'Global Strain Finder',
      description: 'Search thousands of strains with affiliate links to dispensaries worldwide',
      link: '/strains',
      testid: 'feature-strains'
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI Cannabis Expert',
      description: 'Get instant answers to all your cannabis questions from our AI assistant',
      link: '/chat',
      testid: 'feature-chat'
    },
    {
      icon: <Bitcoin className="w-8 h-8" />,
      title: 'NFT Marketplace',
      description: 'Buy, sell, and trade cannabis-themed NFTs on Ethereum and Solana',
      link: '/nft-marketplace',
      testid: 'feature-nft'
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: 'Cannabis Products',
      description: 'Shop premium cannabis products through our Shopify integration',
      link: '/shop',
      testid: 'feature-shop'
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Crypto Wallet',
      description: 'Manage your crypto assets with MetaMask and WalletConnect integration',
      link: '/wallet',
      testid: 'feature-wallet'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-emerald-500/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="hero-title">
              THE DIGITAL GREENHOUSE
            </h1>
            <p className="text-2xl sm:text-3xl bg-gradient-to-r from-teal-400 via-emerald-400 to-green-400 bg-clip-text text-transparent font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Where Cannabis Culture Meets Crypto Innovation and AI Intelligence
            </p>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }} data-testid="hero-description">
              Real-time market intelligence, strain discovery, NFT trading, and AI-powered insights. Monetize your passion with affiliate rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center" data-testid="hero-cta">
              <Link to="/news">
                <Button size="lg" className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-8" data-testid="cta-explore-news">
                  Explore News <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/chat">
                <Button size="lg" variant="outline" className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10" data-testid="cta-ai-chat">
                  Try AI Assistant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-900/50" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Everything You Need
            </h2>
            <p className="text-gray-400 text-lg">
              Cutting-edge tools for the modern cannabis enthusiast
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link} data-testid={feature.testid}>
                <div className="group p-6 rounded-2xl bg-slate-800/50 border border-teal-500/20 hover:border-teal-500/50 hover:bg-slate-800/80 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center text-teal-400 group-hover:text-teal-300">
                    Learn more <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Monetization Section */}
      <section className="py-20" data-testid="monetization-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-3xl p-12 border border-teal-500/20">
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Earn While You Explore
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Access exclusive affiliate partnerships with legal cannabis dispensaries, seed wholesalers, and Stake Casino. Start earning commissions today.
              </p>
              <Button size="lg" className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white" data-testid="cta-get-started">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-teal-500/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>© 2025 NUGL. All rights reserved. Cannabis, Crypto & AI Innovation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}