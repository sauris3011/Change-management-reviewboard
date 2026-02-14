# Getting Started with Change Management System Frontend

## 🚀 Quick Start (2 Minutes)

### Step 1: Navigate to Frontend Directory
```bash
cd /mnt/c/Users/Sauris/Projects/change-management-reviewboard/frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- React 18.2.0
- Material-UI 5.15.10
- React Router 6.22.0
- Recharts 2.12.0
- Axios 1.6.7
- And all other dependencies

### Step 3: Start Development Server
```bash
npm run dev
```

You'll see:
```
  VITE v5.1.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Step 4: Open in Browser
Navigate to: **http://localhost:3000**

That's it! The application is now running.

---

## 📁 What You Got

### Complete Project Structure
```
frontend/
├── src/
│   ├── api/
│   │   └── client.js              ✅ Axios API client
│   ├── components/
│   │   ├── Navbar.jsx             ✅ Main navigation
│   │   ├── RiskScoreCard.jsx      ✅ Risk visualization
│   │   ├── RiskDriverCard.jsx     ✅ Driver display
│   │   └── RecommendationCard.jsx ✅ Recommendations
│   ├── pages/
│   │   ├── ChangeSubmission.jsx   ✅ Submit form
│   │   ├── RiskAssessment.jsx     ✅ 5-tab dashboard
│   │   ├── CABDashboard.jsx       ✅ CAB review
│   │   └── History.jsx            ✅ Change history
│   ├── utils/
│   │   └── riskColors.js          ✅ Color utilities
│   ├── App.jsx                    ✅ Main app + routing
│   └── main.jsx                   ✅ Entry point
├── package.json                   ✅ Dependencies
├── vite.config.js                 ✅ Vite config
├── index.html                     ✅ HTML template
├── .gitignore                     ✅ Git ignore
├── .env.example                   ✅ Environment template
├── .eslintrc.cjs                  ✅ ESLint config
├── README.md                      ✅ Full documentation
├── QUICKSTART.md                  ✅ Quick guide
└── FEATURES.md                    ✅ Feature showcase
```

---

## 🎯 First Steps After Launch

### 1. Explore the Change Submission Form
1. You'll land on the **Submit Change** page
2. Fill out a test change:
   ```
   Short Description: Deploy Payment Service v2.0
   Long Description: Deploying new payment service with security improvements
   Change Type: Normal
   Category: Deployment
   Impacted Services: svc-payment-api (click +)
   AWS Components: ECS (click +)
   Implementation Steps: Add at least one step
   Rollback Plan: Revert to previous task definition
   ```
3. Click **"Evaluate Risk"**
4. Watch the progress bar (12 seconds simulation)
5. You'll be redirected to the Risk Assessment page

### 2. Review the Risk Assessment
- See the **large risk score** with color coding
- Explore all **5 tabs**:
  - **Overview**: Charts and metrics
  - **Risk Drivers**: Why it's risky
  - **Recommendations**: What to do
  - **Similar Changes**: Historical data
  - **Audit Trail**: Technical details
- Click **"Export"** to download JSON
- Click **"Share"** to copy link

### 3. Check the CAB Dashboard
- Click **"CAB Dashboard"** in navigation
- See **4 statistics cards** at the top
- View the **table of changes**
- Try **filtering by risk band**
- Use the **search box**
- Click **action buttons** (View, Approve, Reject)

### 4. Browse History
- Click **"History"** in navigation
- See **all historical changes**
- Filter by **Risk Band** and **Status**
- Try the **search function**
- Click **"Export to CSV"**
- Open CSV in Excel/Google Sheets

---

## 🎨 Key Features to Test

### Dynamic Form Fields
- ✅ **Add/Remove Steps**: Click "+ Add Step" in implementation section
- ✅ **Chip Inputs**: Add multiple services and AWS components
- ✅ **Form Validation**: Try submitting empty form
- ✅ **Date Picker**: Select implementation window

### Risk Visualization
- ✅ **Color Coding**: Different colors for Low/Medium/High/Critical
- ✅ **Progress Bars**: Visual probability representation
- ✅ **Pie Charts**: Outcome distribution
- ✅ **Bar Charts**: Risk metrics

### Filtering & Search
- ✅ **Risk Filter**: Filter by Low/Medium/High/Critical
- ✅ **Status Filter**: Filter by Pending/Approved/Rejected/Completed
- ✅ **Text Search**: Search by ID, description, submitter
- ✅ **Combined Filters**: Multiple filters work together

### Export Functions
- ✅ **CSV Export**: From History page
- ✅ **JSON Export**: From Assessment page
- ✅ **Copy Link**: Share assessment URL

---

## 🔧 Configuration

### Backend API (Optional)
The app works with mock data by default. To connect to a real backend:

1. Create `.env` file:
```bash
cp .env.example .env
```

2. Edit `.env`:
```
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

3. Restart dev server:
```bash
npm run dev
```

### Port Configuration
Default port is 3000. To change:
```bash
npm run dev -- --port 3001
```

---

## 📊 Mock Data Included

The application includes realistic mock data:

### Sample Changes
- **8 change records** with varying risk scores
- **Risk range**: 15.2 (Low) to 82.1 (Critical)
- **Multiple submitters**: John Doe, Jane Smith, Bob Wilson, etc.
- **Different statuses**: Pending, Approved, Rejected, Completed
- **Timestamps**: From 2 hours ago to 6 days ago

### Sample Risk Assessments
- **Probability distributions**: Success, failure, rollback, incident
- **Risk drivers**: With evidence and historical references
- **Recommendations**: Categorized (Testing, Planning, Scheduling, etc.)
- **Similar changes**: Historical comparison data
- **Audit trails**: Model version, performance metrics

---

## 🛠️ Development Commands

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```
Output: `dist/` directory

### Preview Production Build
```bash
npm run preview
```

### Run Linter
```bash
npm run lint
```

### Format Code (if you add prettier)
```bash
npx prettier --write src/**/*.{js,jsx}
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- --port 3001
```

### Dependencies Won't Install
```bash
# Clear npm cache
npm cache clean --force

# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Cannot Find Module Errors
```bash
# Make sure you're in the right directory
cd /mnt/c/Users/Sauris/Projects/change-management-reviewboard/frontend

# Reinstall dependencies
npm install
```

### Vite/ESM Errors
```bash
# Delete .vite cache
rm -rf node_modules/.vite

# Restart
npm run dev
```

### Windows-Specific Issues
If you encounter line ending issues:
```bash
git config core.autocrlf false
```

---

## 📚 Documentation

### For Quick Reference
- **QUICKSTART.md**: 2-minute setup guide
- **FEATURES.md**: Visual feature showcase
- **README.md**: Complete project documentation

### For Development
- **Code comments**: Inline explanations
- **Component structure**: Self-documenting
- **API client**: Well-organized endpoints

---

## 🎓 Learning Resources

### React
- [React Docs](https://react.dev)
- [React Router](https://reactrouter.com)

### Material-UI
- [MUI Docs](https://mui.com)
- [Component Demo](https://mui.com/material-ui/getting-started/)

### Vite
- [Vite Guide](https://vitejs.dev/guide/)

### Recharts
- [Recharts Examples](https://recharts.org/en-US/examples)

---

## 🔒 Best Practices

### Code Quality
- ✅ ESLint configured
- ✅ React best practices
- ✅ Functional components
- ✅ Custom hooks ready
- ✅ Clean component structure

### Performance
- ✅ Lazy loading ready
- ✅ Optimized bundle
- ✅ Fast HMR
- ✅ Efficient re-renders

### Accessibility
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ High contrast

---

## 🚀 Next Steps

### For Development
1. **Connect backend**: Update API URL in `.env`
2. **Add authentication**: Implement login flow
3. **Add file upload**: For test evidence
4. **Add WebSocket**: For real-time updates
5. **Add dark mode**: Toggle theme

### For Production
1. **Build**: `npm run build`
2. **Test build**: `npm run preview`
3. **Deploy**: To Vercel, Netlify, or AWS
4. **Configure CDN**: For static assets
5. **Set up monitoring**: Error tracking

### For Enhancement
1. **Add tests**: Jest + React Testing Library
2. **Add Storybook**: Component documentation
3. **Add TypeScript**: Type safety
4. **Add i18n**: Internationalization
5. **Add analytics**: User behavior tracking

---

## 🎉 Success Checklist

You should now be able to:

- ✅ Run the app locally
- ✅ Submit a test change
- ✅ View risk assessment
- ✅ Browse CAB dashboard
- ✅ Check change history
- ✅ Filter and search
- ✅ Export data
- ✅ Navigate between pages
- ✅ See responsive design

---

## 💡 Pro Tips

1. **Use React DevTools**: Install browser extension for debugging
2. **Check Network Tab**: Monitor API calls
3. **Use Console**: Logs show API requests/responses
4. **Try Mobile View**: Use browser's responsive mode
5. **Test Dark Mode**: If your browser has dark mode

---

## 📧 Support

If you encounter issues:

1. **Check documentation**: README.md, QUICKSTART.md, FEATURES.md
2. **Check console**: Look for error messages
3. **Check network**: Verify API calls
4. **Clear cache**: `rm -rf node_modules/.vite`
5. **Reinstall**: `npm install`

---

## 🎯 Summary

You now have:
- ✅ **Fully functional** frontend application
- ✅ **Beautiful UI** with Material Design
- ✅ **Complete workflows** for all users
- ✅ **Mock data** for immediate testing
- ✅ **API integration** ready
- ✅ **Production ready** build system
- ✅ **Comprehensive documentation**

**Start now:**
```bash
cd /mnt/c/Users/Sauris/Projects/change-management-reviewboard/frontend
npm install && npm run dev
```

**Open:** http://localhost:3000

Enjoy building with your Change Management System! 🚀
