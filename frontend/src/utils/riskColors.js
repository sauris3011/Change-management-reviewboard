// Risk band color coding — MD3 aligned
export const getRiskBand = (score) => {
  if (score <= 30) return 'Low';
  if (score <= 55) return 'Medium';
  if (score <= 75) return 'High';
  return 'Critical';
};

export const getRiskColor = (score) => {
  if (score <= 30) return '#1B6B3A'; // Green (MD3 success)
  if (score <= 55) return '#7C5800'; // Amber (MD3 warning)
  if (score <= 75) return '#BA1A1A'; // Orange-red
  return '#B3261E'; // Red (MD3 error)
};

export const getRiskSurfaceColor = (score) => {
  if (score <= 30) return '#A7F5BA'; // Success container
  if (score <= 55) return '#FFDEA6'; // Warning container
  if (score <= 75) return '#FFDAD6'; // Error container light
  return '#F9DEDC'; // Error container
};

export const getRiskColorMUI = (score) => {
  if (score <= 30) return 'success';
  if (score <= 55) return 'warning';
  if (score <= 75) return 'error';
  return 'error';
};

export const getRiskIcon = (score) => {
  if (score <= 30) return '🟢';
  if (score <= 55) return '🟡';
  if (score <= 75) return '🟠';
  return '🔴';
};

export const formatRiskScore = (score) => {
  return typeof score === 'number' ? score.toFixed(1) : '0.0';
};

export const getCategoryColor = (category) => {
  const colors = {
    Testing: '#6750A4',
    Planning: '#625B71',
    Scheduling: '#7D5260',
    Rollback: '#7C5800',
    Monitoring: '#1B6B3A',
  };
  return colors[category] || '#49454F';
};

export const getCategoryContainerColor = (category) => {
  const colors = {
    Testing: '#EADDFF',
    Planning: '#E8DEF8',
    Scheduling: '#FFD8E4',
    Rollback: '#FFDEA6',
    Monitoring: '#A7F5BA',
  };
  return colors[category] || '#E7E0EC';
};

export const getCategoryIcon = (category) => {
  const icons = {
    Testing: '🔬',
    Planning: '📋',
    Scheduling: '⏰',
    Rollback: '↩️',
    Monitoring: '📊',
  };
  return icons[category] || '📌';
};
