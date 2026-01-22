import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * FunnelMetrics Component
 * Shows all 6 pipeline stages horizontally with conversion rates between them
 */
const FunnelMetrics = ({ stageCounts, period, onPeriodChange }) => {
    const stages = [
        { key: 'novoLead', label: 'NOVO LEAD', color: '#6366f1' },
        { key: 'qualificacao', label: 'QUALIFICAÇÃO', color: '#8b5cf6' },
        { key: 'visita', label: 'VISITA', color: '#06b6d4' },
        { key: 'proposta', label: 'PROPOSTA', color: '#22c55e' },
        { key: 'fechado', label: 'FECHADO', color: '#fbbf24' },
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

            {/* Funnel - Horizontal Layout */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
            }}>
                {stages.map((stage, index) => {
                    const count = stageCounts[stage.key] || 0;
                    const prevCount = index > 0 ? (stageCounts[stages[index - 1].key] || 0) : count;

                    // Rate vs previous stage
                    const rateVsPrev = index === 0 ? 100 : (prevCount > 0 ? Math.round((count / prevCount) * 100) : 0);

                    // Rate vs total
                    const rateVsTotal = Math.round((count / total) * 100);

                    const showArrow = index > 0;

                    return (
                        <React.Fragment key={stage.key}>
                            {/* Arrow with conversion rates */}
                            {showArrow && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    minWidth: '50px'
                                }}>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        color: rateVsPrev >= 50 ? '#22c55e' : rateVsPrev >= 25 ? '#fbbf24' : '#ef4444',
                                        fontWeight: 600
                                    }}>
                                        {rateVsPrev}%
                                    </div>
                                    <ChevronRight size={20} color="var(--text-muted)" />
                                    <div style={{
                                        fontSize: '0.6rem',
                                        color: 'var(--text-muted)'
                                    }}>
                                        {rateVsTotal}% total
                                    </div>
                                </div>
                            )}

                            {/* Stage Box */}
                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: `1px solid ${stage.color}30`,
                                borderRadius: '0.75rem',
                                padding: '1rem',
                                minWidth: '90px',
                                textAlign: 'center',
                                flex: '1 1 90px'
                            }}>
                                <div style={{
                                    fontSize: '0.65rem',
                                    color: 'var(--text-muted)',
                                    marginBottom: '0.5rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {stage.label}
                                </div>
                                <div style={{
                                    fontSize: '1.75rem',
                                    fontWeight: 700,
                                    color: stage.color
                                }}>
                                    {count}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}

                {/* Perdidos - Last Arrow + Box */}
                {stageCounts.perdido > 0 && (
                    <>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            minWidth: '50px'
                        }}>
                            <div style={{
                                fontSize: '0.7rem',
                                color: '#ef4444',
                                fontWeight: 600
                            }}>
                                ✕
                            </div>
                            <ChevronRight size={20} color="#ef4444" />
                        </div>
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            minWidth: '90px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '0.65rem',
                                color: '#ef4444',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase'
                            }}>
                                PERDIDOS
                            </div>
                            <div style={{
                                fontSize: '1.75rem',
                                fontWeight: 700,
                                color: '#ef4444'
                            }}>
                                {stageCounts.perdido}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Legend */}
            <div style={{
                marginTop: '1rem',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                textAlign: 'center'
            }}>
                <span style={{ marginRight: '1rem' }}>↑ Taxa vs etapa anterior</span>
                <span>↓ Taxa vs total de leads</span>
            </div>
        </div>
    );
};

export default FunnelMetrics;
