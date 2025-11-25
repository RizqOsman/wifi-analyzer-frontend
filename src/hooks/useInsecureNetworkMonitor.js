import { useState, useEffect, useRef } from 'react';
import { campaignsAPI } from '../api/campaigns';
import { wifiAPI } from '../api/wifi';
import toast from 'react-hot-toast';
import { notificationSound } from '../utils/notificationSound';

export const useInsecureNetworkMonitor = (isEnabled = true) => {
    const [insecureNetworks, setInsecureNetworks] = useState([]);
    const [insecureCount, setInsecureCount] = useState(0);
    const [hasNewAlert, setHasNewAlert] = useState(false);
    const previousCountRef = useRef(0);
    const isFirstLoadRef = useRef(true);

    const fetchInsecureNetworks = async () => {
        try {
            const campaignsRes = await campaignsAPI.getList();
            const campaigns = campaignsRes.campaign || [];

            if (campaigns.length === 0) {
                setInsecureNetworks([]);
                setInsecureCount(0);
                return;
            }

            const sortedCampaigns = campaigns.sort((a, b) => {
                const dateA = new Date(a.created_at || a.timestamp || 0);
                const dateB = new Date(b.created_at || b.timestamp || 0);
                return dateB - dateA;
            });
            const latestCampaignId = sortedCampaigns[0].id;
            const networksRes = await wifiAPI.getNetworks(latestCampaignId);
            const networksData = Array.isArray(networksRes) ? networksRes : (networksRes.data || []);
            const insecureNets = networksData.filter(n => !n.security || n.security === 'Open');
            const currentCount = insecureNets.length;

            setInsecureNetworks(insecureNets);
            setInsecureCount(currentCount);

            if (!isFirstLoadRef.current && currentCount > previousCountRef.current) {
                const newCount = currentCount - previousCountRef.current;
                setHasNewAlert(true);
                toast.error(
                    `⚠️ ${newCount} new insecure network${newCount > 1 ? 's' : ''} detected!`,
                    {
                        duration: 5000,
                        icon: '🔓',
                        style: {
                            background: '#F59E0B',
                            color: '#fff',
                            fontWeight: 'bold',
                        },
                    }
                );

                // Play insecure network alert sound
                notificationSound.playInsecureAlert();

                // Auto-dismiss alert after 10 seconds
                setTimeout(() => {
                    setHasNewAlert(false);
                }, 10000);
            }

            // Update previous count
            previousCountRef.current = currentCount;
            isFirstLoadRef.current = false;

        } catch (error) {
            console.error('Failed to fetch insecure networks:', error);
        }
    };

    // Set up polling
    useEffect(() => {
        if (!isEnabled) return;

        // Initial fetch
        fetchInsecureNetworks();

        // Poll every 10 seconds
        const interval = setInterval(fetchInsecureNetworks, 10000);

        return () => clearInterval(interval);
    }, [isEnabled]);

    // Dismiss alert manually
    const dismissAlert = () => {
        setHasNewAlert(false);
    };

    return {
        insecureNetworks,
        insecureCount,
        hasNewAlert,
        dismissAlert,
        refetch: fetchInsecureNetworks,
    };
};
