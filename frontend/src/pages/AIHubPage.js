import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../App';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { MessageSquare, Brain, Sparkles, Zap, Bot, Leaf, ExternalLink, Send, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function AIHubPage() {
  const { API } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || 'cannabis');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const aiModels = [
    {
      id: 'cannabis',
      name: 'Cannabis Expert',
      icon: Leaf,
      color: 'text-teal-400',
      url: '/chat',
      isInternal: true,
      usable: true,
      description: '🎯 FREE on NUGL - GPT-5 powered cannabis expert'
    },
    {
      id: 'gpt',
      name: 'ChatGPT',
      icon: MessageSquare,
      color: 'text-green-400',
      url: 'https://chat.openai.com/?ref=nugl',
      affiliateId: 'chatgpt-affiliate',
      description: 'OpenAI GPT-4 - Best for general tasks, coding, writing'
    },
    {
      id: 'claude',
      name: 'Claude',
      icon: Brain,
      color: 'text-orange-400',
      url: 'https://claude.ai/?ref=nugl',
      affiliateId: 'claude-affiliate',
      description: 'Anthropic Claude - Great for analysis, long documents'
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      icon: Sparkles,
      color: 'text-blue-400',
      url: 'https://www.perplexity.ai/?ref=nugl',
      affiliateId: 'perplexity-affiliate',
      description: 'Real-time web search with AI answers'
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      icon: Zap,
      color: 'text-purple-400',
      url: 'https://chat.deepseek.com/?ref=nugl',
      affiliateId: 'deepseek-affiliate',
      description: 'DeepSeek AI - Advanced reasoning and coding'
    },
    {
      id: 'huggingface',
      name: 'HuggingFace Spaces',
      icon: Bot,
      color: 'text-yellow-400',
      url: 'https://huggingface.co/spaces?ref=nugl',
      affiliateId: 'huggingface-affiliate',
      description: 'Browse 1000+ AI apps and models'
    }
  ];

  const currentModel = aiModels.find(m => m.id === selectedModel) || aiModels[0];

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    setSearchParams({ model: modelId });
    setMessages([]);
  };

  const trackAffiliateClick = async (model) => {
    if (model.affiliateId) {
      try {
        await axios.post(`${API}/affiliate/track-click`, {
          partner_id: model.affiliateId,
          partner_name: model.name,
          source_page: 'ai-hub',
          ai_model: model.id
        });
        console.log('Affiliate click tracked:', model.name);
      } catch (error) {
        console.error('Failed to track click', error);
      }
    }
  };

  const handleExternalOpen = (model) => {
    trackAffiliateClick(model);
    window.open(model.url, '_blank');
  };

  const [sessionId, setSessionId] = useState(null);

  const handleSendMessage = async () => {
    if (!prompt.trim() || loading) return;

    const userMessage = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: currentPrompt,
        session_id: sessionId
      });

      setSessionId(response.data.session_id);
      const botMessage = { role: 'assistant', content: response.data.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Check console for details.');
      const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Hub
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Access multiple AI platforms in one place - Stay on NUGL
          </p>
        </div>

        {/* AI Model Selector */}
        <div className="mb-6">
          <Tabs value={selectedModel} onValueChange={handleModelChange} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2 bg-slate-800/50 p-2">
              {aiModels.map((model) => (
                <TabsTrigger
                  key={model.id}
                  value={model.id}
                  className="flex items-center gap-2 data-[state=active]:bg-slate-700"
                >
                  <model.icon className={`w-4 h-4 ${model.color}`} />
                  <span className="hidden md:inline">{model.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Model Info Card */}
        <div className="mb-6 p-6 bg-slate-800/50 border border-purple-500/20 rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <currentModel.icon className={`w-8 h-8 ${currentModel.color}`} />
              <div>
                <h3 className="text-xl font-semibold text-white">{currentModel.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{currentModel.description}</p>
              </div>
            </div>
            {!currentModel.usable && (
              <Button
                onClick={() => handleExternalOpen(currentModel)}
                variant="outline"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                Open & Earn Commission
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Chat Interface or External Link */}
        <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl overflow-hidden">
          {currentModel.usable ? (
            <div className="p-6">
              {/* Chat Messages */}
              <div className="h-[400px] overflow-y-auto mb-4 space-y-4 bg-slate-900/50 rounded-lg p-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <currentModel.icon className={`w-12 h-12 ${currentModel.color} mx-auto mb-3`} />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {currentModel.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Ask me anything about cannabis, strains, growing tips, or legality!
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-700 text-gray-200'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 rounded-lg p-3">
                      <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Box */}
              <div className="flex gap-2">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask about cannabis strains, effects, growing tips..."
                  className="flex-1 bg-slate-900 border-slate-700 text-white"
                  rows={2}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={loading || !prompt.trim()}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-slate-900 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <currentModel.icon className={`w-16 h-16 ${currentModel.color} mx-auto mb-4`} />
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    {currentModel.name}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Click the button above to open {currentModel.name} in a new tab
                  </p>
                  <div className="max-w-md mx-auto">
                    <p className="text-sm text-gray-500 mb-4">
                      💡 Tip: Use the dropdown menu to quickly switch between AI platforms
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiModels.slice(0, 3).map((model) => (
            <div
              key={model.id}
              onClick={() => handleModelChange(model.id)}
              className="p-4 bg-slate-800/30 border border-slate-700 hover:border-purple-500/50 rounded-lg cursor-pointer transition-all hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-2">
                <model.icon className={`w-5 h-5 ${model.color}`} />
                <h4 className="font-semibold text-white">{model.name}</h4>
              </div>
              <p className="text-sm text-gray-400">{model.description}</p>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">
            Why Use AI Hub?
          </h3>
          <ul className="text-gray-400 space-y-2">
            <li>✓ Access 6 different AI platforms from one place</li>
            <li>✓ No need to remember multiple logins</li>
            <li>✓ Compare responses across different AI models</li>
            <li>✓ Stay on NUGL.com for all your AI needs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
