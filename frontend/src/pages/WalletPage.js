import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Wallet as WalletIcon, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';

export default function WalletPage() {
  const { user } = useContext(AuthContext);
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState('0');
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    const ethereum = await detectEthereumProvider();
    if (ethereum) {
      const ethersProvider = new ethers.BrowserProvider(ethereum);
      const accounts = await ethersProvider.listAccounts();
      if (accounts.length > 0) {
        const signer = await ethersProvider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        setProvider(ethersProvider);
        setConnected(true);
        await fetchBalance(ethersProvider, address);
      }
    }
  };

  const connectMetaMask = async () => {
    try {
      const ethereum = await detectEthereumProvider();
      if (!ethereum) {
        toast.error('Please install MetaMask');
        return;
      }

      await ethereum.request({ method: 'eth_requestAccounts' });
      const ethersProvider = new ethers.BrowserProvider(ethereum);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      
      setWalletAddress(address);
      setProvider(ethersProvider);
      setConnected(true);
      await fetchBalance(ethersProvider, address);
      toast.success('Wallet connected!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to connect wallet');
    }
  };

  const fetchBalance = async (ethersProvider, address) => {
    try {
      const balanceWei = await ethersProvider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error('Failed to fetch balance', error);
    }
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success('Address copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setBalance('0');
    setConnected(false);
    setProvider(null);
    toast.info('Wallet disconnected');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8" data-testid="wallet-header">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Crypto Wallet
          </h1>
          <p className="text-gray-400">Manage your crypto assets with MetaMask and WalletConnect</p>
        </div>

        {!connected ? (
          <Card className="bg-slate-800/50 border-teal-500/20 p-12 text-center" data-testid="wallet-connect-card">
            <WalletIcon className="w-20 h-20 text-teal-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Connect your MetaMask or WalletConnect wallet to access NFT trading, transactions, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={connectMetaMask}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                data-testid="connect-metamask-button"
              >
                <WalletIcon className="w-5 h-5 mr-2" />
                Connect MetaMask
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                data-testid="connect-walletconnect-button"
              >
                <WalletIcon className="w-5 h-5 mr-2" />
                WalletConnect
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6" data-testid="wallet-connected">
            <Card className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/30 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Connected</p>
                    <p className="text-white font-semibold">MetaMask</p>
                  </div>
                </div>
                <Button onClick={disconnectWallet} variant="ghost" size="sm" className="text-red-400 hover:text-red-300" data-testid="disconnect-wallet-button">
                  Disconnect
                </Button>
              </div>

              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Wallet Address</p>
                <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-3">
                  <p className="text-white font-mono text-sm flex-1 truncate" data-testid="wallet-address">
                    {walletAddress}
                  </p>
                  <button onClick={copyAddress} className="text-teal-400 hover:text-teal-300" data-testid="copy-address-button">
                    {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Balance</p>
                <p className="text-4xl font-bold text-white" data-testid="wallet-balance">{balance} ETH</p>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline" data-testid="send-crypto-button">
                    Send Crypto
                  </Button>
                  <Button className="w-full" variant="outline" data-testid="receive-crypto-button">
                    Receive Crypto
                  </Button>
                  <Button className="w-full" variant="outline" data-testid="swap-tokens-button">
                    Swap Tokens
                  </Button>
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-teal-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <p className="text-gray-400 text-sm">No recent transactions</p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}