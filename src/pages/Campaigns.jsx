import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Plus, Play, Square, Trash2, Eye, FileDown, FileSpreadsheet, AlertCircle, Database } from 'lucide-react';
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
  const [actionLoading, setActionLoading] = useState(null); // Track which action is loading
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignData, setCampaignData] = useState(null);
  const [showDataModal, setShowDataModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignsAPI.getList();
      const campaignList = response.campaign || [];
      setCampaigns(campaignList);

      // Check if any campaign is active/scanning
      const activeCampaign = campaignList.find(c => c.status === 'active');
      setIsScanning(!!activeCampaign);
      setActiveCampaignId(activeCampaign?.id || null);
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

    setActionLoading('create');
    try {
      // Step 1: Create campaign
      const createResponse = await campaignsAPI.create({ name: newCampaignName, status: 'active' });
      console.log('Campaign created:', createResponse);

      // Step 2: Get the newly created campaign ID from the correct response structure
      // Backend returns: {campaign: {id: ..., name: ..., status: ...}}
      const newCampaignId = createResponse.campaign?.id;

      if (newCampaignId) {
        // Step 3: Automatically start scanning
        console.log('Starting scan for campaign:', newCampaignId);
        await campaignsAPI.start(newCampaignId);
        toast.success('Campaign created and scanning started!');
      } else {
        console.error('Failed to extract campaign ID from response:', createResponse);
        toast.success('Campaign created successfully');
      }

      setShowCreateModal(false);
      setNewCampaignName('');
      fetchCampaigns();
    } catch (error) {
      console.error('Campaign creation error:', error);
      toast.error('Failed to create campaign');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (id) => {
    setActionLoading(`start-${id}`);
    try {
      await campaignsAPI.start(id);
      toast.success('Campaign started successfully');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to start campaign');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStop = async () => {
    setActionLoading('stop');
    try {
      console.log('Stopping campaign...');
      const response = await campaignsAPI.stop();
      console.log('Stop response:', response);

      toast.success('Campaign stopped successfully');

      // Reset state immediately untuk UI responsiveness
      setIsScanning(false);
      setActiveCampaignId(null);

      // WORKAROUND: Backend tidak update status campaign
      // Manually update campaign status di frontend
      setCampaigns(prevCampaigns =>
        prevCampaigns.map(campaign =>
          campaign.status === 'active'
            ? { ...campaign, status: 'inactive' }
            : campaign
        )
      );

      console.log('Campaign status manually updated to inactive');
    } catch (error) {
      console.error('Stop error:', error);
      toast.error('Failed to stop campaign');
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle function untuk start/stop scan
  const handleToggleScan = async () => {
    if (isScanning) {
      // Stop scanning
      await handleStop();
    } else {
      // Start scanning - ambil campaign terakhir atau yang pertama
      if (campaigns.length > 0) {
        const sortedCampaigns = [...campaigns].sort((a, b) => {
          const dateA = new Date(a.created_at || a.timestamp || 0);
          const dateB = new Date(b.created_at || b.timestamp || 0);
          return dateB - dateA;
        });
        await handleStart(sortedCampaigns[0].id);
      } else {
        toast.error('No campaigns available. Please create a campaign first.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    setActionLoading(`delete-${id}`);
    try {
      await campaignsAPI.delete(id);
      toast.success('Campaign deleted successfully');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to delete campaign');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewData = async (campaign) => {
    setActionLoading(`view-${campaign.id}`);
    try {
      const data = await campaignsAPI.getData(campaign.id);
      setCampaignData(data);
      setSelectedCampaign(campaign);
      setShowDataModal(true);
    } catch (error) {
      toast.error('Failed to load campaign data');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportPDF = async (id) => {
    setActionLoading(`export-pdf-${id}`);
    try {
      const result = await campaignsAPI.exportPdf(id); // Fixed typo: exportPDF -> exportPdf
      toast.success('PDF export initiated');
    } catch (error) {
      toast.error('Failed to export PDF');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportXLSX = async (id) => {
    setActionLoading(`export-xlsx-${id}`);
    try {
      const result = await campaignsAPI.exportXlsx(id);
      toast.success('Excel export initiated');
    } catch (error) {
      toast.error('Failed to export Excel');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-sm ${row.status === 'active'
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'bg-gray-500/20 text-gray-400'
          }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Created',
      accessor: 'created_at',
      render: (row) => (
        <span className="text-sm text-gray-400">
          {formatDate(row.created_at || row.timestamp)}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={row.status === 'active' ? 'danger' : 'success'}
            icon={row.status === 'active' ? Square : Play}
            onClick={(e) => {
              e.stopPropagation();
              if (row.status === 'active') {
                handleStop();
              } else {
                handleStart(row.id);
              }
            }}
            disabled={actionLoading === `start-${row.id}` || actionLoading === 'stop'}
          >
            {actionLoading === `start-${row.id}` || actionLoading === 'stop'
              ? '...'
              : row.status === 'active' ? 'Stop' : 'Start'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={Eye}
            onClick={(e) => { e.stopPropagation(); handleViewData(row); }}
            disabled={actionLoading === `view-${row.id}`}
          >
            {actionLoading === `view-${row.id}` ? '...' : 'View'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={FileDown}
            onClick={(e) => { e.stopPropagation(); handleExportPDF(row.id); }}
            disabled={actionLoading === `export-pdf-${row.id}`}
          >
            {actionLoading === `export-pdf-${row.id}` ? '...' : 'PDF'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={FileSpreadsheet}
            onClick={(e) => { e.stopPropagation(); handleExportXLSX(row.id); }}
            disabled={actionLoading === `export-xlsx-${row.id}`}
          >
            {actionLoading === `export-xlsx-${row.id}` ? '...' : 'Excel'}
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={Trash2}
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
            disabled={row.status === 'active' || actionLoading === `delete-${row.id}`}
          >
            {actionLoading === `delete-${row.id}` ? '...' : 'Delete'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="text-cyan-400" size={40} />
          <div>
            <h1 className="text-3xl font-bold text-white">Campaigns</h1>
            <p className="text-gray-400">Manage R.A.D.A.R scanning campaigns</p>
          </div>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          New Campaign
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-cyan-500/10 border-cyan-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Radio size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Campaigns</p>
              <p className="text-2xl font-bold text-cyan-400">{campaigns.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Play size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Scans</p>
              <p className="text-2xl font-bold text-emerald-400">
                {campaigns.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-violet-500/10 border-violet-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-violet-500/20 text-violet-400">
              <Database size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Data Points</p>
              <p className="text-2xl font-bold text-violet-400">
                {campaigns.reduce((acc, curr) => acc + (curr.networks_count || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>
      {/* Campaigns Table */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-500 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-300 mb-2">No Campaigns Yet</h3>
            <p className="text-gray-400 mb-6">Create your first campaign to start scanning networks</p>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowCreateModal(true)}
            >
              Create Your First Campaign
            </Button>
          </div>
        ) : (
          <Table columns={columns} data={campaigns} />
        )}
      </Card>

      {/* Create Campaign Modal */}
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
            placeholder="Enter campaign name (e.g., Office Network Scan)"
            onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
              disabled={actionLoading === 'create'}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={actionLoading === 'create'}
            >
              {actionLoading === 'create' ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Campaign Data Modal */}
      <Modal
        isOpen={showDataModal}
        onClose={() => setShowDataModal(false)}
        title={`Campaign Data: ${selectedCampaign?.name}`}
        size="lg"
      >
        {campaignData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-cyan-500/10">
                <p className="text-gray-400 text-sm">Devices</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {campaignData.devices?.length || 0}
                </p>
              </Card>
              <Card className="bg-violet-500/10">
                <p className="text-gray-400 text-sm">Clients</p>
                <p className="text-3xl font-bold text-violet-400">
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
                          <p className="text-sm text-cyan-400">{device.signal} dBm</p>
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
