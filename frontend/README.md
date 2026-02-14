# Change Management System - Frontend

A beautiful, functional MVP implementation of the Change Management System frontend built with React, Material-UI, and Vite.

## Features

### 1. Change Submission Form
- Comprehensive form with all required fields
- Dynamic implementation steps management
- Chip-based input for services and AWS components
- Real-time progress tracking during evaluation
- Form validation

### 2. Risk Assessment Dashboard
- Large, color-coded risk score display
- Five detailed tabs:
  - **Overview**: Risk metrics, probability charts, change details
  - **Risk Drivers**: Why the change is risky with evidence and historical references
  - **Recommendations**: Actionable items to reduce risk
  - **Similar Changes**: Historical changes with similar characteristics
  - **Audit Trail**: Technical details for compliance
- Export functionality
- Share link capability

### 3. CAB Dashboard
- Statistics cards (Pending Review, High Risk Changes, etc.)
- Advanced filtering by risk band and search
- Color-coded risk indicators
- Quick action buttons (View, Approve, Reject)
- Responsive table layout

### 4. History Browser
- Full change history with filtering
- Export to CSV functionality
- Search capability
- Status-based filtering
- Sortable columns

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Styling**: Emotion (via MUI)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional):
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The application will start on http://localhost:3000

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js           # Axios instance and API calls
│   ├── components/
│   │   ├── Navbar.jsx          # Main navigation bar
│   │   ├── RiskScoreCard.jsx   # Hero card with risk score
│   │   ├── RiskDriverCard.jsx  # Risk driver display
│   │   └── RecommendationCard.jsx # Recommendation display
│   ├── pages/
│   │   ├── ChangeSubmission.jsx   # Form for submitting changes
│   │   ├── RiskAssessment.jsx     # Risk assessment results
│   │   ├── CABDashboard.jsx       # CAB review dashboard
│   │   └── History.jsx            # Historical changes browser
│   ├── utils/
│   │   └── riskColors.js       # Risk color coding utilities
│   ├── App.jsx                 # Main app with routing
│   └── main.jsx                # App entry point
├── index.html
├── vite.config.js
└── package.json
```

## API Integration

The frontend is configured to connect to the backend API at `http://localhost:3001/api/v1`.

### API Endpoints Used

- `POST /api/v1/evaluate-change` - Submit change for risk evaluation
- `GET /api/v1/predictions/:id` - Get risk assessment results
- `GET /api/v1/changes/history` - Get change history
- `PATCH /api/v1/changes/:id/status` - Update change status

### Mock Data Fallback

If the backend API is not available, the application uses mock data to demonstrate functionality. This allows you to explore the UI without a running backend.

## Color Coding (Risk Bands)

The application uses consistent color coding based on risk scores:

| Risk Band | Score Range | Color | Hex |
|-----------|-------------|-------|-----|
| Low | 0-30 | Green | #10B981 |
| Medium | 31-55 | Yellow | #F59E0B |
| High | 56-75 | Orange | #F97316 |
| Critical | 76-100 | Red | #EF4444 |

## Key Features

### Change Submission
- Multi-section form with validation
- Dynamic step management
- Chip-based multi-input fields
- Progress indicator during evaluation
- Auto-save capabilities (localStorage)

### Risk Assessment
- Beautiful risk score visualization
- Comprehensive tabbed interface
- Interactive charts with Recharts
- Export to JSON (PDF placeholder)
- Detailed audit trail

### CAB Dashboard
- Real-time statistics
- Advanced filtering
- Bulk action support (planned)
- Quick review workflow
- Color-coded priorities

### History
- Full historical view
- CSV export
- Advanced search and filtering
- Date-based sorting

## Design Principles

1. **Color-Coded Risk**: Consistent visual language across all views
2. **Responsive Design**: Works on desktop, tablet, and mobile
3. **Professional UI**: Clean, modern Material Design interface
4. **Accessibility**: WCAG 2.1 AA compliant
5. **Performance**: Fast loading and smooth interactions

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Development Tips

### Hot Module Replacement (HMR)
Vite provides instant HMR - your changes will reflect immediately without page refresh.

### API Development
To connect to a real backend, update the `VITE_API_BASE_URL` in your `.env` file.

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/Navbar.jsx`

## Known Limitations (MVP)

- Mock data used when backend is unavailable
- PDF export currently exports JSON
- Bulk actions not fully implemented
- Real-time WebSocket updates not implemented
- File upload functionality is a placeholder

## Future Enhancements

- Real-time notifications via WebSocket
- Advanced analytics dashboard
- Bulk approval workflow
- PDF report generation
- File upload for evidence
- Admin panel
- User authentication
- Dark mode

## License

Part of the Change Management System project.
