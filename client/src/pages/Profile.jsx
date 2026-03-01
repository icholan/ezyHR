import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) setFullName(user.fullName);
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('hrms_token')}`
                },
                body: JSON.stringify({ fullName })
            });
            const data = await res.json();
            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated',
                    text: 'Your personal information has been saved.',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    customClass: { popup: 'glass-card border border-[var(--border-main)] rounded-2xl' },
                    buttonsStyling: false,
                    confirmButtonText: 'Great',
                    confirmButtonClass: 'btn-primary px-8 py-2 rounded-xl'
                });
                refreshUser();
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Update Failed', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return Swal.fire({ icon: 'warning', title: 'Mismatch', text: 'New passwords do not match.' });
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('hrms_token')}`
                },
                body: JSON.stringify({
                    oldPassword: passwords.old,
                    newPassword: passwords.new
                })
            });
            const data = await res.json();
            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Password Changed',
                    text: 'Security credentials updated successfully.',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    customClass: { popup: 'glass-card border border-[var(--border-main)] rounded-2xl' },
                    buttonsStyling: false,
                    confirmButtonText: 'Done'
                });
                setPasswords({ old: '', new: '', confirm: '' });
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Update Failed', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <header className="mb-10">
                <h1 className="text-3xl font-black tracking-tight mb-2">My Account</h1>
                <p className="text-[var(--text-muted)] text-sm">Manage your profile information and security settings</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Info */}
                <div className="card-base p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/20">
                            👤
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Personal Identity</h3>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black">Edit your public profile</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest mb-1.5 ml-1">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="input-base"
                                placeholder="Your Name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest mb-1.5 ml-1">Email / Username</label>
                            <input
                                type="text"
                                value={user?.username || ''}
                                className="input-base opacity-50 cursor-not-allowed"
                                disabled
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            {loading ? 'Saving...' : 'Update Personal Info'}
                        </button>
                    </form>
                </div>

                {/* Security Section */}
                <div className="card-base p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white text-xl shadow-lg shadow-rose-500/20">
                            🔒
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Access Security</h3>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black">Manage your credentials</p>
                        </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest mb-1.5 ml-1">Current Password</label>
                            <input
                                type="password"
                                value={passwords.old}
                                onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
                                className="input-base"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest mb-1.5 ml-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    className="input-base"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest mb-1.5 ml-1">Confirm New</label>
                                <input
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    className="input-base"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 rounded-2xl font-bold bg-[var(--bg-input)] border border-[var(--border-main)] hover:bg-rose-500 hover:text-white transition-all">
                            {loading ? 'Processing...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Organization Context */}
            <div className="card-base p-8 border-l-4 border-l-blue-500">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Membership Context</h4>
                        <p className="text-xl font-bold">Member of <span className="brand-text">{user?.tenantName}</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase font-black">Role Assignment</p>
                        <p className="text-sm font-bold bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full inline-block mt-1">
                            {user?.isSystemAdmin ? '🛡️ Platform Owner' : '👥 Organization User'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
