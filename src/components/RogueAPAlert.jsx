import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const RogueAPAlert = ({ rogueAPCount, onDismiss, isVisible }) => {
    const navigate = useNavigate();

    const handleViewDetails = () => {
        // Navigate to a page showing rogue AP details (could be Networks page with filter)
        navigate('/networks');
        onDismiss();
    };

    return (
        <AnimatePresence>
            {isVisible && rogueAPCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6"
                >
                    <div className="relative overflow-hidden rounded-lg border-2 border-red-500/50 bg-gradient-to-r from-red-500/20 via-red-600/10 to-red-500/20 backdrop-blur-sm">
                        {/* Pulsing background effect */}
                        <motion.div
                            className="absolute inset-0 bg-red-500/10"
                            animate={{
                                opacity: [0.1, 0.3, 0.1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />

                        <div className="relative flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                {/* Pulsing icon */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="flex-shrink-0"
                                >
                                    <div className="p-3 rounded-full bg-red-500/20 border border-red-500/50">
                                        <AlertTriangle className="text-red-400" size={24} />
                                    </div>
                                </motion.div>

                                {/* Alert message */}
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        🚨 Rogue Access Point Detected!
                                    </h3>
                                    <p className="text-red-200 text-sm mt-1">
                                        {rogueAPCount} suspicious access point{rogueAPCount > 1 ? 's' : ''} detected in your network.
                                        Immediate attention required.
                                    </p>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="danger"
                                    icon={Eye}
                                    onClick={handleViewDetails}
                                >
                                    View Details
                                </Button>
                                <button
                                    onClick={onDismiss}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                                    aria-label="Dismiss alert"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RogueAPAlert;
