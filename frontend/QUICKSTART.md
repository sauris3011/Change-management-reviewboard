# Quick Start Guide

## Install and Run (2 Minutes)

### Step 1: Install Dependencies
```bash
cd /mnt/c/Users/Sauris/Projects/change-management-reviewboard/frontend
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

The application will be available at **http://localhost:3000**

That's it! The frontend is now running with mock data.

## First-Time Walkthrough

### 1. Submit a Change (5 minutes)
1. You'll land on the **Change Submission** page automatically
2. Fill out the form:
   - **Short Description**: "Deploy Payment Service v2.0"
   - **Long Description**: "Deploying new payment processing service with improved security"
   - **Change Type**: Select "Normal"
   - **Category**: Select "Deployment"
   - **Impacted Services**: Type "svc-payment-api" and click + button
   - **AWS Components**: Type "ECS" and click + button
   - **Implementation Steps**: Fill in at least one step
   - **Rollback Plan**: "Revert to previous ECS task definition, estimated 5 minutes"
3. Click **"Evaluate Risk"**
4. Watch the progress indicator (simulated 12 seconds)
5. You'll be redirected to the Risk Assessment page

### 2. Review Risk Assessment (3 minutes)
- See the **Risk Score** card with color coding
- Explore the **5 tabs**:
  - **Overview**: Charts and metrics
  - **Risk Drivers**: Why it's risky (with historical examples)
  - **Recommendations**: Actions to reduce risk
  - **Similar Changes**: Historical data
  - **Audit Trail**: Technical details
- Try the **Export** button (downloads JSON)
- Click **"Submit to CAB"** button

### 3. CAB Dashboard (2 minutes)
- Click **"CAB Dashboard"** in navigation
- See statistics cards at the top
- View the table of pending changes
- Filter by **Risk Band** (try "High")
- Search for changes
- Click any row to view its assessment
- Use the action buttons (View, Approve, Reject)

### 4. History Browser (2 minutes)
- Click **"History"** in navigation
- See all historical changes
- Filter by **Status** (try "Completed")
- Filter by **Risk Band**
- Try the search box
- Click **"Export to CSV"** button
- Click any row to view details

## Features You Can Test

### Change Submission Form
- ✅ Dynamic implementation steps (add/remove)
- ✅ Chip-based service/AWS component input
- ✅ Form validation
- ✅ Progress indicator with messages
- ✅ Automatic navigation to results

### Risk Assessment
- ✅ Color-coded risk scores (Green/Yellow/Orange/Red)
- ✅ Interactive probability charts
- ✅ Tabbed interface with rich content
- ✅ Risk drivers with evidence
- ✅ Actionable recommendations
- ✅ Historical similar changes
- ✅ Export functionality

### CAB Dashboard
- ✅ Real-time statistics
- ✅ Risk band filtering
- ✅ Search functionality
- ✅ Color-coded table rows
- ✅ Quick actions
- ✅ Responsive layout

### History
- ✅ Comprehensive filtering
- ✅ CSV export
- ✅ Date sorting
- ✅ Status indicators

## Mock Data vs Real Backend

The application currently uses **mock data** when the backend is unavailable. This lets you explore all features immediately.

### What Works with Mock Data:
- ✅ All UI interactions
- ✅ Navigation between pages
- ✅ Filtering and searching
- ✅ Export functionality
- ✅ Charts and visualizations

### To Connect to Real Backend:
1. Start your backend server on port 3001
2. The frontend will automatically try to connect
3. If connection fails, it falls back to mock data gracefully

## Sample Data Included

The mock data includes:
- **8 change records** with varying risk scores
- **Multiple statuses** (Pending, Approved, Rejected, Completed)
- **Different risk bands** (Low, Medium, High, Critical)
- **Sample risk drivers and recommendations**
- **Historical change examples**

## Tips for Exploring

1. **Try Different Risk Scenarios**: The mock change CHG0012343 has a high risk score (82.1) - great for testing
2. **Use Filters**: Combine risk band and search filters to test the filtering logic
3. **Export Features**: Try CSV export from History and JSON export from Assessment
4. **Responsive Design**: Resize your browser to see responsive layout
5. **Navigation Flow**: Submit Change → Assessment → CAB → History

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill the process using port 3000
npx kill-port 3000

# Or specify a different port
npm run dev -- --port 3001
```

### Dependencies Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Cannot Find Module Errors
Make sure you're in the frontend directory:
```bash
cd /mnt/c/Users/Sauris/Projects/change-management-reviewboard/frontend
```

## Next Steps

1. **Customize the theme**: Edit `src/App.jsx` to change colors
2. **Add real API**: Update `src/api/client.js` with your backend URL
3. **Extend mock data**: Add more scenarios in each page component
4. **Add features**: Build on the solid foundation provided

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Questions?

Check the main README.md for:
- Complete feature list
- API integration details
- Project structure
- Design principles
- Future enhancements
