import React from 'react';
import { Medal, Trophy, TrendingUp } from 'lucide-react';

const BrokerRankingWidget = ({ data, loading }) => {
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
                <Trophy size={24} color="#fbbf24" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Top Corretores</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Sem dados suficientes no período.</p>
                ) : (
                    data.map((broker, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: index === 0 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255,255,255,0.03)',
                            border: index === 0 ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid transparent',
                            borderRadius: '0.75rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: index === 0 ? '#fbbf24' : '#334155',
                                    color: index === 0 ? '#000' : '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold'
                                }}>
                                    {index + 1}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{broker.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        Score: {broker.finalScore.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--accent-green)' }}>
                                    {(broker.qualRatio * 100).toFixed(0)}% Qualif.
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {broker.newLeads} leads
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BrokerRankingWidget;
