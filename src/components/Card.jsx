import { motion } from 'framer-motion';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`glass-effect rounded-xl p-6 border border-white/5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
