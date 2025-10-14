import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Check, Crown, Zap, TrendingUp, Copy } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function SubscriptionPage() {
  const { user, token, API } = useContext(AuthContext);
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchPlans();
    fetchCurrentPlan();
  }, [user]);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API}/subscriptions/plans`);
      setPlans(response.data.plans);
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPlan = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API}/subscriptions/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentPlan(response.data);
    } catch (error) {
      console.error('Failed to fetch current plan');
    }
  };

  const handleUpgrade = async (planId) => {
    try {
      const response = await axios.post(
        `${API}/subscriptions/create-checkout`,
        { plan_id: planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = response.data.checkout_url;
    } catch (error) {
      toast.error('Failed to create checkout session');
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await axios.post(
          `${API}/subscriptions/cancel`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Subscription canceled');
        fetchCurrentPlan();
      } catch (error) {
        toast.error('Failed to cancel subscription');
      }
    }
  };

  const getPlanIcon = (planId) => {
    if (planId === 'premium') return <Crown className="w-6 h-6" />;
    if (planId === 'pro') return <Zap className="w-6 h-6" />;
    return <TrendingUp className="w-6 h-6" />;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12" data-testid="subscription-header">
          <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Choose Your Plan
          </h1>
          <p className="text-gray-400 text-lg">
            Unlock premium features and maximize your earnings
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-gray-400">Loading plans...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => {
              const isCurrentPlan = currentPlan?.plan_id === plan.id || (plan.id === 'free' && !currentPlan?.plan_id);
              const isPremium = plan.id === 'premium';
              
              return (
                <Card
                  key={plan.id}
                  data-testid={`plan-card-${plan.id}`}
                  className={`relative p-8 ${
                    isPremium
                      ? 'bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/50'
                      : 'bg-slate-800/50 border-teal-500/20'
                  }`}
                >
                  {isPremium && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <div className={`inline-flex p-4 rounded-2xl mb-4 ${
                      isPremium ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-700/50 text-gray-400'
                    }`}>
                      {getPlanIcon(plan.id)}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-gray-400">/{plan.interval}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button
                      disabled
                      className="w-full bg-slate-700 text-gray-400 cursor-not-allowed"
                      data-testid={`current-plan-${plan.id}`}
                    >
                      Current Plan
                    </Button>
                  ) : plan.id === 'free' ? (
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-gray-400"
                      disabled
                    >
                      Free Forever
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      className={`w-full ${
                        isPremium
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600'
                          : 'bg-teal-500 hover:bg-teal-600'
                      } text-white`}
                      data-testid={`upgrade-${plan.id}`}
                    >
                      Upgrade Now
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {currentPlan && currentPlan.plan_id !== 'free' && (
          <Card className="bg-slate-800/50 border-teal-500/20 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Current Subscription</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Plan: <span className="text-white font-semibold">{currentPlan.plan_id}</span></p>
                <p className="text-gray-400 text-sm mt-1">Status: <span className="text-green-400">{currentPlan.status}</span></p>
              </div>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                data-testid="cancel-subscription"
              >
                Cancel Subscription
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}