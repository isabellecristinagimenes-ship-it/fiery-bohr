import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader } from 'lucide-react';

const LoginPage = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            background: '#0a0a0a', // Ultra dark background
            color: '#fff',
            fontFamily: 'var(--font-sans)',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)'

        }}>
            <div style={{
                background: '#121212',
                padding: '3rem',
                borderRadius: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 0 50px rgba(0,0,0,0.5)',
                position: 'relative'
            }}>
                {/* Glow Effect behind header */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '150px',
                    height: '150px',
                    background: 'var(--accent-gold)',
                    borderRadius: '50%',
                    filter: 'blur(80px)',
                    opacity: 0.15,
                    pointerEvents: 'none'
                }}></div>

                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative' }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                    }}>
                        <img
                            src="/logo.png"
                            alt="Logo Imobiliária"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.2))'
                            }}
                        />
                    </div>

                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 400,
                        marginBottom: '0.5rem',
                        fontFamily: 'var(--font-serif)',
                        letterSpacing: '-0.02em',
                        color: 'white'
                    }}>
                        Bem-vindo de volta
                    </h1>
                    <p style={{ color: '#525252', fontSize: '0.95rem' }}>
                        Sua gestão imobiliária começa aqui.
                    </p>
                    <p style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Sistema exclusivo para corretores de alta performance. <br />
                        <span style={{ fontSize: '0.75rem', opacity: 0.7, color: '#fbbf24' }}>Versão 2.6 (UPDATE FORÇADO)</span>
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#a3a3a3' }}>E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                background: '#1a1a1a',
                                border: '1px solid #333',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent-gold)'}
                            onBlur={(e) => e.target.style.borderColor = '#333'}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#a3a3a3' }}>Senha</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '1rem 3rem 1rem 1rem',
                                    borderRadius: '0.75rem',
                                    background: '#1a1a1a',
                                    border: '1px solid #333',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-gold)'}
                                onBlur={(e) => e.target.style.borderColor = '#333'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#525252',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            background: 'var(--accent-gold)',
                            color: '#000',
                            border: 'none',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'background 0.2s'
                        }}
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : 'Entrar no sistema'}
                    </button>
                </form>

                <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.75rem', color: '#333' }}>
                    © 2026 Imobiliária MVP. Gestão imobiliária premium. <br />
                    <span style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 'bold' }}>v6.0 (DEPLOY DESTRAVADO)</span>
                    <br />
                    <span style={{ opacity: 0.3 }}>Debug Path: {window.location.pathname}</span>
                </div>
            </div>
        </div>
        </div >
    );
};

export default LoginPage;
