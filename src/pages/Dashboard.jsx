import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Wifi, Zap, Activity, Shield, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import { campaignsAPI } from '../api/campaigns';
import { wifiAPI } from '../api/wifi';
import { attacksAPI } from '../api/attacks';

const Dashboard = () => {
  const [stats, setStats] = useState({
    campaigns: 0,
    networks: 0,
    activeAttacks: 0,
    rogueAPs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
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

      setStats({
        campaigns: campaigns.length || 0,
        networks: Array.isArray(networksRes) ? networksRes.length : (networksRes.data?.length || 0),
        activeAttacks: Array.isArray(attacksRes) ? attacksRes.length : (attacksRes.data?.length || 0),
        rogueAPs: rogueRes.data?.length || 0,
      });
    } catch (error) {
      toast.error('Failed to load dashboard stats');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: Radio,
      title: 'Active Campaigns',
      value: stats.campaigns,
      color: 'neon-blue',
      bgColor: 'bg-neon-blue/20',
    },
    {
      icon: Wifi,
      title: 'Networks Detected',
      value: stats.networks,
      color: 'neon-purple',
      bgColor: 'bg-neon-purple/20',
    },
    {
      icon: Zap,
      title: 'Active Attacks',
      value: stats.activeAttacks,
      color: 'neon-green',
      bgColor: 'bg-neon-green/20',
    },
    {
      icon: AlertTriangle,
      title: 'Rogue APs',
      value: stats.rogueAPs,
      color: 'red-400',
      bgColor: 'bg-red-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="text-neon-blue" size={40} />
        <div>
          <h1 className="text-3xl font-bold neon-text">Dashboard</h1>
          <p className="text-gray-400">Overview of your WiFi security operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card glow className={stat.bgColor}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                  <p className={`text-4xl font-bold text-${stat.color}`}>
                    {loading ? '...' : stat.value}
                  </p>
                </div>
                <stat.icon className={`text-${stat.color}`} size={48} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-neon-blue" size={24} />
            <h2 className="text-xl font-bold">System Status</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-gray-300">WiFi Scanner</span>
              <span className="px-3 py-1 rounded-full bg-neon-green/20 text-neon-green text-sm">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-gray-300">Attack Engine</span>
              <span className="px-3 py-1 rounded-full bg-neon-green/20 text-neon-green text-sm">
                Ready
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-gray-300">Database</span>
              <span className="px-3 py-1 rounded-full bg-neon-green/20 text-neon-green text-sm">
                Connected
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-neon-purple" size={24} />
            <h2 className="text-xl font-bold">Security Overview</h2>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Network Coverage</span>
                <span className="text-sm text-neon-blue">87%</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div className="bg-neon-blue h-2 rounded-full" style={{ width: '87%' }} />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Threat Detection</span>
                <span className="text-sm text-neon-green">94%</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div className="bg-neon-green h-2 rounded-full" style={{ width: '94%' }} />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">System Health</span>
                <span className="text-sm text-neon-purple">98%</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div className="bg-neon-purple h-2 rounded-full" style={{ width: '98%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
