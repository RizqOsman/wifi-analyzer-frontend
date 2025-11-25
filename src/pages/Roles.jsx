import { useState, useEffect } from 'react';
import { Lock, Plus, Trash2, Key, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { rolesAPI } from '../api/roles';
import { permissionsAPI } from '../api/permissions';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    guard_name: 'web',
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await rolesAPI.getAll();
      setRoles(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await permissionsAPI.getAll();
      setPermissions(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load permissions');
    }
  };

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error('Role name is required');
      return;
    }

    try {
      await rolesAPI.create(formData);
      toast.success('Role created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', guard_name: 'web' });
      fetchRoles();
    } catch (error) {
      toast.error('Failed to create role');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      await rolesAPI.delete(id);
      toast.success('Role deleted successfully');
      fetchRoles();
    } catch (error) {
      toast.error('Failed to delete role');
    }
  };

  const handleChangePermission = async () => {
    try {
      await rolesAPI.changePermission(selectedRole.id, selectedPermissionIds);
      toast.success('Permissions updated successfully');
      setShowPermissionModal(false);
      setSelectedRole(null);
      setSelectedPermissionIds([]);
      fetchRoles();
    } catch (error) {
      toast.error('Failed to update permissions');
    }
  };

  const openPermissionModal = (role) => {
    setSelectedRole(role);
    setSelectedPermissionIds(role.permissions?.map(p => p.id) || []);
    setShowPermissionModal(true);
  };

  const togglePermission = (permissionId) => {
    setSelectedPermissionIds(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Guard', accessor: 'guard_name' },
    {
      header: 'Permissions',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.permissions?.length > 0 ? (
            row.permissions.slice(0, 3).map((permission) => (
              <span
                key={permission.id}
                className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs"
              >
                {permission.name}
              </span>
            ))
          ) : (
            <span className="text-gray-500">No permissions</span>
          )}
          {row.permissions?.length > 3 && (
            <span className="px-2 py-1 text-xs text-gray-400">
              +{row.permissions.length - 3} more
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={Key}
            onClick={(e) => { e.stopPropagation(); openPermissionModal(row); }}
          >
            Permissions
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
          <Shield className="text-cyan-400" size={40} />
          <div>
            <h1 className="text-3xl font-bold text-white">Roles</h1>
            <p className="text-gray-400">Manage roles and permissions</p>
          </div>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          Create Role
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={roles} />
      </Card>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Role"
      >
        <div className="space-y-4">
          <Input
            label="Role Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter role name"
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

      <Modal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        title={`Manage Permissions: ${selectedRole?.name}`}
      >
        <div className="space-y-4">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {permissions.map((permission) => (
              <label
                key={permission.id}
                className="flex items-center gap-3 p-3 rounded-lg glass-effect hover:bg-white/5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPermissionIds.includes(permission.id)}
                  onChange={() => togglePermission(permission.id)}
                  className="w-4 h-4 rounded border-gray-600 text-cyan-400 focus:ring-cyan-400"
                />
                <span className="flex-1">{permission.name}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowPermissionModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleChangePermission}>
              Update Permissions
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Roles;
