import React, { useState } from 'react';
import axios from 'axios';
import { Shield, Check, AlertTriangle } from 'lucide-react';

// Hardcoded for MVP
const API_URL = 'https://fiery-bohr-production-b324.up.railway.app';

export default function SuperAdminPage() {
    const [formData, setFormData] = useState({
        agencyName: '',
        spreadsheetId: '',
        adminName: '',
        adminEmail: '',
        adminPassword: 'mudar123'
    });
    const [status, setStatus] = useState(null); // success, error, loading

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await axios.post(`${API_URL}/admin/agencies`, formData);
            setStatus('success');
            setFormData({ agencyName: '', spreadsheetId: '', adminName: '', adminEmail: '', adminPassword: 'mudar123' });
        } catch (error) {
            console.error(error);
            setStatus('error: ' + (error.response?.data?.error || 'Erro desconhecido'));
        }
    };

    return (
        <div className="login-container">
            <div className="login-box" style={{ maxWidth: '600px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Shield size={48} color="var(--accent-gold)" style={{ marginBottom: '1rem' }} />
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'white' }}>
                        Super Admin
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Módulo de Provisionamento de Agências</p>
                </div>

                {status?.startsWith('error') && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={20} />
                        {status.replace('error: ', '')}
                    </div>
                )}

                {status === 'success' && (
                    <div style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Check size={20} />
                        Agência criada com sucesso!
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: '1rem' }}>Dados da Imobiliária</h3>
                    <div className="input-group">
                        <label>Nome da Agência</label>
                        <input
                            type="text"
                            placeholder="Ex: Imobiliária Solar"
                            required
                            value={formData.agencyName}
                            onChange={e => setFormData({ ...formData, agencyName: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label>ID da Planilha Google</label>
                        <input
                            type="text"
                            placeholder="Cole o ID da URL..."
                            required
                            value={formData.spreadsheetId}
                            onChange={e => setFormData({ ...formData, spreadsheetId: e.target.value })}
                        />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            Parte da URL entre /d/ e /edit
                        </small>
                    </div>

                    <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: '1rem' }}>Dados do Dono</h3>
                    <div className="input-group">
                        <label>Nome do Administrador</label>
                        <input
                            type="text"
                            placeholder="Ex: Paulo Silva"
                            required
                            value={formData.adminName}
                            onChange={e => setFormData({ ...formData, adminName: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label>Email de Login</label>
                        <input
                            type="email"
                            placeholder="admin@agenciasolar.com"
                            required
                            value={formData.adminEmail}
                            onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? 'Criando...' : 'Criar Nova Agência'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                            ← Voltar para Login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
