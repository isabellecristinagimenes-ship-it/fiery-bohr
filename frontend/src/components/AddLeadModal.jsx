import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import axios from 'axios';

const AddLeadModal = ({ isOpen, onClose, onSuccess, apiUrl }) => {
    const [formData, setFormData] = useState({
        nome_do_lead: '',
        telefone: '',
        imovel: '',
        valor_do_imovel: '',
        etapa_atual: 'Novo Lead'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.post(`${apiUrl}/metrics/leads`, formData);
            onSuccess();
            onClose();
            setFormData({ // Reset form
                nome_do_lead: '',
                telefone: '',
                imovel: '',
                valor_do_imovel: '',
                etapa_atual: 'Novo Lead'
            });
        } catch (err) {
            console.error(err);
            setError('Erro ao salvar lead. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: '#1F2937', padding: '2rem', borderRadius: '1rem',
                width: '100%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Novo Lead</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {error && <div style={{ color: '#EF4444', marginBottom: '1rem', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '0.25rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#D1D5DB' }}>Nome</label>
                        <input
                            required
                            name="nome_do_lead"
                            value={formData.nome_do_lead}
                            onChange={handleChange}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                border: '1px solid #374151', background: '#111827', color: 'white'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#D1D5DB' }}>Telefone</label>
                        <input
                            required
                            name="telefone"
                            placeholder="Ex: 11999999999"
                            value={formData.telefone}
                            onChange={handleChange}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                border: '1px solid #374151', background: '#111827', color: 'white'
                            }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#D1D5DB' }}>Tipo de Imóvel</label>
                            <select
                                name="tipo_de_imovel"
                                value={formData.tipo_de_imovel || ''}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                    border: '1px solid #374151', background: '#111827', color: 'white'
                                }}
                            >
                                <option value="">Selecione...</option>
                                <option value="Apartamento">Apartamento</option>
                                <option value="Casa">Casa</option>
                                <option value="Terreno">Terreno</option>
                                <option value="Chácara / Sítio">Chácara / Sítio</option>
                                <option value="Comercial">Comercial</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#D1D5DB' }}>Valor (R$)</label>
                            <select
                                name="valor_do_imovel"
                                value={formData.valor_do_imovel}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                    border: '1px solid #374151', background: '#111827', color: 'white'
                                }}
                            >
                                <option value="">Selecione...</option>
                                <option value="Até R$ 100 mil">Até R$ 100 mil</option>
                                <option value="R$ 100 mil – R$ 200 mil">R$ 100 mil – R$ 200 mil</option>
                                <option value="R$ 200 mil – R$ 300 mil">R$ 200 mil – R$ 300 mil</option>
                                <option value="R$ 300 mil – R$ 500 mil">R$ 300 mil – R$ 500 mil</option>
                                <option value="R$ 500 mil – R$ 800 mil">R$ 500 mil – R$ 800 mil</option>
                                <option value="R$ 800 mil – R$ 1,2 milhão">R$ 800 mil – R$ 1,2 milhão</option>
                                <option value="Mais de R$ 1,2 milhão">Mais de R$ 1,2 milhão</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#D1D5DB' }}>Imóvel (Ref/Obs)</label>
                        <input
                            name="imovel"
                            value={formData.imovel}
                            onChange={handleChange}
                            placeholder="Ex: Ed. Solar, Apt 42"
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                border: '1px solid #374151', background: '#111827', color: 'white'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            background: '#6366f1', color: 'white', border: 'none', padding: '0.75rem',
                            borderRadius: '0.5rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}
                    >
                        {loading ? 'Salvando...' : <><Save size={18} /> Salvar Lead</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddLeadModal;
