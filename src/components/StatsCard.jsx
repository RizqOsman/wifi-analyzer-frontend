import { motion } from 'framer-motion';
import Card from './Card';

const StatsCard = ({ icon: Icon, title, value, color, bgColor, trend, loading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <Card glow className={bgColor}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className={`text-4xl font-bold text-${color} mb-2`}>
              {loading ? '...' : value}
            </p>
            {trend && (
              <p className="text-xs text-gray-500">
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
              </p>
            )}
          </div>
          <Icon className={`text-${color} opacity-80`} size={48} />
        </div>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
