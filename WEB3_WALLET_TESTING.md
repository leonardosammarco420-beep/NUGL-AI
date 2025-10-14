# Web3 Wallet Testing Guide for Nugl.com

## 🦊 MetaMask Connection Testing

### Prerequisites
1. Install MetaMask browser extension:
   - Chrome: https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/
   - Edge: Available in Microsoft Edge Add-ons

2. Set up MetaMask wallet (if not already done)
   - Create new wallet or import existing one
   - Switch to any test network (e.g., Sepolia, Goerli) for testing
   - Or use Ethereum Mainnet with your actual wallet

### Testing Steps

#### 1. Navigate to Wallet Page
```
URL: https://website-completion.preview.emergentagent.com/wallet
```

#### 2. Connect Wallet
- Click the **"Connect MetaMask"** button (orange button)
- MetaMask popup will appear asking for permission
- Click **"Next"** then **"Connect"** in MetaMask

#### 3. Verify Connection
After successful connection, you should see:
- ✅ Your wallet address (truncated format: 0x1234...5678)
- ✅ Your ETH balance
- ✅ Green "Connected" status with checkmark
- ✅ "Disconnect" button

#### 4. Test Features

**Copy Address:**
- Click the copy icon next to your wallet address
- Should see "Address copied!" toast notification

**Check Balance:**
- Your actual ETH balance should display
- Format: X.XXXX ETH

**Disconnect Wallet:**
- Click "Disconnect" button
- Should return to connection screen
- MetaMask remains in browser but disconnected from site

### Expected Console Logs

When connected successfully, you should see in browser console:
```
MetaMask available: true
Wallet connected: 0x...
Balance: X.XXXX ETH
```

### Common Issues & Solutions

**Issue 1: "MetaMask is not installed"**
- Solution: Install MetaMask extension and refresh page

**Issue 2: Connection request not appearing**
- Solution: Click MetaMask icon in browser toolbar
- Make sure MetaMask is unlocked
- Refresh page and try again

**Issue 3: Balance showing 0.0000 ETH**
- This is normal if testing with empty wallet
- Add test ETH from faucet (for test networks)

**Issue 4: "Failed to connect wallet" error**
- Check if MetaMask is unlocked
- Try disconnecting any other dApps
- Clear browser cache and try again

## 🔗 WalletConnect Testing

### Note: WalletConnect Implementation
The WalletConnect button is currently a placeholder. To fully test:

1. Need to set up WalletConnect Cloud project at: https://cloud.walletconnect.com/
2. Get Project ID
3. Configure in the WalletPage.js component
4. Then can connect using mobile wallets (Trust Wallet, Rainbow, etc.)

## 🧪 Advanced Testing Scenarios

### Test Transaction Signing (Future)
Once backend transaction endpoints are ready:
1. Click "Send Crypto" button
2. Enter recipient address and amount
3. Sign transaction in MetaMask
4. Verify transaction on blockchain

### Test Network Switching
1. Open MetaMask
2. Switch networks (Mainnet ↔ Testnet)
3. Wallet page should update balance automatically

### Test Multiple Accounts
1. Switch accounts in MetaMask
2. Disconnect and reconnect
3. Verify new account address and balance display

## 📱 Mobile Testing

### For Mobile Browsers with MetaMask Mobile:
1. Open https://website-completion.preview.emergentagent.com/wallet in MetaMask mobile browser
2. Tap "Connect MetaMask"
3. Approve connection
4. Test same features as desktop

## ✅ Verification Checklist

Use this checklist to verify all wallet features:

- [ ] MetaMask detection works
- [ ] Connect button triggers MetaMask popup
- [ ] Wallet address displays correctly after connection
- [ ] ETH balance shows actual amount
- [ ] Copy address button works
- [ ] Toast notifications appear
- [ ] Disconnect button works
- [ ] Page remembers connection on refresh
- [ ] Multiple connects/disconnects work smoothly
- [ ] No console errors during connection flow

## 🔧 Developer Testing

### Check Network Info
Add this to browser console after connecting:
```javascript
window.ethereum.request({ method: 'eth_chainId' }).then(chainId => {
  console.log('Connected to chain:', chainId);
});
```

### Check Accounts
```javascript
window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
  console.log('Connected accounts:', accounts);
});
```

### Listen for Account Changes
```javascript
window.ethereum.on('accountsChanged', (accounts) => {
  console.log('Account changed to:', accounts[0]);
});
```

### Listen for Network Changes
```javascript
window.ethereum.on('chainChanged', (chainId) => {
  console.log('Network changed to:', chainId);
});
```

## 📊 Testing Results Template

**Date**: ___________
**Browser**: ___________
**MetaMask Version**: ___________

| Test Case | Status | Notes |
|-----------|--------|-------|
| MetaMask Detection | ⬜ Pass / ⬜ Fail | |
| Connection Flow | ⬜ Pass / ⬜ Fail | |
| Address Display | ⬜ Pass / ⬜ Fail | |
| Balance Display | ⬜ Pass / ⬜ Fail | |
| Copy Address | ⬜ Pass / ⬜ Fail | |
| Disconnect | ⬜ Pass / ⬜ Fail | |
| Error Handling | ⬜ Pass / ⬜ Fail | |

## 🎯 Production Considerations

Before going live with wallet features:

1. **Security Audit**
   - Review all wallet interaction code
   - Ensure no private keys are logged
   - Validate all user inputs

2. **Error Handling**
   - Handle all MetaMask rejection cases
   - Provide clear error messages
   - Implement retry mechanisms

3. **User Experience**
   - Add loading states during connection
   - Show transaction pending states
   - Implement proper disconnect cleanup

4. **Network Support**
   - Decide which networks to support
   - Add network switching UI
   - Handle wrong network scenarios

## 📞 Support

If you encounter issues during testing:
1. Check browser console for errors
2. Verify MetaMask is latest version
3. Try in incognito/private mode
4. Clear browser cache and cookies
5. Test with different wallet addresses

---

**Ready to Test!** 🚀
Start with the basic connection flow and work through the checklist above.
