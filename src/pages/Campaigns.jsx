import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Plus, Play, Square, Trash2, Eye, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { campaignsAPI } from '../api/campaigns';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignData, setCampaignData] = useState(null);
  const [showDataModal, setShowDataModal] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignsAPI.getList();
      setCampaigns(response.campaign || []);
    } catch (error) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newCampaignName.trim()) {
      toast.error('Campaign name is required');
      return;
    }

    try {
      await campaignsAPI.create({ name: newCampaignName, status: 'active' });
      toast.success('Campaign created successfully');
      setShowCreateModal(false);
      setNewCampaignName('');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  const handleStart = async (id) => {
    try {
      await campaignsAPI.start(id);
      toast.success('Campaign started successfully');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to start campaign');
    }
  };

  const handleStop = async () => {
    try {
      await campaignsAPI.stop();
      toast.success('Campaign stopped successfully');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to stop campaign');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      await campaignsAPI.delete(id);
      toast.success('Campaign deleted successfully');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const handleViewData = async (campaign) => {
    try {
      const data = await campaignsAPI.getData(campaign.id);
      setCampaignData(data);
      setSelectedCampaign(campaign);
      setShowDataModal(true);
    } catch (error) {
      toast.error('Failed to load campaign data');
    }
  };

  const handleExportPDF = async (id) => {
    try {
      const result = await campaignsAPI.exportPDF(id);
      toast.success('PDF export initiated');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-sm ${
          row.status === 'active' 
            ? 'bg-neon-green/20 text-neon-green' 
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="success"
            icon={Play}
            onClick={(e) => { e.stopPropagation(); handleStart(row.id); }}
          >
            Start
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={Eye}
            onClick={(e) => { e.stopPropagation(); handleViewData(row); }}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={FileDown}
            onClick={(e) => { e.stopPropagation(); handleExportPDF(row.id); }}
          >
            Export
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={Trash2}
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="text-neon-blue" size={40} />
          <div>
            <h1 className="text-3xl font-bold neon-text">Campaigns</h1>
            <p className="text-gray-400">Manage your scanning campaigns</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Square}
            onClick={handleStop}
          >
            Stop Scanning
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            Create Campaign
          </Button>
        </div>
      </div>

      <Card>
        <Table columns={columns} data={campaigns} />
      </Card>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Campaign"
      >
        <div className="space-y-4">
          <Input
            label="Campaign Name"
            value={newCampaignName}
            onChange={(e) => setNewCampaignName(e.target.value)}
            placeholder="Enter campaign name"
          />
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

      <Modal
        isOpen={showDataModal}
        onClose={() => setShowDataModal(false)}
        title={`Campaign Data: ${selectedCampaign?.name}`}
        size="lg"
      >
        {campaignData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-neon-blue/10">
                <p className="text-gray-400 text-sm">Devices</p>
                <p className="text-3xl font-bold text-neon-blue">
                  {campaignData.devices?.length || 0}
                </p>
              </Card>
              <Card className="bg-neon-purple/10">
                <p className="text-gray-400 text-sm">Clients</p>
                <p className="text-3xl font-bold text-neon-purple">
                  {campaignData.clients?.length || 0}
                </p>
              </Card>
            </div>
            {campaignData.devices?.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-2">Detected Devices</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {campaignData.devices.map((device, idx) => (
                    <Card key={idx} className="bg-white/5">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{device.ssid || 'Unknown'}</p>
                          <p className="text-sm text-gray-400">{device.bssid}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Channel {device.channel}</p>
                          <p className="text-sm text-neon-blue">{device.signal} dBm</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Campaigns;
