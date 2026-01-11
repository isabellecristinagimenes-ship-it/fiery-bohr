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

    // Styles matching the premium Login/Dashboard theme
    const styles = {
        container: {
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0a',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.05) 0%, transparent 50%)',
            color: '#fff',
            fontFamily: 'var(--font-sans)',
            overflowY: 'auto',
            padding: '2rem'
        },
        card: {
            background: '#121212',
            padding: '2rem',
            borderRadius: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 0 50px rgba(0,0,0,0.5)',
            width: '100%',
            maxWidth: '1000px',
            position: 'relative'
        },
        input: {
            width: '100%',
            padding: '1rem',
            borderRadius: '0.75rem',
            background: '#1a1a1a',
            border: '1px solid #333',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            marginTop: '0.5rem',
            transition: 'border-color 0.2s'
        },
        buttonPrimary: {
            background: 'var(--accent-gold)',
            color: '#000',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
        },
        buttonSecondary: {
            background: 'transparent',
            color: '#fff',
            border: '1px solid #333',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
        },
        label: {
            color: '#a3a3a3',
            fontSize: '0.9rem',
            fontWeight: 500
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

        // Manual Validation (Better UX than silent HTML5 block)
        if (!agencyForm.agencyName || !agencyForm.spreadsheetId || !agencyForm.adminName || !agencyForm.adminEmail) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        setStatus('loading');
        try {
            const res = await axios.post(`${API_URL}/admin/agencies`, agencyForm);
            setStatus('success_agency');
            alert('Imobiliária Criada com Sucesso!');
            setAgencyForm({ agencyName: '', spreadsheetId: '', adminName: '', adminEmail: '', adminPassword: 'mudar123' });
            fetchAgencies();
            setIsCreating(false);
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.error || 'Erro ao criar agência';
            setStatus('error: ' + errorMsg);
            alert('Erro: ' + errorMsg);
        }
    };

    // ... (rest of code)

    // In the return JSX, inside the form:
    // REMOVE 'required' from all inputs and ensure button has feedback
    return (
        // ... inside the isCreating block ...
        <form onSubmit={handleCreateAgency} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
                <label style={styles.label}>Nome da Imobiliária</label>
                <input type="text" placeholder="Ex: Imobiliária Elite"
                    style={styles.input}
                    value={agencyForm.agencyName} onChange={e => setAgencyForm({ ...agencyForm, agencyName: e.target.value })}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'}
                    onBlur={e => e.target.style.borderColor = '#333'}
                />
            </div>
            <div>
                <label style={styles.label}>ID da Planilha (Google Sheets)</label>
                <input type="text" placeholder="ID da URL..."
                    style={styles.input}
                    value={agencyForm.spreadsheetId} onChange={e => setAgencyForm({ ...agencyForm, spreadsheetId: e.target.value })}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'}
                    onBlur={e => e.target.style.borderColor = '#333'}
                />
            </div>
            <div style={{ borderTop: '1px solid #333', gridColumn: '1/-1', margin: '1rem 0' }}></div>
            <div>
                <label style={styles.label}>Nome do Admin</label>
                <input type="text" placeholder="Seu Nome"
                    style={styles.input}
                    value={agencyForm.adminName} onChange={e => setAgencyForm({ ...agencyForm, adminName: e.target.value })}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'}
                    onBlur={e => e.target.style.borderColor = '#333'}
                />
            </div>
            <div>
                <label style={styles.label}>Email do Admin</label>
                <input type="email" placeholder="admin@email.com"
                    style={styles.input}
                    value={agencyForm.adminEmail} onChange={e => setAgencyForm({ ...agencyForm, adminEmail: e.target.value })}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'}
                    onBlur={e => e.target.style.borderColor = '#333'}
                />
            </div>

            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsCreating(false)} style={styles.buttonSecondary}>
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    style={{
                        ...styles.buttonPrimary,
                        opacity: status === 'loading' ? 0.7 : 1,
                        cursor: status === 'loading' ? 'wait' : 'pointer'
                    }}
                >
                    {status === 'loading' ? 'Salvando...' : <><Save size={20} /> Salvar e Criar</>}
                </button>
            </div>
        </form>
    );

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
        <div style={styles.container}>
            <div style={{ ...styles.card, maxWidth: '420px', textAlign: 'center' }}>
                <Shield size={64} color="var(--accent-gold)" style={{ margin: '0 auto 1.5rem', filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.3))' }} />
                <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>Acesso Restrito</h2>
                <p style={{ color: '#525252', marginBottom: '2rem' }}>Área exclusiva para configuração do sistema.</p>
                <form onSubmit={handleLogin}>
                    <input type="password" placeholder="Senha Mestre" value={passwordInput} onChange={e => setPasswordInput(e.target.value)}
                        style={styles.input} />
                    <button type="submit" style={{ ...styles.buttonPrimary, width: '100%', marginTop: '1.5rem' }}>
                        Acessar Painel
                    </button>
                </form>
            </div>
        </div>
    );

    if (loading) return <div style={styles.container}><div className="spinner"></div></div>;

    return (
        <div style={{ ...styles.container, alignItems: 'flex-start' }}>
            <div style={styles.card}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
                            <Shield size={32} color="var(--accent-gold)" />
                        </div>
                        <div>
                            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', margin: 0 }}>Super Admin</h1>
                            <span style={{ fontSize: '0.8rem', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>v2.2 PREMIUM</span>
                        </div>
                    </div>
                    {selectedAgency && (
                        <button onClick={() => setSelectedAgency(null)} style={styles.buttonSecondary}>
                            ← Voltar
                        </button>
                    )}
                </div>

                {/* Status Messages */}
                {status?.startsWith('error') && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <AlertTriangle size={20} /> {status.replace('error: ', '')}
                    </div>
                )}
                {(status === 'success_agency' || status === 'success_user') && (
                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Check size={20} /> Operação realizada com sucesso!
                    </div>
                )}

                {/* VIEW 1: AGENCIES LIST (GRID) */}
                {!selectedAgency && !isCreating && (
                    <div className="animate-fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 500, color: '#d4d4d4' }}>Imobiliárias Configuradas</h3>
                            <button onClick={() => setIsCreating(true)} style={styles.buttonPrimary}>
                                + Nova Imobiliária
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {agencies.map(agency => (
                                <button
                                    key={agency.id}
                                    onClick={() => setSelectedAgency(agency)}
                                    style={{
                                        background: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '1.25rem',
                                        padding: '2.5rem',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '250px',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'var(--accent-gold)';
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = '#333';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0))',
                                        padding: '1.5rem',
                                        borderRadius: '50%',
                                        marginBottom: '1.5rem',
                                        border: '1px solid rgba(251, 191, 36, 0.1)'
                                    }}>
                                        <Users size={40} color="var(--accent-gold)" />
                                    </div>
                                    <h2 style={{ color: 'white', fontSize: '1.4rem', fontFamily: 'var(--font-serif)', margin: 0 }}>{agency.name}</h2>
                                    <p style={{ color: '#525252', fontSize: '0.85rem', marginTop: '0.75rem', fontFamily: 'monospace' }}>
                                        ID: {agency.id.split('-')[0]}...
                                    </p>
                                </button>
                            ))}
                            {agencies.length === 0 && (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#525252', border: '1px dashed #333', borderRadius: '1rem' }}>
                                    <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <p>Nenhuma imobiliária configurada neste projeto.</p>
                                    <p style={{ fontSize: '0.9rem' }}>Clique em "Nova Imobiliária" para começar.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* VIEW 2: CREATE AGENCY FORM */}
                {isCreating && (
                    <div className="animate-fade-in">
                        <h3 style={{ color: 'white', fontSize: '1.5rem', fontFamily: 'var(--font-serif)', marginBottom: '2rem' }}>Cadastrar Nova Imobiliária</h3>
                        <form onSubmit={handleCreateAgency} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            <div>
                                <label style={styles.label}>Nome da Imobiliária</label>
                                <input type="text" placeholder="Ex: Imobiliária Elite"
                                    style={styles.input}
                                    value={agencyForm.agencyName} onChange={e => setAgencyForm({ ...agencyForm, agencyName: e.target.value })}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'}
                                    onBlur={e => e.target.style.borderColor = '#333'}
                                />
                            </div>
                            <div>
                                <label style={styles.label}>ID da Planilha (Google Sheets)</label>
                                <input type="text" placeholder="ID da URL..."
                                    style={styles.input}
                                    value={agencyForm.spreadsheetId} onChange={e => setAgencyForm({ ...agencyForm, spreadsheetId: e.target.value })}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'}
                                    onBlur={e => e.target.style.borderColor = '#333'}
                                />
                            </div>
                            <div style={{ borderTop: '1px solid #333', gridColumn: '1/-1', margin: '1rem 0' }}></div>
                            <div>
                                <label style={styles.label}>Nome do Admin</label>
                                <input type="text" placeholder="Seu Nome"
                                    style={styles.input}
                                    value={agencyForm.adminName} onChange={e => setAgencyForm({ ...agencyForm, adminName: e.target.value })}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'}
                                    onBlur={e => e.target.style.borderColor = '#333'}
                                />
                            </div>
                            <div>
                                <label style={styles.label}>Email do Admin</label>
                                <input type="email" placeholder="admin@email.com"
                                    style={styles.input}
                                    value={agencyForm.adminEmail} onChange={e => setAgencyForm({ ...agencyForm, adminEmail: e.target.value })}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'}
                                    onBlur={e => e.target.style.borderColor = '#333'}
                                />
                            </div>

                            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '1rem', marginTop: '1rem', position: 'relative', zIndex: 10 }}>
                                <button type="button" onClick={() => { setIsCreating(false); setAgencyForm({ agencyName: '', spreadsheetId: '', adminName: '', adminEmail: '', adminPassword: 'mudar123' }); }} style={{ ...styles.buttonSecondary, zIndex: 20 }}>
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    style={{
                                        ...styles.buttonPrimary,
                                        opacity: status === 'loading' ? 0.7 : 1,
                                        cursor: status === 'loading' ? 'wait' : 'pointer',
                                        zIndex: 20
                                    }}
                                >
                                    {status === 'loading' ? 'Salvando...' : <><Save size={20} /> Salvar e Criar</>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* VIEW 3: SELECTED AGENCY DETAILS */}
                {selectedAgency && (
                    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '2rem' }}>

                        {/* LEFT: INFO CARD */}
                        <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '1.25rem', border: '1px solid #333' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>
                                <Settings size={24} />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Dados da Agência</h3>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={styles.label}>Nome Registrado</label>
                                <div style={{ fontSize: '1.4rem', fontWeight: 500, color: 'white', marginTop: '0.25rem' }}>{selectedAgency.name}</div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={styles.label}>Planilha Conectada</label>
                                <div style={{
                                    marginTop: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontFamily: 'monospace',
                                    background: 'black',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    color: '#a3a3a3',
                                    border: '1px solid #333',
                                    wordBreak: 'break-all'
                                }}>
                                    {selectedAgency.spreadsheetId}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                <Check size={16} /> Integração Ativa
                            </div>
                        </div>

                        {/* RIGHT: ADD USER FORM */}
                        <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '1.25rem', border: '1px solid #333' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>
                                <Users size={24} />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Adicionar Membro</h3>
                            </div>

                            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={styles.label}>Nome Completo</label>
                                    <input type="text" placeholder="Ex: Carlos Corretor" required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                                        style={styles.input} onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'} onBlur={e => e.target.style.borderColor = '#333'} />
                                </div>

                                <div>
                                    <label style={styles.label}>Email de Acesso</label>
                                    <input type="email" placeholder="carlos@email.com" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                        style={styles.input} onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'} onBlur={e => e.target.style.borderColor = '#333'} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={styles.label}>Senha Provisória</label>
                                        <input type="text" placeholder="123456" required value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                            style={styles.input} onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'} onBlur={e => e.target.style.borderColor = '#333'} />
                                    </div>
                                    <div>
                                        <label style={styles.label}>Função</label>
                                        <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                                            style={{ ...styles.input, appearance: 'none', cursor: 'pointer' }}>
                                            <option value="broker">Corretor</option>
                                            <option value="admin">Gerente</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" style={{ ...styles.buttonPrimary, marginTop: '1rem' }}>
                                    <Users size={18} /> Cadastrar Usuário
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
