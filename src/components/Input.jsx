const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          className={`
            w-full px-4 py-2 rounded-lg glass-effect
            border border-white/10 focus:border-neon-blue/50
            bg-dark-800/50 text-white placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-neon-blue/20
            transition-all
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500/50' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;
