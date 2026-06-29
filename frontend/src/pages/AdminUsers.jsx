import { useState, useEffect, useCallback } from 'react';
import { getAllUsers, createUser, updateUserRole, deleteUser, toggleUserBan } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from '../utils/toast';
import PasswordField from '../components/PasswordField';
import { UserPlus, UserSearch, Ban, Trash2, CircleCheck, CircleAlert, Shield } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        department: '',
        phone: ''
    });

    const fetchUsers = useCallback(async () => {
        try {
            const data = await getAllUsers({ search: searchTerm });
            setUsers(data.users);
        } catch (error) {
            toast.error(error, 'Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await createUser(newUser);
            toast.success('User created successfully');
            setShowAddModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'student', department: '', phone: '' });
            fetchUsers();
        } catch (error) {
            toast.error(error, 'Failed to create user');
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            toast.success('Role updated');
            fetchUsers();
        } catch (error) {
            toast.error(error, 'Failed to update role');
        }
    };

    const handleBanToggle = async (userId) => {
        if (!window.confirm('Are you sure you want to change this user\'s ban status?')) return;
        try {
            await toggleUserBan(userId);
            toast.success('User status updated');
            fetchUsers();
        } catch (error) {
            toast.error(error, 'Failed to update user status');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure? This action cannot be undone.')) return;
        try {
            await deleteUser(userId);
            toast.success('User deleted');
            fetchUsers();
        } catch (error) {
            toast.error(error, 'Failed to delete user');
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-text-main">User Management</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <UserPlus className="w-5 h-5" />
                    Add User
                </button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="input !pl-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <UserSearch className="w-5 h-5 text-text-muted absolute left-4 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <button type="submit" className="btn btn-outline">Search</button>
                </div>
            </form>

            {/* Users Table */}
            <div className="bg-bg-surface shadow-sm rounded-lg overflow-hidden border border-border-main">
                <table className="min-w-full divide-y divide-border-main">
                    <thead className="bg-bg-main">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-bg-surface divide-y divide-border-main">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-bg-main/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-text-main">{user.name}</div>
                                            <div className="text-sm text-text-muted">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {user.role === 'admin' && <Shield className="w-4 h-4 text-brand-primary" />}
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                                            className="text-sm bg-bg-main text-text-main border-border-main rounded-md shadow-sm focus:border-brand-primary focus:ring-brand-primary"
                                        >
                                            <option value="student">Student</option>
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${user.isBanned
                                        ? 'bg-brand-danger/10 text-brand-danger'
                                        : user.verified
                                            ? 'bg-brand-success/10 text-brand-success'
                                            : 'bg-brand-warning/10 text-brand-warning'
                                        }`}>
                                        {user.isBanned ? (
                                            <>
                                                <Ban className="w-3 h-3" /> Banned
                                            </>
                                        ) : user.verified ? (
                                            <>
                                                <CircleCheck className="w-3 h-3" /> Active
                                            </>
                                        ) : (
                                            <>
                                                <CircleAlert className="w-3 h-3" /> Unverified
                                            </>
                                        )}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleBanToggle(user._id)}
                                        className={`${user.isBanned ? 'text-brand-success hover:text-brand-success-hover' : 'text-brand-danger hover:text-brand-danger-hover'} mr-4 flex items-center gap-1 inline-flex transition-colors`}
                                        title={user.isBanned ? 'Unban User' : 'Ban User'}
                                    >
                                        {user.isBanned ? <CircleCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                        {user.isBanned ? 'Unban' : 'Ban'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        className="text-text-muted hover:text-text-main flex items-center gap-1 inline-flex transition-colors"
                                        title="Delete User"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-surface p-8 rounded-2xl shadow-xl w-full max-w-md border border-border-main relative">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-text-main">Add New User</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-main">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input mt-1"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="input mt-1"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <PasswordField
                                id="password"
                                name="password"
                                label="Password"
                                required
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                autoComplete="new-password"
                            />
                            <div>
                                <label className="block text-sm font-medium text-text-main">Role</label>
                                <select
                                    className="input mt-1 bg-bg-main"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="student">Student</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
