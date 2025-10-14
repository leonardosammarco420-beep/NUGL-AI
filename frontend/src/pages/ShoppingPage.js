import React from 'react';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { ExternalLink, ShoppingCart } from 'lucide-react';

export default function ShoppingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8" data-testid="shopping-header">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Cannabis Products
          </h1>
          <p className="text-gray-400">Shop premium cannabis products through our Shopify integration</p>
        </div>

        <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-3xl p-12 border border-teal-500/20 text-center" data-testid="shopify-placeholder">
          <ShoppingCart className="w-16 h-16 text-teal-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Shopify Integration Coming Soon
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Connect your Shopify store to display and sell cannabis products directly on NUGL. 
            Manage inventory, process orders, and track sales all in one place.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white" data-testid="connect-shopify-btn">
            <ExternalLink className="w-5 h-5 mr-2" />
            Connect Shopify Store
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 border border-teal-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Seamless Integration</h3>
            <p className="text-gray-400 text-sm">Connect your existing Shopify store with just a few clicks</p>
          </div>
          <div className="bg-slate-800/50 border border-teal-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Affiliate Commissions</h3>
            <p className="text-gray-400 text-sm">Earn commissions on every sale through our affiliate program</p>
          </div>
          <div className="bg-slate-800/50 border border-teal-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Sync</h3>
            <p className="text-gray-400 text-sm">Automatic inventory and order synchronization</p>
          </div>
        </div>
      </div>
    </div>
  );
}