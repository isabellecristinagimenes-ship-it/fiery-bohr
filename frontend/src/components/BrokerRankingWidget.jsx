import React from 'react';
import { Trophy } from 'lucide-react';

const BrokerRankingWidget = ({ data, loading }) => {
    if (loading) return <div className="animate-pulse h-64 bg-gray-800 rounded-xl"></div>;

    // Filter out invalid entries (NaN scores, zero without criteria)
    const validData = (data || []).filter(broker =>
        broker &&
        broker.name &&
        typeof broker.finalScore === 'number' &&
        !isNaN(broker.finalScore)
    );

    return (
        <div style={{
            background: 'var(--bg-card)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border)',
            flex: 1
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Trophy size={24} color="#fbbf24" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Top Corretores</h3>
            </div>

            {/* Ranking criteria context */}
            <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '1rem',
                fontStyle: 'italic'
            }}>
                Ranking baseado em taxa de qualificação e avanço no funil.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {validData.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                        Sem dados suficientes no período.
                    </p>
                ) : validData.length === 1 ? (
                    // Single broker - show informative message instead of competitive ranking
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem 1.5rem',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '0.75rem',
                            marginBottom: '0.75rem'
                        }}>
                            <span style={{ fontWeight: 600 }}>{validData[0].name}</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {validData[0].newLeads} leads • {(validData[0].qualRatio * 100).toFixed(0)}% qualificação
                            </span>
                        </div>
                        <p style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            fontStyle: 'italic'
                        }}>
                            Ranking competitivo disponível quando houver mais de um corretor ativo.
                        </p>
                    </div>
                ) : (
                    validData.map((broker, index) => (
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
