import React from 'react';
import { TrendingUp } from 'lucide-react';

const PropertyRankingWidget = ({ data, loading }) => {
    if (loading) return <div className="animate-pulse h-64 bg-gray-800 rounded-xl"></div>;

    return (
        <div style={{
            background: 'var(--bg-card)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border)',
            flex: 1,
            minWidth: '320px'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Top 3 Imóveis por Interesse Gerado
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Ranking baseado na taxa de qualificação do período
                </p>
            </div>

            {/* Ranking List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                        Sem dados suficientes neste período.
                    </p>
                ) : (
                    data.map((prop, index) => {
                        const taxaQualificacao = prop.novos > 0 ? Math.round((prop.qualificados / prop.novos) * 100) : 0;
                        const isBaixoVolume = prop.novos < 5;

                        return (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '0.75rem',
                                border: index === 0 ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid transparent'
                            }}>
                                {/* Left: Rank + Property Info */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {/* Rank Number */}
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: index === 0 ? '#fbbf24' : '#334155',
                                        color: index === 0 ? 'black' : 'white',
                                        borderRadius: '50%',
                                        fontWeight: 'bold',
                                        fontSize: '0.875rem'
                                    }}>
                                        {index + 1}
                                    </div>

                                    {/* Property Details */}
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                                            {prop.name}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {prop.qualificados} qualificados de {prop.novos} leads
                                            {isBaixoVolume && (
                                                <span style={{ marginLeft: '0.5rem', color: '#fbbf24' }}>
                                                    ⚠️ baixo volume
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Rate */}
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                        color: taxaQualificacao >= 50 ? '#22c55e' : taxaQualificacao >= 25 ? '#fbbf24' : 'var(--text-muted)'
                                    }}>
                                        {taxaQualificacao}%
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                        qualificação
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default PropertyRankingWidget;
