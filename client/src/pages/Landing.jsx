import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-[var(--bg-main)] overflow-x-hidden font-sans">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[var(--bg-main)]/70 border-b border-[var(--border-main)]">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/ezyhr-logo.png" alt="ezyHR Logo" className="h-12 object-contain" />
                        <span className="text-xl font-bold bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] bg-clip-text text-transparent">ezyHR Singapore</span>
                    </div>
                    <div className="flex items-center gap-6">
                        {isAuthenticated ? (
                            <Link to="/" className="btn-primary py-2 px-6 text-sm">Go to Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-semibold text-[var(--text-main)] hover:text-[var(--brand-primary)] transition-colors">Log In</Link>
                                <Link to="/signup" className="btn-primary py-2 px-6 text-sm">Start Free Trial</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand-primary)] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--brand-primary)]"></span>
                            </span>
                            <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-widest">SaaS for Singapore Businesses</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-[var(--text-main)] leading-tight mb-6">
                            HR Management <br />
                            <span className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] bg-clip-text text-transparent">Made Simple.</span>
                        </h1>
                        <p className="text-lg text-[var(--text-muted)] mb-10 leading-relaxed max-w-xl">
                            The all-in-one HRMS built specifically for Singapore compliance. Manage Employees, Payroll, Leave, and Attendance with MOM, CPF, and IRAS integration out of the box.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/signup" className="btn-primary px-10 py-4 text-base text-center">Get Started for Free</Link>
                            <Link to="/login" className="px-10 py-4 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl text-[var(--text-main)] font-bold text-center hover:bg-[var(--bg-card)]/80 transition-all shadow-sm">View Demo</Link>
                        </div>
                        <div className="mt-10 flex items-center gap-6 opacity-70">
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-[var(--text-main)]">100%</span>
                                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">MOM Compliant</span>
                            </div>
                            <div className="w-px h-8 bg-[var(--border-main)]"></div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-[var(--text-main)]">GIRO</span>
                                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">Bank Ready</span>
                            </div>
                            <div className="w-px h-8 bg-[var(--border-main)]"></div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-[var(--text-main)]">IRAS</span>
                                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">AIS Integrated</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative animate-fade-in delay-200">
                        <div className="absolute -inset-10 bg-gradient-to-r from-[var(--brand-primary)]/20 to-[var(--brand-secondary)]/20 rounded-full blur-3xl opacity-30"></div>
                        <div className="glass-card p-4 rounded-[2.5rem] border border-white/50 shadow-2xl relative overflow-hidden group">
                            <div className="bg-[var(--bg-main)] rounded-[2rem] overflow-hidden border border-[var(--border-main)] aspect-video relative">
                                {/* Mockup UI Content */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6">
                                    <div className="flex gap-4 mb-6">
                                        <div className="w-1/3 h-24 rounded-2xl bg-[var(--bg-card)] shadow-sm border border-[var(--border-main)] p-4 flex flex-col justify-between">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">👥</div>
                                            <div className="h-2 w-16 bg-[var(--bg-input)] rounded"></div>
                                            <div className="h-3 w-8 bg-[var(--bg-input)]/50 rounded"></div>
                                        </div>
                                        <div className="w-1/3 h-24 rounded-2xl bg-[var(--bg-card)] shadow-sm border border-[var(--border-main)] p-4 flex flex-col justify-between">
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">💰</div>
                                            <div className="h-2 w-16 bg-[var(--bg-input)] rounded"></div>
                                            <div className="h-3 w-8 bg-[var(--bg-input)]/50 rounded"></div>
                                        </div>
                                        <div className="w-1/3 h-24 rounded-2xl bg-[var(--bg-card)] shadow-sm border border-[var(--border-main)] p-4 flex flex-col justify-between">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">📊</div>
                                            <div className="h-2 w-16 bg-[var(--bg-input)] rounded"></div>
                                            <div className="h-3 w-8 bg-[var(--bg-input)]/50 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-12 w-full rounded-xl bg-[var(--bg-card)]/50 border border-[var(--border-main)] flex items-center px-4 gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[var(--bg-input)]"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-2 w-24 bg-[var(--bg-input)] rounded"></div>
                                                <div className="h-1.5 w-16 bg-[var(--bg-input)]/50 rounded"></div>
                                            </div>
                                            <div className="h-5 w-16 rounded-full bg-emerald-500/50"></div>
                                        </div>
                                        <div className="h-12 w-full rounded-xl bg-[var(--bg-card)]/50 border border-[var(--border-main)] flex items-center px-4 gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[var(--bg-input)]"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-2 w-24 bg-[var(--bg-input)] rounded"></div>
                                                <div className="h-1.5 w-16 bg-[var(--bg-input)]/50 rounded"></div>
                                            </div>
                                            <div className="h-5 w-16 rounded-full bg-orange-500/50"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="w-20 h-20 rounded-full bg-[var(--brand-primary)] flex items-center justify-center text-white text-3xl shadow-xl border-4 border-white cursor-pointer hover:scale-110 transition-transform">▶</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-[var(--bg-card)] relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-bold text-[var(--text-main)] mb-4">Everything You Need To Grow</h2>
                        <p className="text-[var(--text-muted)] max-w-2xl mx-auto font-medium">Built from the ground up for the Singapore landscape. No more external spreadsheets or manual CPF calculations.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: '🏦', title: 'Seamless Payroll', desc: 'One-click payroll processing with automatic CPF contributions and GIRO bank file generation.' },
                            { icon: '📅', title: 'Smart Attendance', desc: 'QR and Face-based attendance system with real-time tracking and deep analytics.' },
                            { icon: '🇸🇬', title: 'Gov Integration', desc: 'Direct integration for IRAS AIS filing and MOM compliant leave/holiday management.' },
                            { icon: '🏢', title: 'Multi-Entity', desc: 'Manage multiple companies or branches under one tenant account with ease.' },
                            { icon: '🔒', title: 'Enterprise Secure', desc: 'SaaS Architecture with 100% data isolation for your business security.' },
                            { icon: '📱', title: 'Mobile Friendly', desc: 'Responsive design allowing you and your employees to access ezyHR from anywhere.' }
                        ].map((feat, i) => (
                            <div key={i} className="p-8 rounded-[2rem] border border-[var(--border-main)] bg-[var(--bg-main)] hover:border-[var(--brand-primary)]/30 hover:shadow-xl transition-all group">
                                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform inline-block">{feat.icon}</div>
                                <h3 className="text-xl font-bold text-[var(--text-main)] mb-3">{feat.title}</h3>
                                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-[var(--brand-primary)] to-[#4338ca] p-12 lg:p-20 text-center relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

                    <h2 className="text-4xl lg:text-6xl font-bold mb-6 relative z-10">Start Your HR Transformation Today.</h2>
                    <p className="text-lg opacity-90 mb-10 max-w-2xl mx-auto relative z-10 font-medium">Join hundreds of Singaporean businesses streamlining their HR operations with ezyHR.</p>
                    <Link to="/signup" className="inline-block px-12 py-5 bg-white text-[var(--brand-primary)] rounded-full text-lg font-bold hover:bg-white/90 transition-all hover:scale-105 shadow-xl relative z-10">Create Your Free Account</Link>
                    <p className="mt-6 text-sm opacity-70 relative z-10">No credit card required • MOM Compliant • 14-day free trial</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-[var(--border-main)]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <img src="/ezyhr-logo.png" alt="ezyHR" className="h-8 grayscale opacity-50" />
                        <span className="text-sm font-bold text-[var(--text-muted)]">ezyHR Singapore</span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">© 2026 ezyHR. All rights reserved. Built for Singapore Businesses.</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--brand-primary)]">Privacy</a>
                        <a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--brand-primary)]">Terms</a>
                        <a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--brand-primary)]">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
