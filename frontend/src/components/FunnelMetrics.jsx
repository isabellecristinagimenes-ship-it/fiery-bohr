import React from 'react';

/**
 * FunnelMetrics Component - Visual Funnel Shape
 * Shows pipeline stages as a vertical funnel with decreasing widths
 */
const FunnelMetrics = ({ stageCounts, period, onPeriodChange }) => {
    const stages = [
        { key: 'novoLead', label: 'Novos Leads', color: '#6366f1' },
        { key: 'qualificacao', label: 'Qualificação', color: '#8b5cf6' },
        { key: 'visita', label: 'Visita', color: '#06b6d4' },
        { key: 'proposta', label: 'Proposta', color: '#22c55e' },
        { key: 'fechado', label: 'Fechado', color: '#fbbf24' },
    ];

    // Get total (first stage count) for percentage calculations
    const total = stageCounts.novoLead || 1;

    return (
        <div style={{
            background: 'var(--bg-card)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border)',
            marginBottom: '2rem'
        }}>
            {/* Header with Date Filter */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem'
            }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                    Funil de Conversão
                </h3>
                <select
                    value={period}
                    onChange={(e) => {
                        const val = e.target.value;
                        onPeriodChange(val === 'current_year' ? 'current_year' : Number(val));
                    }}
                    style={{
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        cursor: 'pointer'
                    }}
                >
                    <option value={7}>Últimos 7 dias</option>
                    <option value={30}>Últimos 30 dias</option>
                    <option value={90}>Últimos 3 meses</option>
                    <option value="current_year">Este Ano</option>
                </select>
            </div>

            {/* Funnel Visualization */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem'
            }}>
                {stages.map((stage, index) => {
                    const count = stageCounts[stage.key] || 0;
                    const percentage = Math.round((count / total) * 100);

                    // Width decreases as we go down the funnel (100% → 20%)
                    const maxWidth = 100 - (index * 15);
                    const minWidth = 30;
                    const width = Math.max(minWidth, maxWidth);

                    // Rate vs previous stage
                    const prevCount = index > 0 ? (stageCounts[stages[index - 1].key] || 0) : count;
                    const rateVsPrev = index === 0 ? 100 : (prevCount > 0 ? Math.round((count / prevCount) * 100) : 0);

                    return (
                        <div
                            key={stage.key}
                            style={{
                                width: `${width}%`,
                                background: `linear-gradient(135deg, ${stage.color}40, ${stage.color}20)`,
                                border: `1px solid ${stage.color}50`,
                                borderRadius: index === 0 ? '0.75rem 0.75rem 0 0' :
                                    index === stages.length - 1 ? '0 0 0.75rem 0.75rem' : '0',
                                padding: '0.75rem 1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'relative'
                            }}
                        >
                            {/* Left: Label */}
                            <span style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-main)',
                                fontWeight: 500
                            }}>
                                {stage.label}
                            </span>

                            {/* Center: Count */}
                            <span style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: stage.color
                            }}>
                                {count}
                            </span>

                            {/* Right: Percentages */}
                            <div style={{
                                textAlign: 'right',
                                minWidth: '80px'
                            }}>
                                {index > 0 && (
                                    <>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: rateVsPrev >= 50 ? '#22c55e' : rateVsPrev >= 25 ? '#fbbf24' : '#ef4444'
                                        }}>
                                            {rateVsPrev}% anterior
                                        </div>
                                        <div style={{
                                            fontSize: '0.65rem',
                                            color: 'var(--text-muted)'
                                        }}>
                                            {percentage}% total
                                        </div>
                                    </>
                                )}
                                {index === 0 && (
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)'
                                    }}>
                                        100%
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Perdidos - Separate */}
                {stageCounts.perdido > 0 && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>
                            {stageCounts.perdido}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Perdidos ({Math.round((stageCounts.perdido / total) * 100)}%)
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FunnelMetrics;
