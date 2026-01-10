import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, KeyRound, Loader } from 'lucide-react';

const LoginPage = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);

        if (!result.success) {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-main)'
        }}>
            <div style={{
                background: 'var(--bg-card)',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                border: '1px solid var(--border)',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--primary)',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 10px 20px rgba(99, 102, 241, 0.4)'
                    }}>
                        <Lock color="white" size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Acesso Restrito</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Faça login para continuar</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>E-mail</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 0.75rem 0.75rem 3rem',
                                    borderRadius: '0.75rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Senha</label>
                        <div style={{ position: 'relative' }}>
                            <KeyRound size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 0.75rem 0.75rem 3rem',
                                    borderRadius: '0.75rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
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
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : 'Entrar'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Sistema Imobiliária MVP
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
