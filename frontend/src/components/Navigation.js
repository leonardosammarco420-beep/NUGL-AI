import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { toast } from 'sonner';
import axios from 'axios';
import { Menu, X, LogOut, User, Wallet, Crown, Gift, Building2, ChevronDown, Leaf, Bot, Sprout, Video, Briefcase, Palette, Flower2, Heart, Calendar, TrendingUp, Sparkles, MessageSquare, Brain, Zap, FileText } from 'lucide-react';

export default function Navigation() {
  const { user, token, login, logout, API } = useContext(AuthContext);
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [userCredits, setUserCredits] = useState(0);
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      login(response.data.token, { id: response.data.user_id, username: response.data.username });
      setShowAuth(false);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/auth/register`, { ...registerData, auth_method: 'jwt' });
      login(response.data.token, { id: response.data.user_id, username: response.data.username });
      setShowAuth(false);
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        toast.error('Please install MetaMask to connect your wallet');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      setWalletAddress(address);
      setWalletConnected(true);
      
      // Fetch user credits from backend
      try {
        const response = await axios.get(`${API}/users/wallet/${address}`);
        setUserCredits(response.data.credits || 0);
      } catch (err) {
        // If user doesn't exist, they have 0 credits
        setUserCredits(0);
      }
      
      toast.success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error(error);
    }
  };

  const navLinks = [
    { to: '/news', label: 'News' },
    { to: '/crypto', label: 'Crypto', highlight: true },
    { to: '/nft-marketplace', label: 'NFTs' },
    { to: '/shop', label: 'Shop' },
    { to: '/affiliate', label: 'Affiliate' },
    { to: '/investors', label: 'Investors' },
  ];

  const cannabisLinks = [
    { to: '/strains', label: 'Strains', icon: Leaf },
    { to: '/seeds', label: 'Seeds', icon: Sprout },
    { to: '/chat', label: 'AI Chat', icon: Bot },
  ];

  const mediaLinks = [
    { to: '/media/nugl-tv', label: 'NUGL TV', icon: Video },
    { to: '/media/business', label: 'Business', icon: Briefcase },
    { to: '/media/culture', label: 'Culture', icon: Palette },
    { to: '/media/grow-products', label: 'Grow Products', icon: Flower2 },
    { to: '/media/wellness', label: 'Wellness', icon: Heart },
    { to: '/media/events', label: 'Events', icon: Calendar },
  ];

  const aiLinks = [
    { to: '/ai-hub?model=gpt', label: 'ChatGPT', icon: MessageSquare },
    { to: '/ai-hub?model=claude', label: 'Claude', icon: Brain },
    { to: '/ai-hub?model=perplexity', label: 'Perplexity', icon: Sparkles },
    { to: '/ai-hub?model=deepseek', label: 'DeepSeek', icon: Zap },
    { to: '/chat', label: 'Cannabis Expert', icon: Leaf },
    { to: '/ai-hub?model=huggingface', label: 'HuggingFace Spaces', icon: Bot },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-teal-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
              <div className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                NUGL
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {/* AI Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="px-3 py-2 rounded-lg text-sm font-medium text-purple-400 hover:text-purple-300 hover:bg-slate-800/50 transition-colors flex items-center gap-1"
                    data-testid="nav-ai"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-slate-900 border-purple-500/30 min-w-[200px]"
                  align="end"
                >
                  {aiLinks.map((link) => (
                    <DropdownMenuItem 
                      key={link.to}
                      asChild
                      className="cursor-pointer text-gray-300 hover:text-purple-400 hover:bg-slate-800/50 focus:text-purple-400 focus:bg-slate-800/50"
                    >
                      <Link 
                        to={link.to} 
                        className="flex items-center gap-2 w-full"
                        data-testid={`ai-${link.label.toLowerCase().replace(' ', '-')}`}
                      >
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* News */}
              <Link
                to="/news"
                data-testid="nav-news"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-teal-400 hover:bg-slate-800/50 transition-colors"
              >
                News
              </Link>

              {/* Crypto */}
              <Link
                to="/crypto"
                data-testid="nav-crypto"
                className="px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 transition-colors"
              >
                <Building2 className="w-4 h-4 inline mr-1" />
                Crypto
              </Link>
              
              {/* Cannabis Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-teal-400 hover:bg-slate-800/50 transition-colors flex items-center gap-1"
                    data-testid="nav-cannabis"
                  >
                    <Leaf className="w-4 h-4" />
                    Cannabis
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-slate-900 border-teal-500/30 min-w-[180px]"
                  align="end"
                >
                  {cannabisLinks.map((link) => (
                    <DropdownMenuItem 
                      key={link.to}
                      asChild
                      className="cursor-pointer text-gray-300 hover:text-teal-400 hover:bg-slate-800/50 focus:text-teal-400 focus:bg-slate-800/50"
                    >
                      <Link 
                        to={link.to} 
                        className="flex items-center gap-2 w-full"
                        data-testid={`cannabis-${link.label.toLowerCase().replace(' ', '-')}`}
                      >
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* NFTs */}
              <Link
                to="/nft-marketplace"
                data-testid="nav-nfts"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-teal-400 hover:bg-slate-800/50 transition-colors"
              >
                NFTs
              </Link>

              {/* Shop */}
              <Link
                to="/shop"
                data-testid="nav-shop"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-teal-400 hover:bg-slate-800/50 transition-colors"
              >
                Shop
              </Link>

              {/* Social */}
              <Link
                to="/social"
                data-testid="nav-social"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-teal-400 hover:bg-slate-800/50 transition-colors"
              >
                Social
              </Link>

              {/* Media Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-teal-400 hover:bg-slate-800/50 transition-colors flex items-center gap-1"
                    data-testid="nav-media"
                  >
                    <Video className="w-4 h-4" />
                    Media
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-slate-900 border-teal-500/30 min-w-[180px]"
                  align="end"
                >
                  {mediaLinks.map((link) => (
                    <DropdownMenuItem 
                      key={link.to}
                      asChild
                      className="cursor-pointer text-gray-300 hover:text-teal-400 hover:bg-slate-800/50 focus:text-teal-400 focus:bg-slate-800/50"
                    >
                      <Link 
                        to={link.to} 
                        className="flex items-center gap-2 w-full"
                        data-testid={`media-${link.label.toLowerCase().replace(' ', '-')}`}
                      >
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Investors Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-teal-400 hover:bg-slate-800/50 transition-colors flex items-center gap-1"
                    data-testid="nav-investors"
                  >
                    <Building2 className="w-4 h-4" />
                    Investors
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-slate-900 border-teal-500/30 min-w-[180px]"
                  align="end"
                >
                  <DropdownMenuItem 
                    asChild
                    className="cursor-pointer text-gray-300 hover:text-teal-400 hover:bg-slate-800/50 focus:text-teal-400 focus:bg-slate-800/50"
                  >
                    <Link 
                      to="/investors" 
                      className="flex items-center gap-2 w-full"
                      data-testid="investor-relations"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Investor Relations
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    asChild
                    className="cursor-pointer text-gray-300 hover:text-teal-400 hover:bg-slate-800/50 focus:text-teal-400 focus:bg-slate-800/50"
                  >
                    <Link 
                      to="/press-room" 
                      className="flex items-center gap-2 w-full"
                      data-testid="press-room"
                    >
                      <FileText className="w-4 h-4" />
                      Press Room
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Affiliate */}
              <Link
                to="/affiliate"
                data-testid="nav-affiliate"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-teal-400 hover:bg-slate-800/50 transition-colors"
              >
                Affiliate
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  <Button
                    onClick={() => navigate('/earnings')}
                    variant="outline"
                    size="sm"
                    data-testid="earnings-nav-button"
                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Earnings
                  </Button>
                  <Button
                    onClick={() => navigate('/subscription')}
                    variant="outline"
                    size="sm"
                    data-testid="subscription-nav-button"
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Premium
                  </Button>
                  <Button
                    onClick={() => navigate('/wallet')}
                    variant="outline"
                    size="sm"
                    data-testid="wallet-nav-button"
                    className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Wallet
                  </Button>
                  <Button
                    onClick={() => navigate('/profile')}
                    variant="outline"
                    size="sm"
                    data-testid="profile-nav-button"
                    className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {user.username}
                  </Button>
                  <Button
                    onClick={logout}
                    variant="ghost"
                    size="sm"
                    data-testid="logout-button"
                    className="text-gray-400 hover:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : walletConnected ? (
                <div className="flex items-center gap-3">
                  <div className="px-3 py-2 rounded-lg bg-slate-800/50 border border-teal-500/30 text-sm">
                    <span className="text-gray-400">Balance: </span>
                    <span className="text-teal-400 font-semibold">{userCredits} credits</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                    data-testid="wallet-address-button"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={connectWallet}
                  data-testid="connect-wallet-button"
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden text-gray-300 hover:text-teal-400"
              data-testid="mobile-menu-toggle"
            >
              {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden border-t border-teal-500/20 bg-slate-900" data-testid="mobile-menu">
            <div className="px-4 py-3 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenu(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-teal-400 hover:bg-slate-800/50"
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Cannabis Section for Mobile */}
              <div className="pt-2 border-t border-teal-500/10">
                <div className="px-3 py-2 text-xs font-semibold text-teal-400 flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  Cannabis
                </div>
                {cannabisLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenu(false)}
                    className="block pl-6 pr-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-teal-400 hover:bg-slate-800/50 flex items-center gap-2"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Media Section for Mobile */}
              <div className="pt-2 border-t border-teal-500/10">
                <div className="px-3 py-2 text-xs font-semibold text-teal-400 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Media
                </div>
                {mediaLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenu(false)}
                    className="block pl-6 pr-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-teal-400 hover:bg-slate-800/50 flex items-center gap-2"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
              
              {user ? (
                <>
                  <Button onClick={() => { navigate('/wallet'); setMobileMenu(false); }} variant="outline" className="w-full">
                    <Wallet className="w-4 h-4 mr-2" /> Wallet
                  </Button>
                  <Button onClick={() => { navigate('/profile'); setMobileMenu(false); }} variant="outline" className="w-full">
                    <User className="w-4 h-4 mr-2" /> Profile
                  </Button>
                  <Button onClick={logout} variant="ghost" className="w-full text-red-400">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </>
              ) : (
                <Button onClick={() => { setShowAuth(true); setMobileMenu(false); }} className="w-full">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="bg-slate-900 border-teal-500/30" data-testid="auth-dialog">
          <DialogHeader>
            <DialogTitle className="text-teal-400">Welcome to NUGL</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login" data-testid="login-form">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    data-testid="login-username-input"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    data-testid="login-password-input"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="login-submit-button">
                  Login
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register" data-testid="register-form">
              <form onSubmit={handleRegister} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="register-username">Username</Label>
                  <Input
                    id="register-username"
                    data-testid="register-username-input"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    data-testid="register-email-input"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    data-testid="register-password-input"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="register-submit-button">
                  Register
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}