import React from 'react';
import { TrendingUp, Users, Wallet, ArrowUpRight, ArrowDownRight, FileText, ChevronRight, PieChart } from 'lucide-react';
import { formatCurrency, formatMonth } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

const PayrollResultsVisualizer = ({ run, payslips, onBack }) => {
    const navigate = useNavigate();

    if (!run || !payslips) return null;

    const totalGross = Number(run.total_gross);
    const totalCPF = Number(run.total_cpf_employee) + Number(run.total_cpf_employer);
    const totalNet = Number(run.total_net);
    const totalSDL = Number(run.total_sdl);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div className="relative group overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br from-cyan-500/20 to-blue-600/5 border border-cyan-500/20 shadow-xl shadow-cyan-500/5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase tracking-wider">
                            <ArrowUpRight className="w-3 h-3" /> Total Gross
                        </span>
                    </div>
                    <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tight">{formatCurrency(totalGross)}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">Monthly Payroll Expense</p>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <TrendingUp className="w-32 h-32" />
                    </div>
                </div>

                <div className="relative group overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 to-purple-600/5 border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-full uppercase tracking-wider">
                            CPF Board
                        </span>
                    </div>
                    <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tight">{formatCurrency(totalCPF)}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">Combined EE & ER Contribution</p>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <Users className="w-32 h-32" />
                    </div>
                </div>

                <div className="relative group overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 to-teal-600/5 border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase tracking-wider">
                            Net Payout
                        </span>
                    </div>
                    <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tight">{formatCurrency(totalNet)}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">Total Employee Disposable Income</p>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <Wallet className="w-32 h-32" />
                    </div>
                </div>

                <div className="hidden lg:block relative group overflow-hidden p-6 rounded-[2rem] bg-[var(--bg-card)] border border-[var(--border-main)] shadow-xl">
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Stats Overview</p>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[var(--text-muted)]">Run ID</span>
                                    <span className="font-mono text-[var(--text-main)]">#{run.id.toString().slice(-4)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[var(--text-muted)]">Group</span>
                                    <span className="badge-neutral !text-[9px]">{run.employee_group}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[var(--text-muted)]">SDL Total</span>
                                    <span className="text-orange-400 font-bold">{formatCurrency(totalSDL)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-[var(--border-main)]">
                            <div className="flex items-center gap-2 text-xs font-bold text-[var(--brand-primary)]">
                                <PieChart className="w-3 h-3" /> Distribution Report
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Employee Record Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {payslips.map((ps, idx) => (
                    <div
                        key={ps.id}
                        className="group bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2.5rem] overflow-hidden hover:border-[var(--brand-primary)]/40 hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        {/* Card Header */}
                        <div className="p-6 pb-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--brand-primary)]/20 to-blue-500/10 flex items-center justify-center text-[var(--brand-primary)] font-black text-lg border border-[var(--brand-primary)]/10">
                                    {ps.employee_name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-[var(--text-main)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-1">{ps.employee_name}</h4>
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">ID: {ps.employee_code}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-0.5">Basic Salary</p>
                                <p className="text-sm font-bold text-[var(--text-main)] italic">{formatCurrency(ps.basic_salary)}</p>
                            </div>
                        </div>

                        {/* Card Body - Insights */}
                        <div className="px-6 grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-3xl bg-[var(--bg-input)]/40 border border-[var(--border-main)]">
                                <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" /> Earnings
                                </p>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-[var(--text-muted)]">Allowances</span>
                                        <span className="text-[var(--text-main)]">{formatCurrency(ps.total_allowances)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-[var(--text-muted)]">OT Pay</span>
                                        <span className="text-cyan-400 font-bold">{formatCurrency(Number(ps.ot_1_5_pay) + Number(ps.ot_2_0_pay) + Number(ps.ph_worked_pay))}</span>
                                    </div>
                                    <div className="pt-1.5 mt-1.5 border-t border-[var(--border-main)] flex justify-between text-xs font-black text-[var(--text-main)]">
                                        <span>Gross</span>
                                        <span>{formatCurrency(ps.gross_pay)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-3xl bg-[var(--bg-input)]/40 border border-[var(--border-main)]">
                                <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                                    <ArrowDownRight className="w-3 h-3" /> Deductions
                                </p>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-[var(--text-muted)]">EE CPF</span>
                                        <span className="text-[var(--text-main)]">{formatCurrency(ps.cpf_employee)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-[var(--text-muted)]">SHG / SDL</span>
                                        <span className="text-[var(--text-main)]">{formatCurrency(Number(ps.shg_deduction) + Number(ps.sdl))}</span>
                                    </div>
                                    <div className="pt-1.5 mt-1.5 border-t border-[var(--border-main)] flex justify-between text-xs font-black text-rose-400">
                                        <span>Total</span>
                                        <span>{formatCurrency(Number(ps.cpf_employee) + Number(ps.shg_deduction) + Number(ps.attendance_deduction))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-6 mt-2 flex items-center justify-between bg-gradient-to-t from-[var(--bg-input)]/50 to-transparent">
                            <div>
                                <p className="text-[10px] font-extrabold text-[var(--brand-primary)] uppercase tracking-wider mb-1">Final Net Payout</p>
                                <p className="text-2xl font-black text-[var(--text-main)] tracking-tighter">{formatCurrency(ps.net_pay)}</p>
                            </div>
                            <button
                                onClick={() => navigate(`/payroll/payslip/${ps.id}`)}
                                className="w-12 h-12 rounded-2xl bg-[var(--text-main)] text-[var(--bg-card)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg group-hover:bg-[var(--brand-primary)]"
                            >
                                <FileText className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center pt-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--brand-primary)]/40 hover:shadow-xl transition-all font-bold text-sm group"
                >
                    <ArrowUpRight className="w-4 h-4 rotate-[225deg] group-hover:-translate-x-1 group-hover:translate-y-1 transition-transform" />
                    Back to Selection
                </button>
            </div>
        </div>
    );
};

export default PayrollResultsVisualizer;
