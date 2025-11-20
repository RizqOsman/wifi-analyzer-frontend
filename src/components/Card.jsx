import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, glow = false }) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      className={`glass-effect rounded-xl p-6 ${
        glow ? 'neon-glow' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
