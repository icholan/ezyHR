import { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

export default function PlatformAdmin() {
    const [tenants, setTenants] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [tenantEntities, setTenantEntities] = useState([]);
    const [tenantUsers, setTenantUsers] = useState([]);
    const [inspectLoading, setInspectLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tenantsData, statsData] = await Promise.all([
                fetch('/api/admin/tenants', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('hrms_token')}` }
                }).then(res => res.json()),
                fetch('/api/admin/stats', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('hrms_token')}` }
                }).then(res => res.json())
            ]);
            setTenants(tenantsData);
            setStats(statsData);
        } catch (err) {
            console.error('Failed to fetch admin data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTenant = async (tenant) => {
        const { value: formValues } = await Swal.fire({
            title: 'Manage Organization',
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            customClass: {
                popup: 'glass-card border border-[var(--border-main)] rounded-3xl p-6',
                title: 'text-xl font-bold tracking-tight mb-4',
                confirmButton: 'btn-primary py-2 px-6 rounded-xl',
                cancelButton: 'px-6 py-2 rounded-xl text-sm font-medium hover:bg-[var(--bg-main)] transition-colors'
            },
            html: `
                <div class="space-y-5 text-left py-4">
                    <div>
                        <label class="block text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 px-1">Organization Status</label>
                        <select id="swal-status" class="select-base">
                            <option value="active" ${tenant.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="suspended" ${tenant.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                            <option value="pending" ${tenant.status === 'pending' ? 'selected' : ''}>Pending</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 px-1">Subscription Tier</label>
                        <select id="swal-plan" class="select-base">
                            <option value="starter" ${tenant.subscription_plan === 'starter' ? 'selected' : ''}>Starter</option>
                            <option value="pro" ${tenant.subscription_plan === 'pro' ? 'selected' : ''}>Professional</option>
                            <option value="enterprise" ${tenant.subscription_plan === 'enterprise' ? 'selected' : ''}>Enterprise</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 px-1">Entity Quota Limit</label>
                        <input id="swal-max" type="number" value="${tenant.max_entities || 5}" class="input-base" placeholder="Max entities allowed">
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Save Changes',
            buttonsStyling: false,
            preConfirm: () => {
                return {
                    status: document.getElementById('swal-status').value,
                    subscription_plan: document.getElementById('swal-plan').value,
                    max_entities: parseInt(document.getElementById('swal-max').value)
                }
            }
        });

        if (formValues) {
            try {
                const res = await fetch(`/api/admin/tenants/${tenant.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('hrms_token')}`
                    },
                    body: JSON.stringify(formValues)
                });
                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Settings Updated',
                        text: 'Organization configuration saved successfully.',
                        confirmButtonText: 'Done',
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        customClass: {
                            popup: 'glass-card border border-[var(--border-main)] rounded-2xl p-6',
                            confirmButton: 'btn-primary py-2 px-8 rounded-xl'
                        },
                        buttonsStyling: false
                    });
                    fetchData();
                }
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Update Error',
                    text: err.message,
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    customClass: {
                        popup: 'glass-card border border-[var(--border-main)] rounded-2xl p-6',
                        confirmButton: 'btn-primary py-2 px-8 rounded-xl'
                    },
                    buttonsStyling: false
                });
            }
        }
    };

    const handleApproveTenant = async (tenant) => {
        const result = await Swal.fire({
            title: 'Approve Organization?',
            text: `Are you sure you want to approve "${tenant.name}"? This will allow them to log in and access the system.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Approve',
            cancelButtonText: 'Not Now',
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            customClass: {
                popup: 'glass-card border border-[var(--border-main)] rounded-2xl p-6',
                confirmButton: 'btn-primary py-2 px-8 rounded-xl',
                cancelButton: 'px-6 py-2 rounded-xl text-sm font-medium hover:bg-[var(--bg-main)] transition-colors'
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/admin/tenants/${tenant.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('hrms_token')}`
                    },
                    body: JSON.stringify({ status: 'active' })
                });
                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Approved!',
                        text: 'Organization account is now active.',
                        confirmButtonText: 'Great',
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        customClass: {
                            popup: 'glass-card border border-[var(--border-main)] rounded-2xl p-6',
                            confirmButton: 'btn-primary py-2 px-8 rounded-xl'
                        },
                        buttonsStyling: false
                    });
                    fetchData();
                }
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Approval Failed',
                    text: err.message,
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    customClass: {
                        popup: 'glass-card border border-[var(--border-main)] rounded-2xl p-6',
                        confirmButton: 'btn-primary py-2 px-8 rounded-xl'
                    },
                    buttonsStyling: false
                });
            }
        }
    };

    const handleInspectTenant = async (tenant) => {
        setSelectedTenant(tenant);
        setInspectLoading(true);
        try {
            const [entities, users] = await Promise.all([
                fetch(`/api/admin/tenants/${tenant.id}/entities`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('hrms_token')}` }
                }).then(res => res.json()),
                fetch(`/api/admin/tenants/${tenant.id}/users`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('hrms_token')}` }
                }).then(res => res.json())
            ]);
            setTenantEntities(entities);
            setTenantUsers(users);
        } catch (err) {
            console.error('Failed to fetch tenant details', err);
        } finally {
            setInspectLoading(false);
        }
    };

    const handleResetUserPassword = async (user) => {
        const { value: newPassword } = await Swal.fire({
            title: 'Reset Password',
            text: `Set new password for ${user.username}`,
            input: 'password',
            inputPlaceholder: 'Enter new password',
            inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Reset Now',
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            customClass: {
                popup: 'glass-card border border-[var(--border-main)] rounded-2xl p-6',
                confirmButton: 'btn-primary py-2 px-8 rounded-xl',
                input: 'input-base my-4'
            },
            buttonsStyling: false
        });

        if (newPassword) {
            try {
                const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('hrms_token')}`
                    },
                    body: JSON.stringify({ newPassword })
                });
                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Password has been updated.',
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        customClass: {
                            popup: 'glass-card border border-[var(--border-main)] rounded-2xl',
                            confirmButton: 'btn-primary py-2 px-8 rounded-xl'
                        },
                        buttonsStyling: false
                    });
                }
            } catch (err) {
                console.error('Failed to reset password', err);
            }
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading platform data...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Platform Administration</h1>
                    <p className="text-sm text-[var(--text-muted)]">Global SaaS control panel for platform owners</p>
                </div>
                <div className="flex gap-4">
                    <div className="glass-card px-4 py-2 rounded-xl border border-[var(--border-main)] text-center">
                        <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Total Tenants</p>
                        <p className="text-xl font-black brand-text">{stats?.total_tenants || 0}</p>
                    </div>
                    <div className="glass-card px-4 py-2 rounded-xl border border-[var(--border-main)] text-center">
                        <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Total Employees</p>
                        <p className="text-xl font-black brand-text">{stats?.total_employees || 0}</p>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-2xl border border-[var(--border-main)] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[var(--bg-input)] border-b border-[var(--border-main)]">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Organization</th>
                            <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Plan</th>
                            <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Entities</th>
                            <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Employees</th>
                            <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Joined</th>
                            <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-main)]">
                        {tenants.map(tenant => (
                            <tr key={tenant.id} className="hover:bg-[var(--brand-primary)]/5 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-sm">{tenant.name}</p>
                                    <p className="text-[10px] text-[var(--text-muted)]">{tenant.billing_email}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tenant.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                                        tenant.status === 'suspended' ? 'bg-rose-500/10 text-rose-500' :
                                            'bg-amber-500/10 text-amber-500'
                                        }`}>
                                        {tenant.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 capitalize text-sm font-medium">{tenant.subscription_plan}</td>
                                <td className="px-6 py-4 text-sm">{tenant.entity_count} / {tenant.max_entities}</td>
                                <td className="px-6 py-4 text-sm font-bold">{tenant.employee_count}</td>
                                <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                                    {new Date(tenant.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {tenant.status === 'pending' && (
                                            <button
                                                onClick={() => handleApproveTenant(tenant)}
                                                className="p-2 px-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg border border-emerald-500/20 transition-all flex items-center gap-1 text-xs font-bold"
                                            >
                                                ✅ Approve
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleInspectTenant(tenant)}
                                            className="p-2 hover:bg-[var(--brand-primary)]/10 rounded-lg text-[var(--brand-primary)] transition-all flex items-center gap-1 text-xs font-bold"
                                        >
                                            👁️ Inspect
                                        </button>
                                        <button
                                            onClick={() => handleUpdateTenant(tenant)}
                                            className="p-2 hover:bg-[var(--brand-primary)]/10 rounded-lg text-[var(--text-muted)] transition-all flex items-center gap-1 text-xs font-bold"
                                        >
                                            ⚙️ Settings
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedTenant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all">
                    <div className="card-base p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-slide-up relative bg-[var(--bg-main)] border border-[var(--border-main)]">
                        <button
                            onClick={() => setSelectedTenant(null)}
                            className="absolute top-6 right-6 text-2xl text-[var(--text-muted)] hover:text-white transition-colors"
                        >
                            ×
                        </button>

                        <div className="mb-8">
                            <h2 className="text-3xl font-black">{selectedTenant.name}</h2>
                            <p className="text-[var(--text-muted)]">Detailed infrastructure view for tenant ID: <span className="font-mono text-[var(--brand-primary)] text-xs">{selectedTenant.id}</span></p>
                        </div>

                        {inspectLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="loading-spinner" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Entities Column */}
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 flex items-center gap-2">
                                        🏢 Entities / Companies <span className="bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] px-2 py-0.5 rounded-full text-[10px]">{tenantEntities.length}</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {tenantEntities.map(ent => (
                                            <div key={ent.id} className="glass-card p-4 rounded-xl border border-[var(--border-main)] hover:border-[var(--brand-primary)]/50 transition-colors">
                                                <p className="font-bold text-sm">{ent.name}</p>
                                                <div className="flex gap-4 mt-2">
                                                    <p className="text-[10px] text-[var(--text-muted)]">UEN: <span className="text-white">{ent.uen || 'N/A'}</span></p>
                                                    <p className="text-[10px] text-[var(--text-muted)]">Type: <span className="text-white uppercase">{ent.type}</span></p>
                                                </div>
                                            </div>
                                        ))}
                                        {tenantEntities.length === 0 && <p className="text-xs italic text-[var(--text-muted)]">No entities found.</p>}
                                    </div>
                                </div>

                                {/* Users Column */}
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 flex items-center gap-2">
                                        👤 Console Users <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-[10px]">{tenantUsers.length}</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {tenantUsers.map(u => (
                                            <div key={u.id} className="glass-card p-4 rounded-xl border border-[var(--border-main)] flex items-center justify-between group">
                                                <div>
                                                    <p className="font-bold text-sm">{u.full_name}</p>
                                                    <p className="text-[10px] text-[var(--brand-primary)] font-mono">{u.username}</p>
                                                    <p className="text-[9px] text-[var(--text-muted)] mt-1">Roles: {u.roles || 'None'}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleResetUserPassword(u)}
                                                    className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-bold rounded-lg border border-rose-500/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                                >
                                                    Reset Password
                                                </button>
                                            </div>
                                        ))}
                                        {tenantUsers.length === 0 && <p className="text-xs italic text-[var(--text-muted)]">No users found.</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
