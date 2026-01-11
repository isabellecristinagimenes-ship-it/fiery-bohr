```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Check, AlertTriangle, Users, Settings, Save } from 'lucide-react';

// Hardcoded for MVP
const API_URL = 'https://fiery-bohr-production-b324.up.railway.app';

export default function AdminDashboard() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Single Tenant State
    const [agency, setAgency] = useState(null); // The ONE agency
    const [users, setUsers] = useState([]);     // Team members

    // Forms
    const [agencyForm, setAgencyForm] = useState({
        agencyName: '', spreadsheetId: '', adminName: '', adminEmail: '', adminPassword: 'mudar123'
    });
    const [userForm, setUserForm] = useState({
        name: '', email: '', password: '123', role: 'broker'
    });

    // 1. Fetch the single agency on load
    useEffect(() => {
        fetchAgencyData();
    }, []);

    const fetchAgencyData = async () => {
        try {
            const res = await axios.get(`${ API_URL } /admin/agencies`);
            // In Single-Tenant Template mode, we assume the first agency is THE agency.
            if (res.data && res.data.length > 0) {
                setAgency(res.data[0]); 
                // Could fetch users here too if endpoint existed
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAgency = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await axios.post(`${ API_URL } /admin/agencies`, agencyForm);
            setStatus('success_agency');
            // After create, set it as active
            setAgency(res.data.agency || { name: agencyForm.agencyName, id: res.data.agencyId }); // fallbacks depending on API response shape
            fetchAgencyData();
        } catch (error) {
            setStatus('error: ' + (error.response?.data?.error || 'Erro ao criar agência'));
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!agency) return;
        setStatus('loading_user');
        
        try {
            await axios.post(`${ API_URL } /admin/users`, {
                ...userForm,
                agencyId: agency.id // AUTO-LINK to the current agency
            });
            setStatus('success_user');
            setUserForm({ name: '', email: '', password: '123', role: 'broker' });
        } catch (error) {
            setStatus('error: ' + (error.response?.data?.error || 'Erro ao adicionar usuário'));
        }
    };

    if (loading) return <div className="login-container"><div className="spinner"></div></div>;

    return (
        <div className="login-container" style={{ alignItems: 'flex-start', paddingTop: '3rem', overflowY: 'auto' }}>
            <div className="login-box" style={{ maxWidth: '900px', width: '100%', padding: '2rem' }}>
                
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <Shield size={40} color="var(--accent-gold)" style={{ marginBottom: '0.5rem' }} />
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'white' }}>
                        Painel de Controle
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {agency ? `Gerenciando: ${ agency.name } ` : 'Configuração Inicial do Sistema'}
                    </p>
                </div>

                {/* Status Messages */}
                {status?.startsWith('error') && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={20} /> {status.replace('error: ', '')}
                    </div>
                )}
                {(status === 'success_agency' || status === 'success_user') && (
                    <div style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Check size={20} /> Operação realizada com sucesso!
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: agency ? '1fr 1fr' : '1fr', gap: '2rem' }}>
                    
                    {/* LEFT COLUMN: AGENCY SETTINGS */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
                            <Settings size={20} /> Configuração da Imobiliária
                        </h3>

                        {!agency ? (
                            <form onSubmit={handleCreateAgency} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem', color: '#a5b4fc', marginBottom: '0.5rem' }}>
                                    <strong>🚀 Configuração Inicial:</strong><br/>
                                    Defina os dados da imobiliária dona deste projeto. 
                                    <br/><br/>
                                    <strong>Email do Robô (Adicionar como Editor na Planilha):</strong><br/>
                                    <code style={{userSelect: 'all'}}>leitor@imobiliaria-mvp.iam.gserviceaccount.com</code>
                                </div>

                                <div className="input-group">
                                    <label>Nome da Imobiliária</label>
                                    <input type="text" placeholder="Ex: Imobiliária Modelo" required 
                                        value={agencyForm.agencyName} onChange={e => setAgencyForm({...agencyForm, agencyName: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>ID da Planilha Google (Spreadsheet ID)</label>
                                    <input type="text" placeholder="Cole o ID da URL..." required 
                                        value={agencyForm.spreadsheetId} onChange={e => setAgencyForm({...agencyForm, spreadsheetId: e.target.value})} />
                                </div>
                                <h4 style={{marginTop: '0.5rem', color: 'white'}}>Primeiro Admin (Você)</h4>
                                <div className="input-group">
                                    <label>Seu Nome</label>
                                    <input type="text" placeholder="Nome Completo" required 
                                        value={agencyForm.adminName} onChange={e => setAgencyForm({...agencyForm, adminName: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Seu Email de Login</label>
                                    <input type="email" placeholder="admin@email.com" required 
                                        value={agencyForm.adminEmail} onChange={e => setAgencyForm({...agencyForm, adminEmail: e.target.value})} />
                                </div>
                                <button type="submit" className="login-button" disabled={status === 'loading'}>
                                    Salvar Configuração e Criar
                                </button>
                            </form>
                        ) : (
                            <div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Nome Registrado</label>
                                    <div style={{fontSize: '1.1rem', fontWeight: 600}}>{agency.name}</div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>ID da Planilha Conectada</label>
                                    <div style={{fontSize: '0.9rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                        {agency.spreadsheetId || 'Não configurado'}
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Check size={16} /> Sistema Operacional
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: TEAM MANAGEMENT (Only if Agency exists) */}
                    {agency && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
                                <Users size={20} /> Gerenciar Equipe
                            </h3>
                            
                            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="input-group">
                                    <label>Nome do Colaborador</label>
                                    <input type="text" placeholder="Ex: Ana Corretora" required 
                                        value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Email de Acesso</label>
                                    <input type="email" placeholder="ana@email.com" required 
                                        value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Senha Inicial</label>
                                    <input type="text" placeholder="123456" required 
                                        value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Função no Sistema</label>
                                    <select 
                                        value={userForm.role}
                                        onChange={e => setUserForm({...userForm, role: e.target.value})}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}
                                    >
                                        <option value="broker">Corretor (Vê apenas seus leads)</option>
                                        <option value="admin">Gerente (Vê todos os leads + Métricas)</option>
                                    </select>
                                </div>

                                <button type="submit" className="login-button" style={{marginTop: '1rem'}} disabled={status === 'loading_user'}>
                                    Adicionar Membro à Equipe
                                </button>
                            </form>
                        </div>
                    )}

                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                        ← Voltar para Login
                    </a>
                </div>
            </div>
        </div>
    );
}
