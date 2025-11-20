import { useState, useEffect, useMemo } from 'react';
import { Wifi, Zap, Square, Eye, Signal, ChevronLeft, ChevronRight, Activity, Lock, ShieldAlert, ShieldCheck, Shield, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { wifiAPI } from '../api/wifi';

const Networks = () => {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [inspectData, setInspectData] = useState(null);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNetworks();
  }, []);

  const fetchNetworks = async () => {
    setLoading(true);
    try {
      const response = await wifiAPI.getNetworks();
      setNetworks(Array.isArray(response) ? response : []);
      setCurrentPage(1);
    } catch (error) {
      toast.error('Failed to load networks');
      setNetworks([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter networks berdasarkan searchTerm
  const filteredNetworks = useMemo(() => {
    if (!searchTerm) return networks;
    
    const term = searchTerm.toLowerCase();
    return networks.filter(network => 
      (network.ssid && network.ssid.toLowerCase().includes(term)) ||
      network.bssid.toLowerCase().includes(term) ||
      (network.crypto && network.crypto.toLowerCase().includes(term)) ||
      String(network.channel).includes(term)
    );
  }, [networks, searchTerm]);

  const handleInspect = async (network) => {
    try {
      // Tampilkan modal loading/kosong dulu jika perlu, atau tunggu data
      const response = await wifiAPI.inspect(network.id);
      setInspectData(response.data);
      setSelectedNetwork(network);
      setShowInspectModal(true);
    } catch (error) {
      toast.error('Failed to inspect network');
    }
  };

  const handleAttack = async (id) => {
    if (!confirm('Are you sure you want to start an attack on this network?')) return;

    try {
      await wifiAPI.attack(id);
      toast.success('Attack started successfully');
      // Refresh networks dan data inspect (jika modal terbuka)
      fetchNetworks();
      if (selectedNetwork && selectedNetwork.id === id) {
         handleInspect(selectedNetwork); // Refresh data di modal
      }
    } catch (error) {
      toast.error('Failed to start attack');
    }
  };

  const handleStop = async (id) => {
    try {
      await wifiAPI.stop(id);
      toast.success('Attack stopped successfully');
      fetchNetworks();
      if (selectedNetwork && selectedNetwork.id === id) {
         handleInspect(selectedNetwork); // Refresh data di modal
      }
    } catch (error) {
      toast.error('Failed to stop attack');
    }
  };

  // --- Logika Pagination ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNetworks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNetworks.length / itemsPerPage);

  // --- Logika Badge Keamanan ---
  const getSecurityBadge = (crypto) => {
    const normalizedCrypto = crypto ? String(crypto).toUpperCase() : '';
    const displayLabel = crypto || 'Unknown';

    // Case: Hijau (WPA3 / WPA2)
    if (normalizedCrypto.includes('WPA3') || normalizedCrypto.includes('WPA2')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
          <ShieldCheck size={12} /> {displayLabel}
        </span>
      );
    }
    // Case: Kuning (WEP / WPA Legacy)
    if (normalizedCrypto.includes('WPA') || normalizedCrypto.includes('WEP')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
          <ShieldAlert size={12} /> {displayLabel}
        </span>
      );
    }
    // Case: Merah (Open)
    if (normalizedCrypto.includes('OPN') || normalizedCrypto.includes('OPEN') || normalizedCrypto === '') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
           <Lock size={12} className="text-red-800/50" /> Open
        </span>
      );
    }
    // Case: Abu-abu (Unknown)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
        <Shield size={12} /> {displayLabel}
      </span>
    );
  };

  // Definisi Kolom Tabel (Tombol Attack/Stop dihapus dari sini)
  const columns = [
    {
      header: 'NO',
      accessor: 'no',
      render: (row, index) => {
        // Memastikan index didefinisikan dan menghitung nomor urut dengan benar
        if (typeof index === 'undefined') {
          // Fallback jika index tidak tersedia
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
        <span className={!row.ssid ? 'text-gray-500 italic flex items-center gap-2' : 'font-medium text-gray-200'}>
          {row.ssid || <><Eye size={14} /> Hidden Network</>}
        </span>
      )
    },
    { header: 'BSSID', accessor: 'bssid' },
    { 
      header: 'Channel', 
      accessor: 'channel',
      render: (row) => row.channel || 'N/A'
    },
    {
      header: 'Signal',
      accessor: 'signal',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Signal size={16} className={`${parseInt(row.signal) >= -60 ? 'text-green-400' : 'text-neon-blue'}`} />
          <span>{row.signal || 'N/A'} dBm</span>
        </div>
      ),
    },
    {
      header: 'Security',
      accessor: 'crypto',
      render: (row) => getSecurityBadge(row.crypto),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            icon={Eye}
            onClick={(e) => { e.stopPropagation(); handleInspect(row); }}
            title="Inspect Network"
          >
            Inspect
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wifi className="text-neon-blue" size={40} />
          <div>
            <h1 className="text-3xl font-bold neon-text">WiFi Networks</h1>
            <p className="text-gray-400">View and manage detected networks</p>
          </div>
        </div>
        <Button variant="primary" onClick={fetchNetworks}>
          Refresh
        </Button>
      </div>

      <Card>
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-700/50">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-neon-blue text-white placeholder-gray-400"
              placeholder="Search by SSID, BSSID, Security, or Channel..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset ke halaman 1 saat pencarian berubah
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
            <p className="mt-4 text-gray-400">Scanning for networks...</p>
          </div>
        ) : (
          <>
            {/* Tabel dengan data halaman saat ini */}
            <Table columns={columns} data={currentItems} />

            {/* Kontrol Pagination */}
            {filteredNetworks.length > 0 && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-700/50">
                <div className="text-sm text-gray-400">
                  Showing <span className="text-white font-medium">{indexOfFirstItem + 1}</span> to <span className="text-white font-medium">{Math.min(indexOfLastItem, filteredNetworks.length)}</span> of <span className="text-white font-medium">{filteredNetworks.length}</span> entries
                  {searchTerm && (
                    <span className="ml-2">
                      (filtered from <span className="text-neon-blue">{networks.length}</span> total entries)
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} /> Previous
                  </Button>
                  <div className="flex items-center px-3 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
            
            {filteredNetworks.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <p className="text-gray-400">No networks found matching your search criteria.</p>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modal Inspect dengan Tombol Aksi (Attack/Stop) */}
      <Modal
        isOpen={showInspectModal}
        onClose={() => setShowInspectModal(false)}
        title={`Network Details: ${selectedNetwork?.ssid || 'Hidden'}`}
        size="lg"
      >
        {inspectData && selectedNetwork && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-gray-500">BSSID</p>
                <p className="font-mono text-lg">{inspectData.wifi?.bssid}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-gray-500">Channel</p>
                <p className="font-medium text-lg">{inspectData.wifi?.channel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-gray-500">Signal Strength</p>
                <div className="flex items-center gap-2">
                    <span className={`text-lg font-medium ${parseInt(inspectData.wifi?.signal) >= -60 ? 'text-green-400' : 'text-blue-400'}`}>
                        {inspectData.wifi?.signal} dBm
                    </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-gray-500">Encryption</p>
                <div className="mt-1">
                    {getSecurityBadge(inspectData.wifi?.encryption || inspectData.wifi?.crypto)}
                </div>
              </div>
            </div>
            
            {inspectData.campaign && (
              <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-lg p-4">
                <h3 className="font-bold mb-2 text-neon-blue flex items-center gap-2">
                    <Activity size={16} /> Campaign Info
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-400">Name</p>
                        <p className="text-sm">{inspectData.campaign.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Status</p>
                        <p className="text-sm uppercase">{inspectData.campaign.status}</p>
                    </div>
                </div>
              </div>
            )}

            {inspectData.deauthJobs && inspectData.deauthJobs.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h3 className="font-bold mb-2 text-red-400 flex items-center gap-2">
                    <Zap size={16} /> Active Attacks
                </h3>
                <div className="space-y-2">
                    {inspectData.deauthJobs.map((job, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm bg-black/20 p-2 rounded">
                        <span>ID: {job.id}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${job.status === 'running' ? 'bg-red-500 text-white' : 'bg-gray-600'}`}>
                            {job.status}
                        </span>
                    </div>
                    ))}
                </div>
              </div>
            )}

            {/* Tombol Aksi Dipindahkan ke Sini */}
            <div className="pt-6 mt-6 border-t border-gray-700 grid grid-cols-2 gap-4">
                <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center"
                    onClick={() => handleAttack(selectedNetwork.id)}
                    icon={Zap}
                >
                    Start Attack
                </Button>
                <Button
                    variant="danger"
                    size="md"
                    className="w-full justify-center"
                    onClick={() => handleStop(selectedNetwork.id)}
                    icon={Square}
                >
                    Stop Attack
                </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Networks;