import React, { useState } from 'react';
import axios from 'axios';
import { Shield, Check, AlertTriangle } from 'lucide-react';

// Hardcoded for MVP
const API_URL = 'https://fiery-bohr-production-b324.up.railway.app';

export default function AdminDashboard() {
    const [view, setView] = useState('agency'); // agency | user
    const [status, setStatus] = useState(null);
    const [agencies, setAgencies] = useState([]);

    // Forms
    const [agencyForm, setAgencyForm] = useState({
        agencyName: '', spreadsheetId: '', adminName: '', adminEmail: '', adminPassword: 'mudar123'
    });
    const [userForm, setUserForm] = useState({
        name: '', email: '', password: '123', role: 'broker', agencyId: ''
    });

    // Fetch agencies on load
    React.useEffect(() => {
        axios.get(`${API_URL}/admin/agencies`)
            .then(res => setAgencies(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleAgencySubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await axios.post(`${API_URL}/admin/agencies`, agencyForm);
            setStatus('success_agency');
            setAgencyForm({ agencyName: '', spreadsheetId: '', adminName: '', adminEmail: '', adminPassword: 'mudar123' });
            // Refresh list
            const res = await axios.get(`${API_URL}/admin/agencies`);
            setAgencies(res.data);
        } catch (error) {
            setStatus('error: ' + (error.response?.data?.error || 'Erro'));
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await axios.post(`${API_URL}/admin/users`, userForm);
            setStatus('success_user');
            setUserForm({ name: '', email: '', password: '123', role: 'broker', agencyId: '' });
        } catch (error) {
            setStatus('error: ' + (error.response?.data?.error || 'Erro'));
        }
    };

    return (
        <div className="login-container" style={{ alignItems: 'flex-start', paddingTop: '3rem', overflowY: 'auto' }}>
            <div className="login-box" style={{ maxWidth: '800px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Shield size={48} color="var(--accent-gold)" style={{ marginBottom: '1rem' }} />
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'white' }}>
                        Super Admin <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>v2.0</span>
                    </h1>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                        <button
                            onClick={() => setView('agency')}
                            style={{
                                background: view === 'agency' ? 'var(--primary)' : 'transparent',
                                border: '1px solid var(--primary)',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '0.5rem',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Nova Agência
                        </button>
                        <button
                            onClick={() => setView('user')}
                            style={{
                                background: view === 'user' ? 'var(--primary)' : 'transparent',
                                border: '1px solid var(--primary)',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '0.5rem',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Novo Usuário
                        </button>
                    </div>
                </div>

                {/* STATUS MESSAGES */}
                {status?.startsWith('error') && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={20} /> {status.replace('error: ', '')}
                    </div>
                )}
                {status === 'success_agency' && (
                    <div style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Check size={20} /> Agência Criada!
                    </div>
                )}
                {status === 'success_user' && (
                    <div style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Check size={20} /> Usuário Adicionado!
                    </div>
                )}

                {/* FORM: NEW AGENCY */}
                {view === 'agency' && (
                    <form onSubmit={handleAgencySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: '1rem' }}>Dados da Imobiliária</h3>

                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem', color: '#a5b4fc', marginBottom: '1.5rem' }}>
                            <strong>⚠️ Requisitos da Planilha:</strong>
                            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <li>Deve ser compartilhada como <strong>Editor</strong> com: <br /> <code style={{ userSelect: 'all' }}>leitor@imobiliaria-mvp.iam.gserviceaccount.com</code></li>
                                <li>Aba deve se chamar: <strong>Página1</strong></li>
                                <li>Colunas (Ordem exata): <strong>Data, Nome, Telefone, Imóvel, Corretor, Etapa</strong></li>
                            </ul>
                        </div>

                        <div className="input-group">
                            <label>Nome da Agência</label>
                            <input type="text" placeholder="Ex: Imobiliária Solar" required
                                value={agencyForm.agencyName} onChange={e => setAgencyForm({ ...agencyForm, agencyName: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>ID da Planilha Google</label>
                            <input type="text" placeholder="ID da URL..." required
                                value={agencyForm.spreadsheetId} onChange={e => setAgencyForm({ ...agencyForm, spreadsheetId: e.target.value })} />
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                Parte da URL entre /d/ e /edit
                            </small>
                        </div>

                        <h4 style={{ marginTop: '1rem', color: 'var(--accent-gold)' }}>Dono (Admin)</h4>
                        <div className="input-group">
                            <label>Nome</label>
                            <input type="text" placeholder="Nome Completo" required
                                value={agencyForm.adminName} onChange={e => setAgencyForm({ ...agencyForm, adminName: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Email</label>
                            <input type="email" placeholder="admin@email.com" required
                                value={agencyForm.adminEmail} onChange={e => setAgencyForm({ ...agencyForm, adminEmail: e.target.value })} />
                        </div>

                        <button type="submit" className="login-button" disabled={status === 'loading'}>
                            {status === 'loading' ? 'Processando...' : 'Criar Agência'}
                        </button>
                    </form>
                )}

                {/* FORM: NEW USER */}
                {view === 'user' && (
                    <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Adicionar Usuário na Equipe</h3>

                        <div className="input-group">
                            <label>Selecionar Agência</label>
                            <select
                                required
                                value={userForm.agencyId}
                                onChange={e => setUserForm({ ...userForm, agencyId: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    color: 'white'
                                }}
                            >
                                <option value="">Selecione uma agência...</option>
                                {agencies.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Nome do Usuário</label>
                            <input type="text" placeholder="Ex: Carlos Corretor" required
                                value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Email</label>
                            <input type="email" placeholder="carlos@email.com" required
                                value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Senha Inicial</label>
                            <input type="text" placeholder="123" required
                                value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Função</label>
                            <select
                                value={userForm.role}
                                onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    color: 'white'
                                }}
                            >
                                <option value="broker">Corretor (Vê apenas seus leads)</option>
                                <option value="admin">Gerente (Vê leads da agência)</option>
                            </select>
                        </div>

                        <button type="submit" className="login-button" disabled={status === 'loading'}>
                            {status === 'loading' ? 'Processando...' : 'Adicionar Usuário'}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                        ← Voltar para Login
                    </a>
                </div>
            </div>
        </div>
    );
}
