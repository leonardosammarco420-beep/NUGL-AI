import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'sonner';
import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import StrainFinderPage from './pages/StrainFinderPage';
import SeedFinderPage from './pages/SeedFinderPage';
import NFTMarketplacePage from './pages/NFTMarketplacePage';
import ChatbotPage from './pages/ChatbotPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import ShoppingPage from './pages/ShoppingPage';
import PortfolioPage from './pages/PortfolioPage';
import SubscriptionPage from './pages/SubscriptionPage';
import EarningsPage from './pages/EarningsPage';
import InvestorRelationsPage from './pages/InvestorRelationsPage';
import CryptoPage from './pages/CryptoPage';
import MediaPage from './pages/MediaPage';
import AffiliateDashboardPage from './pages/AffiliateDashboardPage';
import AIHubPage from './pages/AIHubPage';
import SocialHubPage from './pages/SocialHubPage';
import PressRoomPage from './pages/PressRoomPage';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (e) {
      console.error('Failed to fetch user', e);
      logout();
    }
  };

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, API }}>
      <BrowserRouter>
        <div className="App">
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/strains" element={<StrainFinderPage />} />
            <Route path="/seeds" element={<SeedFinderPage />} />
            <Route path="/nft-marketplace" element={<NFTMarketplacePage />} />
            <Route path="/chat" element={<ChatbotPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/shop" element={<ShoppingPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/crypto" element={<CryptoPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/earnings" element={<EarningsPage />} />
            <Route path="/investors" element={<InvestorRelationsPage />} />
            <Route path="/media/:category" element={<MediaPage />} />
            <Route path="/social" element={<SocialHubPage />} />
            <Route path="/press-room" element={<PressRoomPage />} />
            <Route path="/affiliate" element={<AffiliateDashboardPage />} />
            <Route path="/ai-hub" element={<AIHubPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
