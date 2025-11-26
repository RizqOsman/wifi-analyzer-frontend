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

            console.log('[useInsecureNetworkMonitor] Fetching networks for campaign:', latestCampaignId);

            const networksRes = await wifiAPI.getNetworks(latestCampaignId);
            const networksData = Array.isArray(networksRes) ? networksRes : (networksRes.data || []);

            console.log('[useInsecureNetworkMonitor] Raw networks data:', networksData.length, 'networks');

            // Filter for insecure networks (check both 'crypto' and 'security' fields)
            const insecureNets = networksData.filter(n => {
                const crypto = (n.crypto || n.security || '').toLowerCase();
                const isInsecure = crypto === '' || crypto === 'open' || crypto === 'opn' || !crypto;

                // Debug: log first insecure network found
                if (isInsecure && insecureNets.length === 0) {
                    console.log('[useInsecureNetworkMonitor] First insecure network found:', {
                        ssid: n.ssid,
                        bssid: n.bssid,
                        crypto: n.crypto,
                        original_crypto: crypto
                    });
                }

                return isInsecure;
            });
            const currentCount = insecureNets.length;

            console.log('[useInsecureNetworkMonitor] Total networks:', networksData.length);
            console.log('[useInsecureNetworkMonitor] Insecure networks:', currentCount);
            console.log('[useInsecureNetworkMonitor] Previous count:', previousCountRef.current);
            console.log('[useInsecureNetworkMonitor] Is first load:', isFirstLoadRef.current);

            setInsecureNetworks(insecureNets);
            setInsecureCount(currentCount);

            if (!isFirstLoadRef.current && currentCount > previousCountRef.current) {
                const newCount = currentCount - previousCountRef.current;

                console.log('[useInsecureNetworkMonitor] 🚨 NEW INSECURE NETWORKS DETECTED!', newCount);

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
