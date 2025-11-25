import { useState, useEffect, useRef } from 'react';
import { campaignsAPI } from '../api/campaigns';
import toast from 'react-hot-toast';
import { notificationSound } from '../utils/notificationSound';

/**
 * Custom hook to monitor rogue AP detections
 * Polls the API every 10 seconds and triggers alerts when new rogue APs are detected
 */
export const useRogueAPMonitor = (isEnabled = true) => {
    const [rogueAPs, setRogueAPs] = useState([]);
    const [rogueAPCount, setRogueAPCount] = useState(0);
    const [hasNewAlert, setHasNewAlert] = useState(false);
    const previousCountRef = useRef(0);
    const isFirstLoadRef = useRef(true);

    // Initialize sound mute state from localStorage
    useEffect(() => {
        notificationSound.getMuted();
    }, []);

    // Fetch rogue APs
    const fetchRogueAPs = async () => {
        try {
            const response = await campaignsAPI.getRogueAp();
            const rogueAPData = response.data || [];
            const currentCount = rogueAPData.length;

            setRogueAPs(rogueAPData);
            setRogueAPCount(currentCount);

            // Check if there are new rogue APs (skip first load)
            if (!isFirstLoadRef.current && currentCount > previousCountRef.current) {
                const newCount = currentCount - previousCountRef.current;

                // Trigger alert
                setHasNewAlert(true);

                // Show toast notification
                toast.error(
                    `⚠️ ${newCount} new Rogue AP${newCount > 1 ? 's' : ''} detected!`,
                    {
                        duration: 5000,
                        icon: '🚨',
                        style: {
                            background: '#DC2626',
                            color: '#fff',
                            fontWeight: 'bold',
                        },
                    }
                );

                // Play sound alert
                notificationSound.playAlert();

                // Auto-dismiss alert after 10 seconds
                setTimeout(() => {
                    setHasNewAlert(false);
                }, 10000);
            }

            // Update previous count
            previousCountRef.current = currentCount;
            isFirstLoadRef.current = false;

        } catch (error) {
            console.error('Failed to fetch rogue APs:', error);
        }
    };

    // Set up polling
    useEffect(() => {
        if (!isEnabled) return;

        // Initial fetch
        fetchRogueAPs();

        // Poll every 10 seconds
        const interval = setInterval(fetchRogueAPs, 10000);

        return () => clearInterval(interval);
    }, [isEnabled]);

    // Dismiss alert manually
    const dismissAlert = () => {
        setHasNewAlert(false);
    };

    // Toggle sound mute
    const toggleSound = () => {
        return notificationSound.toggleMute();
    };

    // Get sound mute status
    const isSoundMuted = () => {
        return notificationSound.isMuted;
    };

    return {
        rogueAPs,
        rogueAPCount,
        hasNewAlert,
        dismissAlert,
        toggleSound,
        isSoundMuted,
        refetch: fetchRogueAPs,
    };
};
