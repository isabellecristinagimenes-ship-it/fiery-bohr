import React, { useState } from 'react';
import axios from 'axios';
import { X, Save, Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const AddLeadModal = ({ isOpen, onClose, onSuccess }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        nome_do_lead: '',
        telefone: '',
        imovel: '',
        valor_do_imovel: '',
        origem: 'Manual'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.nome_do_lead) {
                throw new Error('O nome do lead é obrigatório.');
            }

            await axios.post(`${API_URL}/metrics/leads`, formData);

            // Reset form and close
            setFormData({
                nome_do_lead: '',
                telefone: '',
                imovel: '',
                valor_do_imovel: '',
                origem: 'Manual'
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Erro ao salvar lead:', err);
            setError(err.response?.data?.error || err.message || 'Erro ao salvar lead.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: 'var(--bg-card)',
                padding: '2rem',
                borderRadius: '1rem',
                width: '100%',
                maxWidth: '500px',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Novo Lead</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '0.5rem',
                        color: '#f87171',
                        marginBottom: '1rem',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nome do Lead *</label>
                        <input
                            type="text"
                            name="nome_do_lead"
                            value={formData.nome_do_lead}
                            onChange={handleChange}
                            placeholder="Ex: João Silva"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-main)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Telefone</label>
                            <input
                                type="text"
                                name="telefone"
                                value={formData.telefone}
                                onChange={handleChange}
                                placeholder="Ex: 11999999999"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Valor Imóvel</label>
                            <input
                                type="text"
                                name="valor_do_imovel"
                                value={formData.valor_do_imovel}
                                onChange={handleChange}
                                placeholder="Ex: 500.000"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Origem</label>
                            <select
                                name="origem"
                                value={formData.origem}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="Manual">Manual</option>
                                <option value="Google">Google</option>
                                <option value="Instagram">Instagram</option>
                                <option value="Facebook">Facebook</option>
                                <option value="Indicação">Indicação</option>
                                <option value="Portal">Portal</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Interesse (Imóvel)</label>
                        <input
                            type="text"
                            name="imovel"
                            value={formData.imovel}
                            onChange={handleChange}
                            placeholder="Ex: Apto Centro"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-main)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                        {loading ? 'Salvando...' : 'Cadastrar Lead'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddLeadModal;
