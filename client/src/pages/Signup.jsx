import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import api from '../services/api'
import Swal from 'sweetalert2'

export default function Signup() {
    const [form, setForm] = useState({
        companyName: '',
        fullName: '',
        username: '',
        password: '',
        billingEmail: ''
    });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Note: services/api should have a signup method or we use fetch
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Signup failed');

            Swal.fire({
                title: 'Congratulations! 🎉',
                html: `
                    <div class="space-y-4">
                        <p class="text-lg font-medium">Your workspace has been created successfully.</p>
                        <div class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <p class="text-amber-500 font-bold">Your account is waiting for Approval</p>
                            <p class="text-sm text-[var(--text-muted)] mt-1">Our team will review your application shortly.</p>
                        </div>
                        <p class="text-sm">If you have any questions, please contact:<br/>
                        <a href="mailto:admin@ezy.sg" class="text-[var(--brand-primary)] font-bold">admin@ezy.sg</a></p>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Great, take me back',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                customClass: {
                    popup: 'glass-card border border-[var(--border-main)] rounded-2xl p-6',
                    confirmButton: 'btn-primary py-2 px-8 rounded-xl'
                },
                buttonsStyling: false
            }).then(() => {
                navigate('/');
            });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-main)]">
            <div className="card-base p-10 w-full max-w-xl animate-slide-up border border-[var(--border-main)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-primary)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                {/* Header */}
                <div className="text-center mb-10">
                    <img src="/ezyhr-logo.png" alt="ezyHR Logo" className="h-16 mx-auto mb-4 object-contain" />
                    <h2 className="text-3xl font-extrabold text-[var(--text-main)] mb-2">Create Your Workspace</h2>
                    <p className="text-[var(--text-muted)] font-medium">Start managing your Singapore team with ezyHR.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-[var(--text-main)] mb-2">Company Name</label>
                            <input
                                type="text"
                                required
                                value={form.companyName}
                                onChange={e => setForm({ ...form, companyName: e.target.value })}
                                className="input-base"
                                placeholder="e.g. Acme Singapore Pte Ltd"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[var(--text-main)] mb-2">Full Name</label>
                            <input
                                type="text"
                                required
                                value={form.fullName}
                                onChange={e => setForm({ ...form, fullName: e.target.value })}
                                className="input-base"
                                placeholder="Admin Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[var(--text-main)] mb-2">Billing Email</label>
                            <input
                                type="email"
                                value={form.billingEmail}
                                onChange={e => setForm({ ...form, billingEmail: e.target.value })}
                                className="input-base"
                                placeholder="e.g. accounts@acme.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[var(--text-main)] mb-2">Work Email (Login ID)</label>
                            <input
                                type="email"
                                required
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                className="input-base"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[var(--text-main)] mb-2">Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="input-base"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Create Free Account ✨</>
                            )}
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <span className="text-sm text-[var(--text-muted)] font-medium">Already have an account? </span>
                        <Link to="/login" className="text-sm font-bold text-[var(--brand-primary)] hover:underline">Log In</Link>
                    </div>
                </form>

                <div className="mt-10 pt-8 border-t border-[var(--border-main)] flex items-center justify-center gap-6 opacity-60">
                    <img src="https://www.iras.gov.sg/images/default-source/iras-logo.png" alt="IRAS" className="h-6 object-contain grayscale" />
                    <img src="https://www.cpf.gov.sg/content/dam/cpf/header/logo-cpf.png" alt="CPF" className="h-6 object-contain grayscale" />
                </div>
            </div>
        </div>
    )
}
