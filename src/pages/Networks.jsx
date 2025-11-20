import { useState, useEffect, useMemo } from 'react';
import {
  Wifi, Zap, Square, Eye, Signal, ChevronLeft, ChevronRight,
  Activity, Lock, ShieldAlert, ShieldCheck, Shield, Search,
  Database, Filter, RefreshCw
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// --- IMPORTS ASLI ---
// Pastikan path file ini sesuai dengan struktur project Anda
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { wifiAPI } from '../api/wifi';

const Networks = () => {
  // --- STATE MANAGEMENT ---
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [inspectData, setInspectData] = useState(null);
  const [showInspectModal, setShowInspectModal] = useState(false);

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');

  // Session Logic
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessionStatus, setSessionStatus] = useState('offline'); // 'offline' | 'syncing' | 'active'

  // --- LIFECYCLE ---
  useEffect(() => {
    fetchNetworks();
  }, []);

  // --- CORE LOGIC: DATA FETCHING ---
  const fetchNetworks = async () => {
    setLoading(true);
    setSessionStatus('syncing');

    try {
      // LANGKAH 1: Dapatkan ID Campaign Terakhir
      const response = await wifiAPI.getCampaigns();

      // Backend mengembalikan { campaign: [...] }
      const campaigns = response.campaign || response || [];

      let currentId = null;

      if (campaigns && campaigns.length > 0) {
        // Sorting manual untuk memastikan yang diambil adalah yang paling baru (DESC)
        // Asumsi field waktu bernama 'created_at' atau 'timestamp'
        const sortedCampaigns = campaigns.sort((a, b) => {
          const dateA = new Date(a.created_at || a.timestamp || 0);
          const dateB = new Date(b.created_at || b.timestamp || 0);
          return dateB - dateA;
        });

        const latestCampaign = sortedCampaigns[0];
        currentId = latestCampaign.id;

        setActiveSessionId(currentId);
        setSessionStatus('active');
      } else {
        // Jika tidak ada campaign sama sekali
        setSessionStatus('offline');
        setNetworks([]);
        setLoading(false);
        return; // Stop di sini
      }

      // LANGKAH 2: Ambil Network Berdasarkan ID Tersebut
      if (currentId) {
        // Kirim ID sebagai parameter filter ke backend
        const response = await wifiAPI.getNetworks(currentId);

        // Normalisasi data (jaga-jaga jika response dibungkus field 'data')
        const networksData = Array.isArray(response) ? response : (response.data || []);

        setNetworks(networksData);
        setCurrentPage(1); // Reset pagination setiap kali refresh data
      }

    } catch (error) {
      console.error("Sync Error:", error);
      toast.error('Failed to sync with server. Check connection.');
      setNetworks([]);
      setSessionStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  // --- CLIENT-SIDE FILTERING ---
  const filteredNetworks = useMemo(() => {
    if (!searchTerm) return networks;

    const term = searchTerm.toLowerCase();
    return networks.filter(network =>
      (network.ssid && network.ssid.toLowerCase().includes(term)) ||
      (network.bssid && network.bssid.toLowerCase().includes(term)) ||
      (network.crypto && network.crypto.toLowerCase().includes(term)) ||
      String(network.channel).includes(term)
    );
  }, [networks, searchTerm]);

  // --- ACTION HANDLERS ---

  const handleInspect = async (network) => {
    try {
      // Mengambil detail spesifik dari network agent
      const response = await wifiAPI.inspect(network.id);
      setInspectData(response.data || response); // Sesuaikan dengan struktur response API
      setSelectedNetwork(network);
      setShowInspectModal(true);
    } catch (error) {
      console.error("Inspect Error:", error);
      toast.error('Could not fetch inspection details');
    }
  };

  const handleAttack = async (id) => {
    if (!confirm('SECURITY WARNING: Initiate deauthentication protocol on this target?')) return;

    try {
      await wifiAPI.attack(id);
      toast.success('Attack command initiated');

      // Refresh data di modal jika sedang terbuka untuk melihat status realtime
      if (selectedNetwork?.id === id) {
        const updatedData = await wifiAPI.inspect(id);
        setInspectData(updatedData.data || updatedData);
      }
      // Refresh list utama untuk update status global
      fetchNetworks();
    } catch (error) {
      console.error("Attack Error:", error);
      toast.error('Agent failed to execute attack command');
    }
  };

  const handleStop = async (id) => {
    try {
      await wifiAPI.stop(id);
      toast.success('Attack process terminated');

      if (selectedNetwork?.id === id) {
        const updatedData = await wifiAPI.inspect(id);
        setInspectData(updatedData.data || updatedData);
      }
      fetchNetworks();
    } catch (error) {
      console.error("Stop Error:", error);
      toast.error('Failed to stop process');
    }
  };

  // --- HELPER FUNCTIONS ---

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNetworks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNetworks.length / itemsPerPage);

  const getSecurityBadge = (crypto) => {
    const normalized = crypto ? String(crypto).toUpperCase() : '';
    const label = crypto || 'UNKNOWN';

    if (normalized.includes('WPA3') || normalized.includes('WPA2')) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20"><ShieldCheck size={12} /> {label}</span>;
    }
    if (normalized.includes('WPA') || normalized.includes('WEP')) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><ShieldAlert size={12} /> {label}</span>;
    }
    if (normalized.includes('OPN') || normalized.includes('OPEN') || normalized === '') {
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20"><Lock size={12} /> OPEN</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600"><Shield size={12} /> {label}</span>;
  };

  const columns = [
    {
      header: 'NO',
      accessor: 'no',
      render: (row, index) => {
        if (typeof index === 'undefined') {
          const rowIndex = currentItems.findIndex(item => item.id === row.id);
          return indexOfFirstItem + rowIndex + 1;
        }
        return indexOfFirstItem + index + 1;
      }
    },
    {
      header: 'SSID',
      accessor: 'ssid',
      render: (row) => (
        <span className={!row.ssid ? 'text-slate-500 italic flex items-center gap-2' : 'font-medium text-slate-200'}>
          {row.ssid || <><Eye size={14} /> Hidden Network</>}
        </span>
      )
    },
    { header: 'BSSID', accessor: 'bssid', className: "font-mono text-xs text-slate-400" },
    {
      header: 'CH',
      accessor: 'channel',
      render: (row) => <span className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300">{row.channel || 'N/A'}</span>
    },
    {
      header: 'Signal',
      accessor: 'signal',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Signal size={14} className={`${parseInt(row.signal) >= -60 ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-xs font-mono">{row.signal || 'N/A'} dBm</span>
        </div>
      ),
    },
    {
      header: 'Security',
      accessor: 'crypto',
      render: (row) => getSecurityBadge(row.crypto),
    },
    {
      header: '',
      render: (row) => (
        <Button
          size="sm"
          variant="ghost"
          icon={Eye}
          onClick={(e) => { e.stopPropagation(); handleInspect(row); }}
          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
        >
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-slate-200">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <Wifi className="text-cyan-400" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Network Scanner</h1>
            <div className="flex items-center gap-2 text-sm mt-1">
              {sessionStatus === 'active' && (
                <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs border border-emerald-500/20">
                  <Activity size={12} className="animate-pulse" /> Live Session
                </span>
              )}
              {sessionStatus === 'offline' && (
                <span className="flex items-center gap-1.5 text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-xs">
                  No Active Campaign
                </span>
              )}
              {sessionStatus === 'syncing' && (
                <span className="flex items-center gap-1.5 text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded text-xs">
                  <RefreshCw size={12} className="animate-spin" /> Syncing DB...
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* ID DISPLAY */}
          {activeSessionId && (
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono text-slate-400 shadow-inner">
              <Database size={14} className="text-slate-500" />
              ID: <span className="text-cyan-400 font-bold">{activeSessionId}</span>
            </div>
          )}
          <Button variant="primary" onClick={fetchNetworks} disabled={loading} className="shadow-lg shadow-cyan-500/20">
            {loading ? <RefreshCw size={18} className="animate-spin" /> : 'Sync Data'}
          </Button>
        </div>
      </div>

      {/* --- MAIN CARD --- */}
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="text-slate-500" size={18} />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-sm text-white placeholder-slate-500 transition-all outline-none"
              placeholder="Filter networks by SSID, BSSID, or Protocol..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Data Display */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-400 text-sm font-mono animate-pulse">
              Fetching networks from Session {activeSessionId || '...'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden min-h-[300px]">
              <Table columns={columns} data={currentItems} />
            </div>

            {filteredNetworks.length === 0 && !loading && (
              <div className="text-center py-16 px-4 border-t border-slate-800/50">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4 border border-slate-700 dashed">
                  <Filter className="text-slate-600" size={32} />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No Networks Found</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  {activeSessionId
                    ? "The active campaign hasn't captured any networks yet."
                    : "Please start a new campaign/session in the backend."}
                </p>
              </div>
            )}

            {/* Pagination */}
            {filteredNetworks.length > 0 && (
              <div className="flex items-center justify-between px-4 py-4 border-t border-slate-800 bg-slate-900/30">
                <div className="text-xs text-slate-400 font-mono">
                  SHOWING <span className="text-white">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredNetworks.length)}</span> OF <span className="text-white">{filteredNetworks.length}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-3 text-xs"
                  >
                    <ChevronLeft size={14} className="mr-1" /> Prev
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3 text-xs"
                  >
                    Next <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* --- MODAL INSPECT --- */}
      <Modal
        isOpen={showInspectModal}
        onClose={() => setShowInspectModal(false)}
        title={`Target Analysis: ${selectedNetwork?.ssid || 'Hidden SSID'}`}
        size="lg"
      >
        {inspectData && selectedNetwork && (
          <div className="space-y-6">
            {/* Detail Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">BSSID</label>
                <div className="font-mono text-cyan-400 text-sm">{inspectData.wifi?.bssid || selectedNetwork.bssid}</div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Channel</label>
                <div className="text-white text-sm">{inspectData.wifi?.channel || selectedNetwork.channel}</div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Signal Strength</label>
                <div className={`text-sm font-mono ${parseInt(inspectData.wifi?.signal || selectedNetwork.signal) >= -60 ? 'text-emerald-400' : 'text-amber-500'}`}>
                  {inspectData.wifi?.signal || selectedNetwork.signal} dBm
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Encryption</label>
                <div className="-ml-1 scale-90 origin-left">
                  {getSecurityBadge(inspectData.wifi?.encryption || inspectData.wifi?.crypto || selectedNetwork.crypto)}
                </div>
              </div>
            </div>

            {/* Context Info */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <Activity size={14} /> Session Context
                </h4>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-500 border border-slate-700">READ ONLY</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 block">Campaign ID</span>
                  <span className="text-sm font-mono text-slate-300">{activeSessionId}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Last Handshake</span>
                  {/* Ganti 'last_handshake' dengan field yang sesuai dari DB Anda */}
                  <span className="text-sm font-mono text-slate-300">
                    {inspectData.last_handshake ? new Date(inspectData.last_handshake).toLocaleString() : 'None captured'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="danger"
                className="w-full justify-center"
                onClick={() => handleAttack(selectedNetwork.id)}
                icon={Zap}
              >
                Launch Attack
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-center"
                onClick={() => handleStop(selectedNetwork.id)}
                icon={Square}
              >
                Stop Process
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Networks;