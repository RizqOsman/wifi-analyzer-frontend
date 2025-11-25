import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Wifi, Zap, Activity, Shield, AlertTriangle, RefreshCw, LayoutDashboard, ShieldAlert, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import Button from '../components/Button';
import RogueAPAlert from '../components/RogueAPAlert';
import InsecureNetworkAlert from '../components/InsecureNetworkAlert';
import { campaignsAPI } from '../api/campaigns';
import { wifiAPI } from '../api/wifi';
import { attacksAPI } from '../api/attacks';
import { useRogueAPMonitor } from '../hooks/useRogueAPMonitor';
import { useInsecureNetworkMonitor } from '../hooks/useInsecureNetworkMonitor';

const Dashboard = () => {
  const [stats, setStats] = useState({
    campaigns: 0,
    networks: 0,
    activeAttacks: 0,
    rogueAPs: 0,
    secureNetworks: 0,
    vulnerableNetworks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // Rogue AP monitoring
  const {
    rogueAPCount: liveRogueAPCount,
    hasNewAlert,
    dismissAlert,
    toggleSound,
    isSoundMuted,
  } = useRogueAPMonitor(true);

  // Insecure network monitoring
  const {
    insecureCount: liveInsecureCount,
    hasNewAlert: hasInsecureAlert,
    dismissAlert: dismissInsecureAlert,
  } = useInsecureNetworkMonitor(true);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // LANGKAH 1: Ambil campaigns terlebih dahulu
      const campaignsRes = await campaignsAPI.getList();
      const campaigns = campaignsRes.campaign || [];

      // LANGKAH 2: Dapatkan campaign terakhir
      let latestCampaignId = null;
      if (campaigns.length > 0) {
        const sortedCampaigns = campaigns.sort((a, b) => {
          const dateA = new Date(a.created_at || a.timestamp || 0);
          const dateB = new Date(b.created_at || b.timestamp || 0);
          return dateB - dateA;
        });
        latestCampaignId = sortedCampaigns[0].id;
      }

      // LANGKAH 3: Fetch data lainnya (networks dengan campaign ID)
      const [networksRes, attacksRes, rogueRes] = await Promise.all([
        latestCampaignId ? wifiAPI.getNetworks(latestCampaignId) : Promise.resolve([]),
        attacksAPI.getActive(),
        campaignsAPI.getRogueAp(),
      ]);

      // Process networks data
      const networksData = Array.isArray(networksRes) ? networksRes : (networksRes.data || []);
      const secureCount = networksData.filter(n => n.security && n.security !== 'Open').length;
      const vulnerableCount = networksData.filter(n => !n.security || n.security === 'Open').length;

      setStats({
        campaigns: campaigns.length || 0,
        networks: networksData.length || 0,
        activeAttacks: Array.isArray(attacksRes) ? attacksRes.length : (attacksRes.data?.length || 0),
        rogueAPs: liveRogueAPCount || rogueRes.data?.length || 0,
        secureNetworks: secureCount,
        vulnerableNetworks: liveInsecureCount || vulnerableCount,
      });

      if (manual) {
        toast.success('Dashboard refreshed');
      }
    } catch (error) {
      toast.error('Failed to load dashboard stats');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calculate percentages based on real data
  const networkCoverage = stats.networks > 0
    ? Math.round((stats.secureNetworks / stats.networks) * 100)
    : 0;




  const handleRefresh = () => {
    fetchStats(true);
  };

  const handleToggleSound = () => {
    const newMutedState = toggleSound();
    setSoundMuted(newMutedState);
    toast.success(newMutedState ? '🔇 Sound alerts muted' : '🔊 Sound alerts enabled');
  };

  // Initialize sound muted state
  useEffect(() => {
    setSoundMuted(isSoundMuted());
  }, []);

  const statCards = [
    {
      title: 'Total Campaigns',
      value: stats.campaigns,
      icon: Radio,
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-500/10',
      borderClass: 'border-cyan-500/20',
    },
    {
      title: 'Secure Networks',
      value: `${stats.secureNetworks}/${stats.networks} (${Math.round((stats.secureNetworks / (stats.networks || 1)) * 100)}%)`,
      icon: Wifi,
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10',
      borderClass: 'border-emerald-500/20',
    },
    {
      title: 'Active Attacks',
      value: stats.activeAttacks,
      icon: Zap,
      colorClass: 'text-violet-400',
      bgClass: 'bg-violet-500/10',
      borderClass: 'border-violet-500/20',
    },
    {
      title: 'Rogue APs Detected',
      value: stats.rogueAPs,
      icon: ShieldAlert,
      colorClass: 'text-pink-400',
      bgClass: 'bg-pink-500/10',
      borderClass: 'border-pink-500/20',
    },
  ];

  const securityMetrics = [
    { label: 'Network Coverage', value: Math.round((stats.secureNetworks / (stats.networks || 1)) * 100), color: 'bg-cyan-500' },
    { label: 'Threat Detection Rate', value: Math.round(((stats.networks - stats.rogueAPs) / (stats.networks || 1)) * 100), color: 'bg-violet-500' },
    { label: 'System Health', value: stats.campaigns > 0 ? 98 : 0, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-cyan-400" size={40} />
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">R.A.D.A.R Security Operations Overview</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            icon={soundMuted ? VolumeX : Volume2}
            onClick={handleToggleSound}
            className="border border-white/10"
          >
            {soundMuted ? 'Unmute' : 'Mute'}
          </Button>
          <Button
            variant="primary"
            icon={refreshing ? RefreshCw : RefreshCw}
            onClick={handleRefresh}
            disabled={refreshing}
            className={refreshing ? "opacity-80" : ""}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {/* Rogue AP Alert Banner */}
      <RogueAPAlert
        rogueAPCount={stats.rogueAPs}
        onDismiss={dismissAlert}
        isVisible={hasNewAlert}
      />

      {/* Insecure Network Alert Banner */}
      <InsecureNetworkAlert
        insecureCount={stats.vulnerableNetworks}
        onDismiss={dismissInsecureAlert}
        isVisible={hasInsecureAlert}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          // Add pulsing animation to Rogue APs card when there are alerts
          const isRogueAPCard = stat.title === 'Rogue APs Detected';
          const shouldPulse = isRogueAPCard && stats.rogueAPs > 0;

          return (
            <motion.div
              key={index}
              animate={shouldPulse ? {
                boxShadow: [
                  '0 0 0 0 rgba(236, 72, 153, 0)',
                  '0 0 0 8px rgba(236, 72, 153, 0.2)',
                  '0 0 0 0 rgba(236, 72, 153, 0)',
                ],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Card className={`${stat.bgClass} border ${stat.borderClass} ${shouldPulse ? 'border-pink-500/50' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-dark-900/50 ${stat.colorClass}`}>
                    <stat.icon size={24} />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full bg-dark-900/50 ${stat.colorClass}`}>
                    +2.5%
                  </span>
                </div>
                <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
                <p className={`text-2xl font-bold mt-1 ${stat.colorClass}`}>
                  {stat.value}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Metrics */}
        <Card>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Shield className="text-cyan-400" />
            Security Metrics
          </h3>
          <div className="space-y-6">
            {securityMetrics.map((metric, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">{metric.label}</span>
                  <span className="text-white font-bold">{metric.value}%</span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className={`h-full ${metric.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>


        {/* Recent Activity */}
        <Card>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Activity className="text-violet-400" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Radio className="text-cyan-400" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Campaign Started</p>
                <p className="text-xs text-gray-400">Latest scan initiated</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Wifi className="text-emerald-400" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Networks Detected</p>
                <p className="text-xs text-gray-400">{stats.networks} networks found</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Zap className="text-violet-400" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Active Monitoring</p>
                <p className="text-xs text-gray-400">System operational</p>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};


export default Dashboard;
