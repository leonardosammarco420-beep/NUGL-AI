# Affiliate Monetization Setup Guide

## ✅ What's Already Working

1. **Click Tracking**: Every news article click is tracked with partner info
2. **Dashboard**: Real-time affiliate stats at `/affiliate`
3. **Backend Endpoint**: `POST /api/affiliate/track-click` records all clicks
4. **Data Collection**: Tracks partner, article, timestamp, conversions, revenue

## 🎯 How It Works Now

When a user clicks a news article:
1. Frontend calls `trackAffiliateClick()` 
2. Sends: partner_name, article_id, source_page to backend
3. Backend stores click in `affiliate_clicks` collection
4. Dashboard updates with real-time stats

## 💰 Setting Up Real Affiliate Programs

### Step 1: Sign up for affiliate programs

**Cannabis/Seeds (High Commission):**
- **ILGM** - https://ilgm.com/affiliate - 20% commission
- **Seedsman** - https://www.seedsman.com/en/affiliate-program - 15% commission
- **Leafly** - https://www.leafly.com/partners - 10% commission

**Crypto News (Traffic-based):**
- **CoinTelegraph** - Contact for partnership
- **CoinDesk** - Media partnership program

**Jamaica News:**
- Contact directly for partnership opportunities

### Step 2: Update affiliate_mapping.py with REAL links

Replace placeholder links in `/app/backend/affiliate_mapping.py`:

```python
'ILGM': {
    'partner_id': 'ilgm',
    'affiliate_url': 'https://ilgm.com/?ref=YOUR_AFFILIATE_ID',  # Replace with real ID
    'commission_rate': 0.20,
    'category': 'seeds'
},
```

### Step 3: Add conversion tracking pixels

Most affiliate programs provide a pixel/webhook for tracking conversions.

Add to each partner in `affiliate_mapping.py`:
```python
'conversion_pixel': 'https://partner.com/track?id=YOUR_ID'
```

### Step 4: Update backend to call conversion webhooks

Modify `/app/backend/server.py` to ping conversion webhooks when tracking clicks.

## 📊 Revenue Model

**Current Setup:**
- Click tracking: ✅ Working
- Partner attribution: ✅ Working
- Dashboard: ✅ Working

**Revenue Sources:**
1. **CPC (Cost Per Click)**: $0.05-$0.20 per click
2. **CPA (Cost Per Action)**: $5-$50 per signup/purchase
3. **Commission**: 10-20% of sale value

**Estimated Revenue (100K monthly visitors):**
- 10% click-through rate = 10,000 clicks
- 5% conversion rate = 500 conversions
- Average commission $10 = **$5,000/month**

## 🔗 Quick Start for Testing

1. Click any news article on `/news` page
2. Check browser console: "Affiliate click tracked: [Partner Name]"
3. View dashboard at `/affiliate` - should show the click
4. Data stored in MongoDB: `affiliate_clicks` collection

## 🚀 Next Steps for Production

1. **Replace demo data** with real affiliate IDs
2. **Set up conversion tracking** via partner webhooks
3. **Add UTM parameters** for better attribution
4. **Implement cookie tracking** for multi-session attribution
5. **Create payout reports** for each partner

## 💡 Pro Tips

- Jamaica news = untapped market for affiliate revenue
- Cannabis products = highest commission rates (15-20%)
- Focus on quality partners with good conversion rates
- Track which news categories drive most revenue
- A/B test different call-to-action placements
