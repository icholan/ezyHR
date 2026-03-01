import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

export default function Entities() {
    const { role, loadEntities } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [localEntities, setLocalEntities] = useState([])
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)

    const canEdit = role === 'Admin'

    const loadData = async () => {
        setLoading(true)
        try {
            const data = await api.getEntities()
            setLocalEntities(data)
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleEdit = (item) => {
        navigate(`/entities/edit/${item.id}`)
    }

    const handleAdd = () => {
        navigate('/entities/add')
    }

    const handleDelete = async () => {
        if (!itemToDelete) return
        try {
            await api.deleteEntity(itemToDelete.id)
            toast.success('Deleted successfully')
            setShowDeleteModal(false)
            setItemToDelete(null)

            // Refresh global list via context if needed, or just reload data
            loadData()
            if (loadEntities) await loadEntities()
        } catch (err) {
            toast.error(err.message)
        }
    }

    const confirmDelete = (item) => {
        setItemToDelete(item)
        setShowDeleteModal(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)]">Business Entities</h1>
                    <p className="text-[var(--text-muted)] mt-1">Manage physical business divisions and Singapore legal identities.</p>
                </div>
                {canEdit && (
                    <button onClick={handleAdd} className="btn-primary w-full sm:w-auto">+ Add Entity</button>
                )}
            </div>

            <div className="card-base overflow-hidden">
                {loading ? <div className="h-64 loading-shimmer" /> : (
                    <table className="table-theme w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>UEN</th>
                                <th>Status</th>
                                <th>Perf. Multiplier</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {localEntities.map(item => (
                                <tr key={item.id} className={!item.is_active ? 'opacity-60 grayscale-[0.5]' : ''}>
                                    <td className="font-medium text-[var(--text-main)]">
                                        <div className="flex items-center gap-2">
                                            {item.name}
                                            {!item.is_active && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase">Inactive</span>}
                                        </div>
                                    </td>
                                    <td>{item.uen}</td>
                                    <td>
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{item.performance_multiplier || 0}</td>
                                    <td>
                                        {canEdit && (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(item)} className="text-xs text-[var(--brand-primary)] hover:text-cyan-300 transition-colors">✏️ Edit</button>
                                                <button onClick={() => confirmDelete(item)} className="text-xs text-red-400 hover:text-red-300 transition-colors" id={`delete-btn-${item.id}`}>🗑️ Delete</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {localEntities.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-[var(--text-muted)]">No entities found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                itemName={itemToDelete?.name}
            />
        </div>
    )
}
