import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Users, Plus, ArrowLeft, Save, Check, AlertTriangle, LogOut } from 'lucide-react';
import { API_URL } from '../config';

export default function MasterAdmin() {
    // STATE MACHINE: 'LOCK_SCREEN' | 'DASHBOARD' | 'CREATE_AGENCY' | 'MANAGE_AGENCY'
    const [view, setView] = useState('LOCK_SCREEN');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Data
    const [agencies, setAgencies] = useState([]);
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [serverTests, setServerTests] = useState({ root: 'PENDING', admin: 'PENDING', metrics: 'PENDING' });

    // DEBUG: Aggressive Alert to confirm load (v14)
    useEffect(() => {
        console.log("MASTER ADMIN V14 MOUNTED");
    }, []);

    // DEBUG: Connectivity Diagnoser (v17)
    useEffect(() => {
        const runTests = async () => {
            // Test root
            try { await axios.get(`${API_URL}/`); setServerTests(p => ({ ...p, root: 'OK' })); }
            catch { setServerTests(p => ({ ...p, root: 'FAIL' })); }

            // Test admin
            try { await axios.get(`${API_URL}/admin/agencies`); setServerTests(p => ({ ...p, admin: 'OK' })); }
            catch { setServerTests(p => ({ ...p, admin: 'FAIL' })); }

            // Test metrics
            try { await axios.get(`${API_URL}/metrics/overview`); setServerTests(p => ({ ...p, metrics: 'OK' })); }
            catch { setServerTests(p => ({ ...p, metrics: 'FAIL' })); }
        };
        runTests();
    }, []);

    // DEBUG: Force visible header to confirm component mount
    if (view === 'ERROR') return <h1 style={{ color: 'red' }}>CRASHED: {error}</h1>;

    // DEBUG: Force visible header to confirm component mount
    if (view === 'ERROR') return <h1 style={{ color: 'red' }}>CRASHED: {error}</h1>;

    // console.log("MasterAdmin Render View:", view); // Visible in browser console if they checked

    // Forms
    const [agencyForm, setAgencyForm] = useState({ name: '', spreadsheetId: '', adminName: '', adminEmail: '' });
    const [userForm, setUserForm] = useState({ name: '', email: '', password: '123', role: 'broker' });

    // MASTER PASSWORD (Hardcoded for Template)
    const MASTER_PWD = 'admin_mestre_seguro';

    // --- ACTIONS ---

    const handleUnlock = (e) => {
        e.preventDefault();
        if (password === MASTER_PWD) {
            setView('DASHBOARD');
            fetchAgencies();
            setError(null);
        } else {
            setError('Senha incorreta');
        }
    };

    const fetchAgencies = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/admin/agencies`);
            if (Array.isArray(res.data)) {
                setAgencies(res.data);
            } else {
                console.error("FORMAT ERROR:", res.data);
                alert("Erro: O servidor retornou dados inválidos (não é uma lista).");
                setAgencies([]);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            alert("Erro de Conexão: " + err.message);
            setLoading(false);
        }
    };

    const handleCreateAgency = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API_URL}/admin/agencies`, {
                agencyName: agencyForm.name,
                spreadsheetId: agencyForm.spreadsheetId,
                adminName: agencyForm.adminName,
                adminEmail: agencyForm.adminEmail,
                adminPassword: agencyForm.adminPassword || 'mudar123'
            });
            alert('Imobiliária Criada!');
            setAgencyForm({ name: '', spreadsheetId: '', adminName: '', adminEmail: '' });
            fetchAgencies();
            setView('DASHBOARD');
        } catch (err) {
            alert('Erro: ' + (err.response?.data?.error || err.message));
            setLoading(false);
        }
    };

    const [agencyUsers, setAgencyUsers] = useState([]);

    const fetchUsers = async (agencyId) => {
        try {
            const res = await axios.get(`${API_URL}/admin/users/${agencyId}`);
            setAgencyUsers(res.data);
        } catch (err) {
            alert('Erro ao buscar usuários: ' + err.message);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!selectedAgency) return;
        try {
            await axios.post(`${API_URL}/admin/users`, {
                ...userForm,
                email: userForm.email.toLowerCase(), // Force Lowercasing for safety
                agencyId: selectedAgency.id
            });
            alert('Usuário Adicionado!');
            setUserForm({ name: '', email: '', password: '123', role: 'broker' });
            fetchUsers(selectedAgency.id); // Refresh list
        } catch (err) {
            alert('Erro: ' + (err.response?.data?.error || err.message));
        }
    };

    // --- STYLES ---
    const styles = {
        container: { minHeight: '100vh', background: '#0a0a0a', color: 'white', fontFamily: 'sans-serif', padding: '2rem' },
        card: { background: '#121212', border: '1px solid #333', borderRadius: '1rem', padding: '2rem', maxWidth: '800px', margin: '0 auto' },
        input: { width: '100%', background: '#1a1a1a', border: '1px solid #333', color: 'white', padding: '1rem', borderRadius: '0.5rem', marginTop: '0.5rem' },
        btnPrimary: { background: '#fbbf24', color: 'black', border: 'none', padding: '1rem 2rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' },
        btnSecondary: { background: 'transparent', color: 'white', border: '1px solid #333', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }
    };

    // --- VIEWS ---

    if (view === 'LOCK_SCREEN') {
        return (
            <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <form onSubmit={handleUnlock} style={{ ...styles.card, textAlign: 'center', width: '100%', maxWidth: '400px' }}>
                    <Shield size={64} color="#fbbf24" style={{ margin: '0 auto 1rem' }} />
                    <h2>Área Mestre</h2>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>Acesso Restrito v1.0 (Fresh)</p>
                    <input autoFocus type="password" placeholder="Senha Mestre" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} />
                    {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
                    <button type="submit" style={{ ...styles.btnPrimary, width: '100%' }}>DESBLOQUEAR</button>
                </form>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Shield color="#fbbf24" /> Painel Mestre
                    </h1>
                    <button onClick={() => setView('LOCK_SCREEN')} style={{ ...styles.btnSecondary, borderColor: 'red', color: 'red' }}>
                        Bloquear
                    </button>
                </div>

                {/* VIEW: DASHBOARD (LIST) */}
                {view === 'DASHBOARD' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>Imobiliárias Ativas</h3>
                            <button onClick={() => setView('CREATE_AGENCY')} style={styles.btnPrimary}>+ Nova Imobiliária</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {Array.isArray(agencies) && agencies.map(agency => (
                                <div key={agency.id} onClick={() => { setSelectedAgency(agency); setView('MANAGE_AGENCY'); }}
                                    style={{ background: '#1a1a1a', border: '1px solid #333', padding: '1.5rem', borderRadius: '1rem', cursor: 'pointer', textAlign: 'center' }}>
                                    <Users size={32} color="#fbbf24" style={{ margin: '0 auto 1rem' }} />
                                    <h4>{agency.name}</h4>
                                    <small style={{ color: '#666' }}>{agency.id.slice(0, 8)}...</small>
                                </div>
                            ))}
                            {Array.isArray(agencies) && agencies.length === 0 && <p style={{ color: '#666' }}>Nenhuma imobiliária encontrada.</p>}
                        </div>
                    </div>
                )}

                {/* VIEW: CREATE AGENCY */}
                {view === 'CREATE_AGENCY' && (
                    <div style={styles.card}>
                        <button onClick={() => setView('DASHBOARD')} style={styles.btnSecondary}>← Cancelar</button>
                        <h2 style={{ marginTop: '1rem' }}>Nova Imobiliária</h2>
                        <form onSubmit={handleCreateAgency}>
                            <input placeholder="Nome da Imobiliária" value={agencyForm.name} onChange={e => setAgencyForm({ ...agencyForm, name: e.target.value })} style={styles.input} />
                            <input placeholder="ID da Planilha Google" value={agencyForm.spreadsheetId} onChange={e => setAgencyForm({ ...agencyForm, spreadsheetId: e.target.value })} style={styles.input} />
                            <hr style={{ borderColor: '#333', margin: '1rem 0' }} />
                            <input placeholder="Aadmin - Nome" value={agencyForm.adminName} onChange={e => setAgencyForm({ ...agencyForm, adminName: e.target.value })} style={styles.input} />
                            <input placeholder="Admin - Email" value={agencyForm.adminEmail} onChange={e => setAgencyForm({ ...agencyForm, adminEmail: e.target.value })} style={styles.input} />
                            <input placeholder="Admin - Senha (Opcional)" value={agencyForm.adminPassword || ''} onChange={e => setAgencyForm({ ...agencyForm, adminPassword: e.target.value })} style={styles.input} />
                            <button type="submit" disabled={loading} style={styles.btnPrimary}>{loading ? 'Criando...' : 'Salvar e Criar'}</button>
                        </form>
                    </div>
                )}

                {/* VIEW: MANAGE AGENCY */}
                {view === 'MANAGE_AGENCY' && selectedAgency && (
                    <div>
                        <div style={{ background: 'red', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                            DEBUG: v16 | API: {API_URL}
                        </div>                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div style={styles.card}>
                                <button onClick={() => setView('DASHBOARD')} style={styles.btnSecondary}>← Voltar</button>
                                <h2 style={{ marginTop: '1rem', color: '#fbbf24' }}>{selectedAgency.name}</h2>
                                <p style={{ color: '#666', wordBreak: 'break-all' }}>Planilha: {selectedAgency.spreadsheetId}</p>
                                <div style={{ marginTop: '1rem', padding: '1rem', background: '#000', borderRadius: '0.5rem', border: '1px solid #333' }}>
                                    <Check size={16} color="green" style={{ display: 'inline', marginRight: '0.5rem' }} />
                                    Integração Ativa
                                </div>
                            </div>

                            <div style={styles.card}>
                                <h3>Adicionar Usuário</h3>
                                <form onSubmit={handleAddUser}>
                                    <input placeholder="Nome" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} style={styles.input} />
                                    <input placeholder="Email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} style={styles.input} />
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <input placeholder="Senha" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} style={styles.input} />
                                        <select style={styles.input} value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                                            <option value="broker">Corretor</option>
                                            <option value="admin">Gerente</option>
                                        </select>
                                    </div>
                                    <button type="submit" style={styles.btnPrimary}>Adicionar</button>
                                </form>
                            </div>
                        </div>

                        <button onClick={() => fetchUsers(selectedAgency.id)} style={{ ...styles.btnSecondary, marginTop: '2rem', width: '100%' }}>
                            👥 Ver Usuários Desta Agência
                        </button>

                        {agencyUsers.length > 0 && (
                            <ul style={{ marginTop: '1rem', maxHeight: '200px', overflowY: 'auto', background: '#000', padding: '1rem', borderRadius: '0.5rem' }}>
                                {agencyUsers.map(u => (
                                    <li key={u.id} style={{ padding: '0.5rem', borderBottom: '1px solid #333' }}>
                                        {u.name} (<span style={{ color: '#fbbf24' }}>{u.email}</span>) - {u.role}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
