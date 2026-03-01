import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Check, Building2, Clock, Rocket, ChevronRight, ChevronLeft, LogOut } from 'lucide-react'
import api from '../services/api'
import Swal from 'sweetalert2'

export default function OnboardingWizard() {
    const { user, refreshUser, logout } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(user?.onboardingStep || 1);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        // Step 1: Profile
        companyName: user?.tenantName || '',
        uen: '',
        address: '',
        // Step 2: Operations
        startTime: '09:00',
        endTime: '18:00',
        lunchBreakMins: 60,
        workingDaysPerWeek: 5
    });

    const handleNext = async () => {
        if (step === 1) {
            if (!form.companyName || !form.uen || !form.address) {
                return Swal.fire({
                    icon: 'warning',
                    title: 'Missing Information',
                    text: 'Please provide both UEN and Registered Address to continue.',
                    confirmButtonColor: 'var(--brand-primary)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    customClass: {
                        popup: 'glass-card border border-[var(--border-main)] rounded-2xl'
                    }
                });
            }
        }

        setLoading(true);
        try {
            if (step === 1) {
                await fetch('/api/onboarding/step-1', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('hrms_token')}`
                    },
                    body: JSON.stringify({
                        companyName: form.companyName,
                        address: form.address,
                        uen: form.uen
                    })
                });
                setStep(2);
            } else if (step === 2) {
                await fetch('/api/onboarding/step-2', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('hrms_token')}`
                    },
                    body: JSON.stringify({
                        startTime: form.startTime,
                        endTime: form.endTime,
                        lunchBreakMins: form.lunchBreakMins,
                        workingDaysPerWeek: form.workingDaysPerWeek
                    })
                });
                setStep(3);
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            await fetch('/api/onboarding/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('hrms_token')}`
                }
            });
            await refreshUser();
            navigate('/dashboard');
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, name: 'Company Profile', icon: <Building2 className="w-5 h-5" /> },
        { id: 2, name: 'Operations Setup', icon: <Clock className="w-5 h-5" /> },
        { id: 3, name: 'Finish Setup', icon: <Rocket className="w-5 h-5" /> }
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-6 relative">
            {/* Logout Icon */}
            <button
                onClick={() => {
                    Swal.fire({
                        title: 'Sign Out?',
                        text: 'Are you sure you want to log out?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonColor: 'var(--brand-primary)',
                        cancelButtonColor: '#6b7280',
                        confirmButtonText: 'Yes, Sign Out'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            logout();
                            navigate('/login');
                        }
                    });
                }}
                className="absolute top-8 right-8 p-3 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all group"
                title="Sign Out"
            >
                <LogOut className="w-6 h-6" />
            </button>

            <div className="w-full max-w-2xl">
                {/* Progress Header */}
                <div className="mb-12">
                    <div className="flex justify-between items-center relative">
                        {/* Progress Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-[var(--border-main)] -translate-y-1/2 z-0"></div>
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-[var(--brand-primary)] -translate-y-1/2 z-0 transition-all duration-500"
                            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                        ></div>

                        {steps.map((s) => (
                            <div key={s.id} className="relative z-10 flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${step > s.id ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white' :
                                    step === s.id ? 'bg-[var(--bg-card)] border-[var(--brand-primary)] text-[var(--brand-primary)] animate-pulse-subtle' :
                                        'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-muted)]'
                                    }`}>
                                    {step > s.id ? <Check className="w-6 h-6" /> : s.icon}
                                </div>
                                <span className={`mt-3 text-sm font-bold transition-colors ${step >= s.id ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'
                                    }`}>{s.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Wizard Card */}
                <div className="glass-card border border-[var(--border-main)] rounded-3xl p-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-primary)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                    {step === 1 && (
                        <div className="animate-slide-in">
                            <h2 className="text-3xl font-extrabold text-[var(--text-main)] mb-2">Welcome to ezyHR!</h2>
                            <p className="text-[var(--text-muted)] mb-8">Let's start by confirming your organization details.</p>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-bold text-[var(--text-main)]">Company Registered Name</label>
                                        <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-main)] px-2 py-0.5 rounded border border-[var(--border-main)] flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                            Locked
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        className="input-base bg-[var(--bg-main)]/50 cursor-not-allowed opacity-75 font-semibold text-[var(--text-muted)]"
                                        value={form.companyName}
                                        readOnly
                                    />
                                    <p className="mt-2 text-[10px] text-[var(--text-muted)] leading-relaxed italic">
                                        * This name was verified during your registration and cannot be modified.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-[var(--text-main)] mb-2">UEN (Business Reg No.) <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            className="input-base"
                                            value={form.uen}
                                            onChange={e => setForm({ ...form, uen: e.target.value })}
                                            placeholder="e.g. 202312345Z"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[var(--text-main)] mb-2">Registered Address <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            className="input-base"
                                            value={form.address}
                                            onChange={e => setForm({ ...form, address: e.target.value })}
                                            placeholder="e.g. 10 Anson Road, Singapore..."
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-slide-in">
                            <h2 className="text-3xl font-extrabold text-[var(--text-main)] mb-2">Operations Setup</h2>
                            <p className="text-[var(--text-muted)] mb-8">Set your default working hours and operational calendar.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-main)] mb-2">Default Start Time</label>
                                    <input
                                        type="time"
                                        className="input-base"
                                        value={form.startTime}
                                        onChange={e => setForm({ ...form, startTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-main)] mb-2">Default End Time</label>
                                    <input
                                        type="time"
                                        className="input-base"
                                        value={form.endTime}
                                        onChange={e => setForm({ ...form, endTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-main)] mb-2">Lunch Break (Mins)</label>
                                    <input
                                        type="number"
                                        className="input-base"
                                        value={form.lunchBreakMins}
                                        onChange={e => setForm({ ...form, lunchBreakMins: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-main)] mb-2">Working Days Per Week</label>
                                    <select
                                        className="input-base"
                                        value={form.workingDaysPerWeek}
                                        onChange={e => setForm({ ...form, workingDaysPerWeek: parseInt(e.target.value) })}
                                    >
                                        <option value={5}>5 Days (Mon - Fri)</option>
                                        <option value={5.5}>5.5 Days (Mon - Sat AM)</option>
                                        <option value={6}>6 Days (Mon - Sat)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-slide-in text-center py-8">
                            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-12 h-12" />
                            </div>
                            <h2 className="text-4xl font-black text-[var(--text-main)] mb-4">You're All Set! 🚀</h2>
                            <p className="text-[var(--text-muted)] text-lg mb-8 max-w-md mx-auto">
                                Great job! Your workspace is configured and ready to go. You can now start adding employees and run payroll.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-12 flex items-center justify-between pt-8 border-t border-[var(--border-main)]">
                        <button
                            onClick={() => setStep(step - 1)}
                            disabled={step === 1 || loading}
                            className={`flex items-center gap-2 font-bold transition-all ${step === 1 ? 'opacity-0' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                        >
                            <ChevronLeft className="w-5 h-5" /> Back
                        </button>

                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={loading}
                                className="btn-primary py-3 px-10 rounded-2xl flex items-center gap-3 font-bold text-lg"
                            >
                                {loading ? 'Saving...' : <>Next <ChevronRight className="w-5 h-5" /></>}
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={loading}
                                className="btn-primary py-3 px-12 rounded-2xl flex items-center gap-3 font-bold text-lg bg-gradient-to-r from-emerald-500 to-teal-500 border-none shadow-lg shadow-emerald-500/20"
                            >
                                {loading ? 'Done...' : 'Go to Dashboard'}
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-center mt-8 text-xs text-[var(--text-muted)]">
                    Need help? Reach out to <span className="font-bold text-[var(--text-main)]">support@ezyhr.sg</span>
                </p>
            </div>
        </div>
    );
}
