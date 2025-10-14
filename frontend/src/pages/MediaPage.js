import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Video, Briefcase, Palette, Flower2, Heart, Calendar, ArrowLeft, ExternalLink } from 'lucide-react';

export default function MediaPage() {
  const { category } = useParams();
  const navigate = useNavigate();

  const categoryInfo = {
    'nugl-tv': {
      title: 'NUGL TV',
      icon: <Video className="w-12 h-12" />,
      description: 'Watch exclusive cannabis content, documentaries, interviews, and educational videos from the NUGL community.',
      color: 'from-purple-500 to-pink-500',
      externalLink: 'https://www.nugl.cm/nugl-tv' // Link to old content
    },
    'business': {
      title: 'Business',
      icon: <Briefcase className="w-12 h-12" />,
      description: 'Stay informed with the latest cannabis industry news, market trends, investment opportunities, and business insights.',
      color: 'from-blue-500 to-cyan-500',
      externalLink: 'https://www.nugl.cm/business'
    },
    'culture': {
      title: 'Culture',
      icon: <Palette className="w-12 h-12" />,
      description: 'Explore cannabis culture, art, music, lifestyle, and the stories that shape our community.',
      color: 'from-orange-500 to-red-500',
      externalLink: 'https://www.nugl.cm/culture'
    },
    'grow-products': {
      title: 'Grow Products',
      icon: <Flower2 className="w-12 h-12" />,
      description: 'Discover the best growing equipment, nutrients, seeds, and cultivation products for your cannabis garden.',
      color: 'from-green-500 to-emerald-500',
      externalLink: 'https://www.nugl.cm/grow-products'
    },
    'wellness': {
      title: 'Wellness',
      icon: <Heart className="w-12 h-12" />,
      description: 'Learn about the therapeutic benefits of cannabis, CBD products, holistic health, and wellness practices.',
      color: 'from-rose-500 to-pink-500',
      externalLink: 'https://www.nugl.cm/wellness'
    },
    'events': {
      title: 'Events',
      icon: <Calendar className="w-12 h-12" />,
      description: 'Find cannabis events, festivals, trade shows, educational seminars, and community gatherings near you.',
      color: 'from-yellow-500 to-orange-500',
      externalLink: 'https://www.nugl.cm/events'
    }
  };

  const currentCategory = categoryInfo[category] || categoryInfo['nugl-tv'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="mb-6 text-gray-400 hover:text-teal-400"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${currentCategory.color} mb-4`}>
            <div className="text-white">
              {currentCategory.icon}
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            {currentCategory.title}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {currentCategory.description}
          </p>
        </div>

        {/* Content Card */}
        <Card className="bg-slate-800/50 border-teal-500/20 p-8 mb-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block p-4 rounded-full bg-teal-500/10 mb-4">
                <ExternalLink className="w-8 h-8 text-teal-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                View Legacy Content
              </h2>
              <p className="text-gray-400 mb-6">
                Access all archived content from the original NUGL platform
              </p>
            </div>

            <Button
              onClick={() => window.open(currentCategory.externalLink, '_blank')}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-8 py-6 text-lg"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Visit {currentCategory.title} Archive
            </Button>

            <p className="text-sm text-gray-500 mt-4">
              You'll be redirected to www.nugl.cm
            </p>
          </div>
        </Card>

        {/* Coming Soon Section */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-teal-500/20 p-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-3">
              🚀 Coming Soon to NUGL 2.0
            </h3>
            <p className="text-gray-300 mb-4">
              We're migrating all content to our new platform with enhanced features:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-teal-400 rounded-full mt-2" />
                <div>
                  <p className="text-white font-medium">Enhanced Search</p>
                  <p className="text-sm text-gray-400">Find content faster with AI-powered search</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-teal-400 rounded-full mt-2" />
                <div>
                  <p className="text-white font-medium">Personalized Feed</p>
                  <p className="text-sm text-gray-400">Content tailored to your interests</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-teal-400 rounded-full mt-2" />
                <div>
                  <p className="text-white font-medium">Interactive Features</p>
                  <p className="text-sm text-gray-400">Comments, likes, and community engagement</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-teal-400 rounded-full mt-2" />
                <div>
                  <p className="text-white font-medium">Mobile Optimized</p>
                  <p className="text-sm text-gray-400">Perfect experience on any device</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
