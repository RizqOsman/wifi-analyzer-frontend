const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div
        className={`animate-spin rounded-full border-b-2 border-neon-blue ${sizes[size]}`}
      />
      {text && <p className="mt-4 text-gray-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
