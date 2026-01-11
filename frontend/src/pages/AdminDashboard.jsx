import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Check, AlertTriangle, Users, Settings, Save } from 'lucide-react';

// Hardcoded for MVP
const API_URL = 'https://fiery-bohr-production-b324.up.railway.app';

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');

    // Hardcoded Master Password for this Template (Can be changed in code by owner)
    const MASTER_PASSWORD = 'admin_mestre_seguro';

    // State for UI
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [agencies, setAgencies] = useState([]); // All agencies
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Forms
    const [agencyForm, setAgencyForm] = useState({
        agencyName: '', spreadsheetId: '', adminName: '', adminEmail: '', adminPassword: 'mudar123'
    });
    const [userForm, setUserForm] = useState({
        name: '', email: '', password: '123', role: 'broker'
    });

    // 1. Fetch agencies
    useEffect(() => {
        if (isAuthenticated) {
            fetchAgencies();
        }
    }, [isAuthenticated]);

    const fetchAgencies = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/agencies`);
            setAgencies(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (passwordInput === MASTER_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            alert('Senha Mestre Incorreta');
        }
    };

    const handleCreateAgency = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await axios.post(`${API_URL}/admin/agencies`, agencyForm);
            setStatus('success_agency');
            setAgencyForm({ agencyName: '', spreadsheetId: '', adminName: '', adminEmail: '', adminPassword: 'mudar123' });
            fetchAgencies();
            setIsCreating(false);
        } catch (error) {
            setStatus('error: ' + (error.response?.data?.error || 'Erro ao criar agência'));
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!selectedAgency) return;
        setStatus('loading_user');

        try {
            await axios.post(`${API_URL}/admin/users`, {
                ...userForm,
                agencyId: selectedAgency.id
            });
            setStatus('success_user');
            setUserForm({ name: '', email: '', password: '123', role: 'broker' });
        } catch (error) {
            setStatus('error: ' + (error.response?.data?.error || 'Erro ao adicionar usuário'));
        }
    };

    if (!isAuthenticated) return (
        <div className="login-container">
            <div className="login-box" style={{ textAlign: 'center' }}>
                <Shield size={48} color="var(--accent-gold)" style={{ margin: '0 auto 1rem' }} />
                <h2 style={{ color: 'white', marginBottom: '1rem' }}>Acesso Restrito</h2>
                <form onSubmit={handleLogin}>
                    <input type="password" placeholder="Senha Mestre" value={passwordInput} onChange={e => setPasswordInput(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
                    <button type="submit" className="login-button">Acessar Painel</button>
                </form>
            </div>
        </div>
    );

    if (loading) return <div className="login-container"><div className="spinner"></div></div>;

    return (
        <div className="login-container" style={{ alignItems: 'flex-start', paddingTop: '3rem', overflowY: 'auto' }}>
            <div className="login-box" style={{ maxWidth: '1000px', width: '100%', padding: '2rem' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Shield size={32} color="var(--accent-gold)" />
                        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'white', margin: 0 }}>
                            Super Admin
                        </h1>
                    </div>
                    {selectedAgency && (
                        <button onClick={() => setSelectedAgency(null)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                            ← Voltar para Lista
                        </button>
                    )}
                </div>

                {/* Status Messages */}
                {status?.startsWith('error') && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <AlertTriangle size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> {status.replace('error: ', '')}
                    </div>
                )}
                {(status === 'success_agency' || status === 'success_user') && (
                    <div style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <Check size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Sucesso!
                    </div>
                )}

                {/* VIEW 1: AGENCIES LIST (GRID) */}
                {!selectedAgency && !isCreating && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ color: 'white' }}>Minhas Imobiliárias</h3>
                            <button onClick={() => setIsCreating(true)} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                + Nova Imobiliária
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {agencies.map(agency => (
                                <button
                                    key={agency.id}
                                    onClick={() => setSelectedAgency(agency)}
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--accent-gold)',
                                        borderRadius: '1rem',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '200px'
                                    }}
                                >
                                    <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                                        <Users size={32} color="var(--accent-gold)" />
                                    </div>
                                    <h2 style={{ color: 'white', fontSize: '1.2rem', margin: 0 }}>{agency.name}</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>ID: {agency.id.slice(0, 8)}...</p>
                                </button>
                            ))}
                            {agencies.length === 0 && (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    Nenhuma imobiliária encontrada. Crie a primeira!
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* VIEW 2: CREATE AGENCY FORM */}
                {isCreating && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                        <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>Cadastrar Nova Imobiliária</h3>
                        <form onSubmit={handleCreateAgency} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="input-group">
                                <label>Nome da Imobiliária</label>
                                <input type="text" placeholder="Ex: Imobiliária Elite" required
                                    value={agencyForm.agencyName} onChange={e => setAgencyForm({ ...agencyForm, agencyName: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>ID da Planilha (Sheets)</label>
                                <input type="text" placeholder="ID..." required
                                    value={agencyForm.spreadsheetId} onChange={e => setAgencyForm({ ...agencyForm, spreadsheetId: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Nome do Admin</label>
                                <input type="text" placeholder="Seu Nome" required
                                    value={agencyForm.adminName} onChange={e => setAgencyForm({ ...agencyForm, adminName: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Email do Admin</label>
                                <input type="email" placeholder="admin@email.com" required
                                    value={agencyForm.adminEmail} onChange={e => setAgencyForm({ ...agencyForm, adminEmail: e.target.value })} />
                            </div>
                            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '1rem' }}>
                                <button type="submit" className="login-button">Salvar Imobiliária</button>
                                <button type="button" onClick={() => setIsCreating(false)} style={{ padding: '1rem', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* VIEW 3: SELECTED AGENCY DETAILS */}
                {selectedAgency && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* LEFT: READ ONLY INFO */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
                                <Settings size={20} /> Dados da Agência
                            </h3>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nome</label>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedAgency.name}</div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Planilha Conectada</label>
                                <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '0.25rem', overflow: 'hidden', wordBreak: 'break-all' }}>
                                    {selectedAgency.spreadsheetId}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: ADD USER FORM */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
                                <Users size={20} /> Adicionar Usuário
                            </h3>
                            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input type="text" placeholder="Nome" required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
                                <input type="email" placeholder="Email" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
                                <input type="text" placeholder="Senha" required value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
                                <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}>
                                    <option value="broker">Corretor</option>
                                    <option value="admin">Gerente</option>
                                </select>
                                <button type="submit" className="login-button">Adicionar</button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
