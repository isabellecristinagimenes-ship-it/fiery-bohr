import React from 'react';
import { Home, Star, Clock, Users } from 'lucide-react';

const PropertyRankingWidget = ({ data, loading }) => {
    if (loading) return <div className="animate-pulse h-64 bg-gray-800 rounded-xl"></div>;

    const formatDays = (ms) => {
        if (ms === Infinity || !ms) return '-';
        const days = Math.round(ms / (1000 * 60 * 60 * 24));
        return `${days}d`;
    };

    return (
        <div style={{
            background: 'var(--bg-card)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border)',
            flex: 1
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Home size={24} color="#38bdf8" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Top Imóveis do Período</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                        Sem imóveis qualificados neste período.<br />
                        <span style={{ fontSize: '0.75rem' }}>(Mín. 1 novo lead + 1 qualificação)</span>
                    </p>
                ) : (
                    data.map((prop, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '0.75rem',
                            border: index === 0 ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid transparent'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: index === 0 ? '#fbbf24' : '#334155',
                                    color: index === 0 ? 'black' : 'white',
                                    borderRadius: '50%',
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem'
                                }}>
                                    {index + 1}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{prop.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                                        <span>✓ {prop.qualificados} Qualificados</span>
                                        <span>•</span>
                                        <span title="Tempo médio até qualificação">⏱️ {formatDays(prop.avgTime)}</span>
                                        <span>•</span>
                                        <span title="Visitas">👀 {prop.visitas}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
                                    {(prop.qualRatio * 100).toFixed(0)}%
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                    Taxa Conv.
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PropertyRankingWidget;
