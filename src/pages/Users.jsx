import { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Trash2, Shield, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { usersAPI } from '../api/users';
import { rolesAPI } from '../api/roles';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await rolesAPI.getAll();
      setRoles(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load roles');
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('All fields are required');
      return;
    }

    try {
      await usersAPI.create(formData);
      toast.success('User created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '' });
      fetchUsers();
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await usersAPI.delete(id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleChangeRole = async () => {
    if (selectedRoleIds.length === 0) {
      toast.error('Please select at least one role');
      return;
    }

    try {
      await usersAPI.changeRole(selectedUser.id, selectedRoleIds);
      toast.success('User roles updated successfully');
      setShowRoleModal(false);
      setSelectedUser(null);
      setSelectedRoleIds([]);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user roles');
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRoleIds(user.roles?.map(r => r.id) || []);
    setShowRoleModal(true);
  };

  const toggleRole = (roleId) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Roles',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles?.map((role) => (
            <span
              key={role.id}
              className="px-2 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs"
            >
              {role.name}
            </span>
          )) || <span className="text-gray-500">No roles</span>}
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
            icon={Shield}
            onClick={(e) => { e.stopPropagation(); openRoleModal(row); }}
          >
            Roles
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
          <UsersIcon className="text-cyan-400" size={40} />
          <div>
            <h1 className="text-3xl font-bold text-white">Users</h1>
            <p className="text-gray-400">Manage system users and access</p>
          </div>
        </div>
        <Button
          variant="primary"
          icon={UserPlus}
          onClick={() => setShowCreateModal(true)}
        >
          Add User
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={users} />
      </Card>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter user name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
            required
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter password"
            required
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
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title={`Manage Roles: ${selectedUser?.name}`}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {roles.map((role) => (
              <label
                key={role.id}
                className="flex items-center gap-3 p-3 rounded-lg glass-effect hover:bg-white/5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedRoleIds.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className="w-4 h-4 rounded border-gray-600 text-cyan-400 focus:ring-cyan-400"
                />
                <span className="flex-1">{role.name}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowRoleModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleChangeRole}>
              Update Roles
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
