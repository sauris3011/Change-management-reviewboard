import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';
import Navbar from './components/Navbar';
import ChangeSubmission from './pages/ChangeSubmission';
import RiskAssessment from './pages/RiskAssessment';
import CABDashboard from './pages/CABDashboard';
import History from './pages/History';
import BulkUpload from './pages/BulkUpload';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<ChangeSubmission />} />
            <Route path="/bulk-upload" element={<BulkUpload />} />
            <Route path="/assessment/:id" element={<RiskAssessment />} />
            <Route path="/cab" element={<CABDashboard />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
