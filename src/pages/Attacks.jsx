import { useState, useEffect } from 'react';
import { Zap, Plus, Square, History } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { attacksAPI } from '../api/attacks';

const Attacks = () => {
  const [attacks, setAttacks] = useState([]);
  const [activeAttacks, setActiveAttacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState({
    networkId: '',
    ssid: '',
    bssid: '',
    attackType: 'deauth',
  });

  useEffect(() => {
    fetchAttacks();
    fetchActiveAttacks();
  }, []);

  const fetchAttacks = async () => {
    try {
      const response = await attacksAPI.getAll();
      setAttacks(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error('Failed to load attacks');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveAttacks = async () => {
    try {
      const response = await attacksAPI.getActive();
      setActiveAttacks(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load active attacks');
    }
  };

  const handleCreate = async () => {
    if (!formData.ssid || !formData.bssid) {
      toast.error('SSID and BSSID are required');
      return;
    }

    try {
      await attacksAPI.create(formData);
      toast.success('Attack created successfully');
      setShowCreateModal(false);
      setFormData({ networkId: '', ssid: '', bssid: '', attackType: 'deauth' });
      fetchAttacks();
      fetchActiveAttacks();
    } catch (error) {
      toast.error('Failed to create attack');
    }
  };

  const handleStop = async (id) => {
    try {
      await attacksAPI.stop(id);
      toast.success('Attack stopped successfully');
      fetchAttacks();
      fetchActiveAttacks();
    } catch (error) {
      toast.error('Failed to stop attack');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'SSID', accessor: 'ssid' },
    { header: 'BSSID', accessor: 'bssid' },
    { header: 'Type', accessor: 'attackType' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-sm ${row.status === 'active'
          ? 'bg-emerald-500/20 text-emerald-400'
          : row.status === 'stopped'
            ? 'bg-red-500/20 text-red-400'
            : 'bg-gray-500/20 text-gray-400'
          }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <Button
          size="sm"
          variant="danger"
          icon={Square}
          onClick={() => handleStop(row.id)}
          disabled={row.status !== 'active'}
        >
          Stop
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="text-cyan-400" size={40} />
          <div>
            <h1 className="text-3xl font-bold text-white">Attacks</h1>
            <p className="text-gray-400">R.A.D.A.R Network Attack Management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            New Attack
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-emerald-500/10">
          <p className="text-gray-400 text-sm">Active Attacks</p>
          <p className="text-4xl font-bold text-emerald-400">
            {activeAttacks.length}
          </p>
        </Card>
        <Card className="bg-cyan-500/10">
          <p className="text-gray-400 text-sm">Total Attacks</p>
          <p className="text-4xl font-bold text-cyan-400">
            {attacks.length}
          </p>
        </Card>
      </div>

      <Card>
        <Table
          columns={columns}
          data={showHistory ? attacks : activeAttacks}
        />
      </Card>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Attack"
      >
        <div className="space-y-4">
          <Input
            label="Network ID (optional)"
            type="number"
            value={formData.networkId}
            onChange={(e) => setFormData({ ...formData, networkId: e.target.value })}
            placeholder="Enter network ID"
          />
          <Input
            label="SSID"
            value={formData.ssid}
            onChange={(e) => setFormData({ ...formData, ssid: e.target.value })}
            placeholder="Enter SSID"
            required
          />
          <Input
            label="BSSID"
            value={formData.bssid}
            onChange={(e) => setFormData({ ...formData, bssid: e.target.value })}
            placeholder="Enter BSSID (e.g., AA:BB:CC:DD:EE:FF)"
            required
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Attack Type
            </label>
            <select
              value={formData.attackType}
              onChange={(e) => setFormData({ ...formData, attackType: e.target.value })}
              className="w-full px-4 py-2 rounded-lg glass-effect border border-white/10 focus:border-neon-blue/50 bg-dark-800/50 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/20"
            >
              <option value="deauth">Deauthentication</option>
              <option value="eviltwin">Evil Twin</option>
              <option value="jamming">Jamming</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Attacks;
