import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import api from '../services/api'

const emptyEntity = {
    name: '', uen: '', address: '', contact_number: '', website: '', email_domains: '', performance_multiplier: 0, logo_url: '',
    cpf_submission_no: '', iras_ais_id: '', bank_name: '', bank_account_no: '', bank_code: '', bank_branch_code: '', giro_customer_name: '',
    is_active: true
}

const Field = ({ label, name, type = 'text', required, span2, form, setForm, placeholder }) => (
    <div className={span2 ? 'md:col-span-2' : ''}>
        <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <input
            type={type}
            value={form[name] || ''}
            onChange={e => setForm({ ...form, [name]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
            className="input-base w-full"
            required={required}
            placeholder={placeholder}
            step={type === 'number' ? '0.01' : undefined}
        />
    </div>
)

export default function EntityForm() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { role, setEntities, activeEntity, switchEntity } = useAuth()
    const isEditing = Boolean(id)

    const [loading, setLoading] = useState(isEditing)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState(emptyEntity)

    useEffect(() => {
        if (isEditing) {
            // Since we don't have a single GET /api/entities/:id yet, we filter from the list
            // or fetch all. For now, we'll fetch all to be safe and find the one.
            api.getEntities().then(data => {
                const found = data.find(e => e.id.toString() === id)
                if (found) {
                    setForm({ ...emptyEntity, ...found })
                } else {
                    toast.error('Entity not found')
                    navigate('/entities')
                }
            }).catch(err => {
                toast.error(err.message)
                navigate('/entities')
            }).finally(() => setLoading(false))
        }
    }, [id, isEditing, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            if (isEditing) {
                await api.updateEntity(id, form)
                if (activeEntity && activeEntity.id.toString() === id) {
                    switchEntity({ ...activeEntity, ...form })
                }
            } else {
                await api.createEntity(form)
            }

            toast.success('Entity saved successfully')

            // Refresh global list
            const allEntities = await api.getEntities()
            setEntities(allEntities)

            navigate('/entities')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/entities')}
                    className="p-2 rounded-xl hover:bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)]">{isEditing ? 'Edit Entity' : 'Add New Entity'}</h1>
                    <p className="text-[var(--text-muted)] mt-1">Configure business identity and Singapore compliance settings.</p>
                </div>
            </div>

            <div className="card-base p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* General Information */}
                    <section>
                        <h3 className="text-sm font-bold text-[var(--brand-primary)] uppercase tracking-wider mb-6 pb-2 border-b border-[var(--border-main)]">General Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-main)] cursor-pointer hover:bg-[var(--bg-input)]/70 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                        className="w-5 h-5 rounded accent-[var(--brand-primary)]"
                                    />
                                    <div>
                                        <p className="font-medium text-[var(--text-main)]">Active Status</p>
                                        <p className="text-xs text-[var(--text-muted)]">Whether this entity is currently operational and visible in lists.</p>
                                    </div>
                                </label>
                            </div>

                            <Field form={form} setForm={setForm} label="Entity Name" name="name" required span2 />
                            <Field form={form} setForm={setForm} label="Company UEN" name="uen" required />
                            <Field form={form} setForm={setForm} label="Contact Number" name="contact_number" />
                            <Field form={form} setForm={setForm} label="Website" name="website" type="url" placeholder="https://" />
                            <Field form={form} setForm={setForm} label="Performance Multiplier (Reward Credits)" name="performance_multiplier" type="number" />
                            <Field form={form} setForm={setForm} label="Address" name="address" span2 />
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Email Domains (comma separated)</label>
                                <input
                                    type="text"
                                    value={form.email_domains || ''}
                                    onChange={e => setForm({ ...form, email_domains: e.target.value })}
                                    className="input-base w-full"
                                    placeholder="gmail.com, company.com"
                                />
                                <p className="text-[10px] text-[var(--text-muted)] mt-1">These domains will be suggested in the Employee form.</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Logo URL (External Image Link)</label>
                                <input
                                    type="url"
                                    value={form.logo_url || ''}
                                    onChange={e => setForm({ ...form, logo_url: e.target.value })}
                                    className="input-base w-full"
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Singapore Compliance */}
                    <section>
                        <h3 className="text-sm font-bold text-[var(--brand-primary)] uppercase tracking-wider mb-6 pb-2 border-b border-[var(--border-main)]">Singapore Compliance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field
                                form={form} setForm={setForm}
                                label="CPF Submission No (CSN)"
                                name="cpf_submission_no"
                                placeholder="e.g. 201234567A-PTE-01"
                            />
                            <Field
                                form={form} setForm={setForm}
                                label="IRAS AIS ID"
                                name="iras_ais_id"
                                placeholder="Organization ID"
                            />
                        </div>
                    </section>

                    {/* Banking Details */}
                    <section>
                        <h3 className="text-sm font-bold text-[var(--brand-primary)] uppercase tracking-wider mb-6 pb-2 border-b border-[var(--border-main)]">Banking Details (GIRO/Payroll)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Field form={form} setForm={setForm} label="Bank Name" name="bank_name" placeholder="e.g. DBS Bank" span2 />
                            <Field form={form} setForm={setForm} label="Account Number" name="bank_account_no" />
                            <Field form={form} setForm={setForm} label="GIRO Customer Name" name="giro_customer_name" />
                            <Field form={form} setForm={setForm} label="Bank Code" name="bank_code" placeholder="3 digits" />
                            <Field form={form} setForm={setForm} label="Branch Code" name="bank_branch_code" placeholder="3 digits" />
                        </div>
                    </section>

                    <div className="pt-6 border-t border-[var(--border-main)] flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/entities')}
                            className="px-6 py-2.5 rounded-xl border border-[var(--border-main)] text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-all font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary px-10 py-2.5 font-bold"
                        >
                            {submitting ? 'Saving...' : (isEditing ? 'Update Entity' : 'Create Entity')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
