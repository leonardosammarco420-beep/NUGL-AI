# How to Update Quarterly Financial Data

## 📊 Current Implementation

The Investor Relations page now displays quarterly revenue data dynamically from the backend API.

### Current Data Displayed:
- **Q2 2025** (Latest): $866K revenue, +15.3% growth, 2,156 transactions
- **Q1 2025**: $751K revenue, -19.8% growth, 1,880 transactions  
- **Q4 2024**: $936K revenue, +28.9% growth, 2,340 transactions
- **Q3 2024**: $726K revenue, +2.5% growth, 1,420 transactions
- **Q2 2024**: $708K revenue, 1,250 transactions
- **TTM (Trailing 12 Months)**: $3,279K (+34.2% YoY), 7,796 transactions

---

## 🔄 How to Update Quarterly Data

### **Method 1: Update Backend Code (Current)**

Edit the file: `/app/backend/server.py`

Find the endpoint around line 490:

```python
@api_router.get("/investor/quarterly-data")
async def get_quarterly_data():
    """Get quarterly financial data for investor relations"""
    quarterly_data = [
        {
            "quarter": "Q2 2024",
            "date": "06/30/2024",
            "revenue": 708,
            "growth": "-",
            "transactions": 1250
        },
        # ... add new quarter here
    ]
    return {"quarterly_data": quarterly_data}
```

**To add Q3 2025 data (example):**

```python
{
    "quarter": "Q3 2025",
    "date": "09/30/2025",
    "revenue": 920,  # Your actual revenue in thousands
    "growth": "+6.2%",  # Calculate: ((920-866)/866)*100
    "transactions": 2450
}
```

Then restart the backend:
```bash
sudo supervisorctl restart backend
```

---

### **Method 2: Database-Driven (Recommended for Production)**

**Step 1:** Create a MongoDB collection for quarterly data

```javascript
// MongoDB collection: financial_quarters
{
  "_id": ObjectId("..."),
  "quarter": "Q3 2025",
  "date": "09/30/2025",
  "revenue": 920,
  "growth": "+6.2%",
  "transactions": 2450,
  "created_at": ISODate("2025-09-30T00:00:00Z"),
  "updated_at": ISODate("2025-09-30T00:00:00Z")
}
```

**Step 2:** Update the backend endpoint to fetch from database

```python
@api_router.get("/investor/quarterly-data")
async def get_quarterly_data():
    """Get quarterly financial data from database"""
    quarters = await db.financial_quarters.find({}, {"_id": 0}).sort("date", -1).limit(8).to_list(8)
    quarters.reverse()  # Show oldest to newest
    return {"quarterly_data": quarters}
```

**Step 3:** Create an admin endpoint to add new quarters

```python
class QuarterlyFinancialData(BaseModel):
    quarter: str
    date: str
    revenue: int
    growth: str
    transactions: int

@api_router.post("/admin/quarterly-data")
async def add_quarterly_data(data: QuarterlyFinancialData, user_id: str = Depends(get_current_user)):
    # Add admin role check
    quarter_dict = data.model_dump()
    quarter_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    await db.financial_quarters.insert_one(quarter_dict)
    return {"message": "Quarterly data added successfully"}
```

---

## 📝 Growth Calculation Formula

```
QoQ Growth % = ((Current Quarter Revenue - Previous Quarter Revenue) / Previous Quarter Revenue) × 100
```

**Example:**
- Q2 2025: $866K
- Q3 2025: $920K
- Growth = ((920 - 866) / 866) × 100 = +6.24%

---

## 🎯 What Updates Automatically

When you add new quarterly data:

1. ✅ **Quarterly Performance Table** - Shows all quarters
2. ✅ **Revenue Chart** - Updates with new data point
3. ✅ **TTM (Trailing 12 Months)** - Auto-calculates from last 4 quarters
4. ✅ **Key Metrics Card** - Shows latest quarter revenue
5. ✅ **Annual Revenue** - Updates based on TTM
6. ✅ **"Latest" Badge** - Automatically shows on newest quarter

---

## 📅 Update Schedule

**When to Update:**
- After each fiscal quarter closes
- Financial data is finalized (usually 2-4 weeks after quarter end)

**Recommended Timing:**
- Q1 (Jan-Mar): Update by mid-April
- Q2 (Apr-Jun): Update by mid-July
- Q3 (Jul-Sep): Update by mid-October  
- Q4 (Oct-Dec): Update by mid-January

---

## 🔍 Data Validation Checklist

Before publishing new quarterly data:

- [ ] Revenue figure is in thousands (K)
- [ ] Quarter format is correct (e.g., "Q3 2025")
- [ ] Date format is MM/DD/YYYY
- [ ] Growth percentage is calculated correctly
- [ ] Transactions count is accurate
- [ ] Data is reviewed by finance team
- [ ] Previous quarter data is still accurate

---

## 🚀 Quick Update Example

**Scenario:** It's October 2025, Q3 results are in.

**Step 1:** Edit `/app/backend/server.py` line ~490

**Step 2:** Add the new quarter at the end of the array:

```python
{
    "quarter": "Q3 2025",
    "date": "09/30/2025",
    "revenue": 920,
    "growth": "+6.2%",
    "transactions": 2450
}
```

**Step 3:** Restart backend:
```bash
sudo supervisorctl restart backend
```

**Step 4:** Verify on website:
- Go to /investors
- Click "Financials" tab
- Scroll to "Quarterly Performance Overview"
- Confirm Q3 2025 shows as "Latest"

---

## 📊 Frontend Display

The data automatically displays as:
- **Table**: Newest quarter first (with "Latest" badge)
- **Chart**: Shows trend line with all quarters
- **Metrics**: Top card shows most recent quarter
- **TTM**: Calculates last 4 quarters automatically

---

## 💡 Pro Tips

1. **Keep Historical Data**: Don't delete old quarters, just add new ones
2. **Consistent Format**: Always use same date format (MM/DD/YYYY)
3. **Revenue in Thousands**: $866K not $866,000
4. **Test First**: Update on staging before production
5. **Backup Data**: Keep financial records in multiple places

---

## 🎨 Customization Options

Want to show more data? Edit the frontend:

`/app/frontend/src/pages/InvestorRelationsPage.js`

**Add columns:**
```javascript
<th className="pb-3 text-gray-400 font-semibold text-sm text-right">Gross Profit</th>
// Then in the row:
<td className="py-4 text-right text-gray-300">${quarter.gross_profit}K</td>
```

**Change table styling:**
```javascript
className="border-b border-slate-700/50 hover:bg-slate-700/30"
```

---

## 📞 Need Help?

If you need to update the data but don't have development access:
1. Prepare your quarterly data in the format above
2. Send to your developer
3. They can update in 5 minutes

**Data Required:**
- Quarter (e.g., "Q3 2025")
- Period End Date (e.g., "09/30/2025")
- Total Revenue ($K)
- QoQ Growth %
- Number of Transactions
