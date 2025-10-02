// Timezone utility for South African Time (CAT - UTC+2)

export const formatToCAT = (dateString, options = {}) => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  
  // Create options for South African timezone
  const catOptions = {
    timeZone: 'Africa/Johannesburg', // CAT timezone
    ...options
  };
  
  return date.toLocaleString('en-ZA', catOptions);
};

export const formatDateToCAT = (dateString) => {
  return formatToCAT(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTimeToCAT = (dateString) => {
  return formatToCAT(dateString, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatDateTimeToCAT = (dateString) => {
  return formatToCAT(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const getRelativeTimeCAT = (dateString) => {
  if (!dateString) return 'Unknown';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  
  // For older dates, show the actual date in CAT
  return formatDateToCAT(dateString);
};

export default {
  formatToCAT,
  formatDateToCAT,
  formatTimeToCAT,
  formatDateTimeToCAT,
  getRelativeTimeCAT
};