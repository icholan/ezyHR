import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'
import api from '../services/api'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const data = await api.login(email, password)
            login(data.token, data.user)

            // Premium Success Alert
            Swal.fire({
                icon: 'success',
                title: 'Welcome Back!',
                text: `Successfully logged in as ${data.user.fullName}`,
                timer: 1500,
                showConfirmButton: false,
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                customClass: {
                    popup: 'glass-card border border-[var(--border-main)] rounded-2xl'
                }
            })

            navigate('/dashboard')
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: err.message || 'Invalid email or password',
                confirmButtonColor: 'var(--brand-primary)',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                customClass: {
                    popup: 'glass-card border border-[var(--border-main)] rounded-2xl'
                }
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card-base p-8 w-full max-w-md animate-slide-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <img src="/ezyhr-logo.png" alt="ezyHR Logo" className="h-48 mx-auto object-contain hover:scale-105 transition-transform" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👥</text></svg>" }} />
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-black tracking-[0.2em] uppercase bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent animate-pulse">
                            MOM · CPF · IRAS · Compliant HRMS
                        </span>
                        <div className="h-0.5 w-48 bg-gradient-to-r from-transparent via-[var(--brand-primary)] to-transparent opacity-50"></div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-base"
                            placeholder="Enter your business email"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-base"
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-[var(--border-main)] border-t-white rounded-full animate-spin" />
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-[var(--text-muted)] font-medium">Designed & Developed by Mathi & Team</p>
                </div>
            </div>
        </div>
    )
}
