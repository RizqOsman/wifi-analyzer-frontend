const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-dark-700 border-t-cyan-400 ${sizeClasses[size]} ${className}`} />
  );
};

export default LoadingSpinner;
