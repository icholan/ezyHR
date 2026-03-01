import { useState, useEffect } from 'react';
import api from '../services/api';
import DatePicker from '../components/DatePicker';
import SearchableSelect from '../components/SearchableSelect';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        entityType: '',
        startDate: '',
        endDate: ''
    });

    const actionOptions = [
        { value: "LOGIN", label: "Login" },
        { value: "SIGNUP", label: "Signup" },
        { value: "CREATE_EMPLOYEE", label: "Create Employee" },
        { value: "UPDATE_EMPLOYEE", label: "Update Employee" },
        { value: "DELETE_EMPLOYEE", label: "Delete Employee" },
        { value: "PROCESS_PAYROLL", label: "Process Payroll" },
        { value: "APPROVE_LEAVE", label: "Approve Leave" },
        { value: "REJECT_LEAVE", label: "Reject Leave" },
        { value: "SUBMIT_LEAVE", label: "Submit Leave" },
        { value: "UPDATE_ENTITY", label: "Update Entity" }
    ];

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await api.getAuditLogs(filters);
            setLogs(data);
        } catch (err) {
            Swal.fire('Error', 'Failed to load audit logs: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const formatJSON = (json) => {
        if (!json) return 'N/A';
        try {
            const obj = typeof json === 'string' ? JSON.parse(json) : json;
            return JSON.stringify(obj, null, 2);
        } catch (e) {
            return String(json);
        }
    };

    const getDiff = (oldVal, newVal) => {
        const oldObj = typeof oldVal === 'string' ? JSON.parse(oldVal || '{}') : (oldVal || {});
        const newObj = typeof newVal === 'string' ? JSON.parse(newVal || '{}') : (newVal || {});

        const diff = [];
        const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

        allKeys.forEach(key => {
            const o = oldObj[key];
            const n = newObj[key];

            if (JSON.stringify(o) !== JSON.stringify(n)) {
                const formatValue = (v) => {
                    if (v === null || v === undefined) return '<span class="text-rose-400 italic">null</span>';
                    if (typeof v === 'object') return `<pre class="text-[10px] m-0">${JSON.stringify(v, null, 2)}</pre>`;
                    return String(v);
                };

                diff.push({
                    field: key.replace(/_/g, ' ').toUpperCase(),
                    old: formatValue(o),
                    new: formatValue(n)
                });
            }
        });
        return diff;
    };

    const showDetails = (log) => {
        const changes = getDiff(log.old_values, log.new_values);

        Swal.fire({
            title: `<span class="text-xl font-bold">Log Details: ${log.action.replace('_', ' ')}</span>`,
            html: `
                <div class="text-left space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-2">
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div class="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-main)]">
                            <p class="text-[10px] text-[var(--text-muted)] font-bold uppercase mb-1">Entity Type</p>
                            <p class="font-semibold text-xs">${log.entity_type}</p>
                        </div>
                        <div class="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-main)]">
                            <p class="text-[10px] text-[var(--text-muted)] font-bold uppercase mb-1">Target ID</p>
                            <p class="font-semibold text-xs">${log.entity_id || 'N/A'}</p>
                        </div>
                        <div class="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-main)]">
                            <p class="text-[10px] text-[var(--text-muted)] font-bold uppercase mb-1">IP Address</p>
                            <p class="font-semibold font-mono text-xs">${log.ip_address || 'Internal'}</p>
                        </div>
                        <div class="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-main)]">
                            <p class="text-[10px] text-[var(--text-muted)] font-bold uppercase mb-1">Performed By</p>
                            <p class="font-semibold text-xs">${log.user_name || 'System'} (@${log.username || 'internal'})</p>
                        </div>
                    </div>

                    ${changes.length > 0 ? `
                        <div class="space-y-2">
                            <p class="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Modified Fields</p>
                            <div class="border border-[var(--border-main)] rounded-xl overflow-hidden shadow-sm bg-[var(--bg-card)]">
                                <table class="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr class="bg-[var(--bg-input)]/50 border-b border-[var(--border-main)]">
                                            <th class="px-3 py-2 font-bold w-1/4">Field</th>
                                            <th class="px-3 py-2 font-bold w-3/8 text-rose-500">Old Value</th>
                                            <th class="px-3 py-2 font-bold w-3/8 text-emerald-500">New Value</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-[var(--border-main)]">
                                        ${changes.map(c => `
                                            <tr class="hover:bg-[var(--bg-input)]/20">
                                                <td class="px-3 py-2 font-bold text-[var(--text-muted)]">${c.field}</td>
                                                <td class="px-3 py-2 text-rose-400 font-medium break-all bg-rose-500/5">${c.old}</td>
                                                <td class="px-3 py-2 text-emerald-400 font-medium break-all bg-emerald-500/5">${c.new}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ` : `
                        <div class="p-4 bg-[var(--bg-input)]/50 rounded-xl text-center">
                            <p class="text-sm font-medium text-[var(--text-muted)]">No field-level comparisons available for this action.</p>
                        </div>
                    `}

                    <div class="space-y-1">
                        <details class="group">
                            <summary class="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest list-none cursor-pointer p-1 hover:bg-[var(--bg-input)] rounded transition-all flex items-center justify-between">
                                <span>Raw JSON Data</span>
                                <span class="group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                <div class="space-y-1">
                                    <p class="text-[9px] font-bold text-rose-400 uppercase pl-1">Old Record</p>
                                    <pre class="p-3 rounded-xl bg-gray-900 text-gray-400 text-[10px] font-mono whitespace-pre-wrap border border-gray-800">${formatJSON(log.old_values)}</pre>
                                </div>
                                <div class="space-y-1">
                                    <p class="text-[9px] font-bold text-emerald-400 uppercase pl-1">New Record</p>
                                    <pre class="p-3 rounded-xl bg-gray-900 text-gray-400 text-[10px] font-mono whitespace-pre-wrap border border-gray-800">${formatJSON(log.new_values)}</pre>
                                </div>
                            </div>
                        </details>
                    </div>
                </div>
            `,
            width: '850px',
            confirmButtonText: 'Great, Close',
            confirmButtonColor: 'var(--brand-primary)',
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            customClass: {
                popup: 'glass-card border border-[var(--border-main)] rounded-2xl shadow-2xl'
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-sm text-[var(--text-muted)]">Track system changes and user activities</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-xl shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all text-sm font-semibold flex items-center gap-2"
                >
                    <span>🔄</span> Refresh Logs
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-6 rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)]/50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <SearchableSelect
                        label="Action"
                        options={actionOptions}
                        value={filters.action}
                        onChange={(val) => setFilters(prev => ({ ...prev, action: val }))}
                        placeholder="Search actions..."
                    />
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[var(--text-muted)]">Entity Type</label>
                        <input
                            name="entityType"
                            placeholder="e.g. employees"
                            value={filters.entityType}
                            onChange={handleFilterChange}
                            className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[var(--brand-primary)]/20 outline-none transition-all h-[42px]"
                        />
                    </div>
                    <DatePicker
                        label="From Date"
                        selected={filters.startDate}
                        onChange={(val) => setFilters(prev => ({ ...prev, startDate: val }))}
                        placeholderText="Select date"
                    />
                    <DatePicker
                        label="To Date"
                        selected={filters.endDate}
                        onChange={(val) => setFilters(prev => ({ ...prev, endDate: val }))}
                        placeholderText="Select date"
                    />
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => {
                            setFilters({ action: '', entityType: '', startDate: '', endDate: '' });
                            fetchLogs();
                        }}
                        className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors"
                    >
                        Clear All Filters
                    </button>
                    <button
                        onClick={fetchLogs}
                        className="ml-4 px-6 py-2 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-xl font-bold text-sm hover:bg-[var(--brand-primary)] hover:text-white transition-all border border-[var(--brand-primary)]/20"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="glass-card overflow-hidden rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border-main)] bg-[var(--bg-input)]/50">
                                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Time</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Action</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Target</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-main)]">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4"><div className="h-4 bg-[var(--bg-input)] rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-[var(--text-muted)] font-medium">
                                        No audit records found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} className="hover:bg-[var(--bg-input)]/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-[var(--text-main)]">
                                                    {new Date(log.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] text-[var(--text-muted)] font-medium">
                                                    {new Date(log.created_at).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)] text-[10px] font-bold">
                                                    {(log.user_name || log.username || 'S').charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold">{log.user_name || 'System'}</span>
                                                    <span className="text-[9px] text-[var(--text-muted)]">@{log.username || 'internal'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${log.action.includes('DELETE') || log.action.includes('REJECT')
                                                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                                : log.action.includes('CREATE') || log.action.includes('SIGNUP') || log.action.includes('APPROVE')
                                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                    : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                                }`}>
                                                {log.action.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-[var(--text-main)]">{log.entity_type}</span>
                                                <span className="text-[10px] text-[var(--text-muted)] font-mono">ID: {log.entity_id || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => showDetails(log)}
                                                className="p-2 text-[var(--text-muted)] hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 rounded-lg transition-all"
                                            >
                                                🔍 View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && logs.length > 0 && (
                    <div className="px-6 py-4 bg-[var(--bg-input)]/30 border-t border-[var(--border-main)] flex justify-between items-center">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                            Showing {logs.length} records
                        </span>
                        <div className="flex items-center gap-1 opacity-50 cursor-not-allowed">
                            <button className="p-1 px-3 text-xs font-bold border rounded-lg">Prev</button>
                            <button className="p-1 px-3 text-xs font-bold border rounded-lg">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
