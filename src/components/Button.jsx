import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const variants = {
    primary: 'bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border-neon-blue/50 neon-glow',
    secondary: 'bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple border-neon-purple/50',
    success: 'bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border-neon-green/50',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/50',
    ghost: 'bg-white/5 hover:bg-white/10 text-white border-white/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 rounded-lg border transition-all font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </motion.button>
  );
};

export default Button;
