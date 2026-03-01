import { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

export default function PlatformAdmin() {
    const [tenants, setTenants] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
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
                                    <button
                                        onClick={() => handleUpdateTenant(tenant)}
                                        className="p-2 hover:bg-[var(--brand-primary)]/10 rounded-lg text-[var(--brand-primary)] transition-all"
                                    >
                                        ⚙️ Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
