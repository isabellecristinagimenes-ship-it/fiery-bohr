import React from 'react';
import { Home, Star } from 'lucide-react';

const PropertyRankingWidget = ({ data, loading }) => {
    if (loading) return <div className="animate-pulse h-64 bg-gray-800 rounded-xl"></div>;

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
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Top Imóveis</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                        Sem imóveis qualificados no período.<br />
                        <span style={{ fontSize: '0.75rem' }}>(Mín. 10 leads, 5 qualificados)</span>
                    </p>
                ) : (
                    data.map((prop, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '0.75rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Star size={16} color={index === 0 ? "#fbbf24" : "#94a3b8"} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>{prop.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {prop.qualified} qualificados
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
                                    {(prop.qualRatio * 100).toFixed(1)}%
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
