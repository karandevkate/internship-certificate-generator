export const formatDate = (d: string, format: 'dot' | 'full' = 'dot') => {
  if (!d) return '[Date]';
  const date = new Date(d);
  if (format === 'dot') {
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '.');
  }
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
};

export const calculateDuration = (start: string, end: string) => {
  if (!start || !end) return '';
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  const weeks = Math.ceil(diffDays / 7);
  const months = Math.ceil(diffDays / 30);
  
  return `${weeks} Weeks / ${months} Month${months > 1 ? 's' : ''}`;
};
