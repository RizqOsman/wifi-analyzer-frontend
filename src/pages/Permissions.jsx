import { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { permissionsAPI } from '../api/permissions';

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    guard_name: 'web',
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await permissionsAPI.getAll();
      setPermissions(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error('Permission name is required');
      return;
    }

    try {
      await permissionsAPI.create(formData);
      toast.success('Permission created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', guard_name: 'web' });
      fetchPermissions();
    } catch (error) {
      toast.error('Failed to create permission');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this permission?')) return;

    try {
      await permissionsAPI.delete(id);
      toast.success('Permission deleted successfully');
      fetchPermissions();
    } catch (error) {
      toast.error('Failed to delete permission');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Guard', accessor: 'guard_name' },
    {
      header: 'Actions',
      render: (row) => (
        <Button
          size="sm"
          variant="danger"
          icon={Trash2}
          onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lock className="text-cyan-400" size={40} />
          <div>
            <h1 className="text-3xl font-bold text-white">Permissions</h1>
            <p className="text-gray-400">Manage system permissions</p>
          </div>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          Add Permission
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={permissions} />
      </Card>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Permission"
      >
        <div className="space-y-4">
          <Input
            label="Permission Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter permission name (e.g., view_campaigns, create_users)"
            required
          />
          <Input
            label="Guard Name"
            value={formData.guard_name}
            onChange={(e) => setFormData({ ...formData, guard_name: e.target.value })}
            placeholder="Enter guard name (default: web)"
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
    </div>
  );
};

export default Permissions;
