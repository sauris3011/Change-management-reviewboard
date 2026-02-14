// Risk band color coding based on FRONTEND_SPEC.md
export const getRiskBand = (score) => {
  if (score <= 30) return 'Low';
  if (score <= 55) return 'Medium';
  if (score <= 75) return 'High';
  return 'Critical';
};

export const getRiskColor = (score) => {
  if (score <= 30) return '#10B981'; // Green
  if (score <= 55) return '#F59E0B'; // Yellow
  if (score <= 75) return '#F97316'; // Orange
  return '#EF4444'; // Red
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
    Testing: '#3B82F6',
    Planning: '#8B5CF6',
    Scheduling: '#EC4899',
    Rollback: '#F59E0B',
    Monitoring: '#10B981',
  };
  return colors[category] || '#6B7280';
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
