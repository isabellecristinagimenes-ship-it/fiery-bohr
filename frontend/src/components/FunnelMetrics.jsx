import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * FunnelMetrics Component
 * Shows all 6 pipeline stages with conversion rates between them
 * 
 * @param {Object} stageCounts - Object with counts per stage
 * @param {number} stageCounts.novoLead
 * @param {number} stageCounts.qualificacao
 * @param {number} stageCounts.visita
 * @param {number} stageCounts.proposta
 * @param {number} stageCounts.fechado
 * @param {number} stageCounts.perdido
 */
const FunnelMetrics = ({ stageCounts }) => {
    const stages = [
        { key: 'novoLead', label: 'Novo Lead', color: '#6366f1' },
        { key: 'qualificacao', label: 'Qualificação', color: '#8b5cf6' },
        { key: 'visita', label: 'Visita', color: '#06b6d4' },
        { key: 'proposta', label: 'Proposta', color: '#22c55e' },
        { key: 'fechado', label: 'Fechado', color: '#fbbf24' },
        { key: 'perdido', label: 'Perdido', color: '#ef4444' },
    ];

    const totalNewLeads = stageCounts.novoLead + stageCounts.qualificacao +
        stageCounts.visita + stageCounts.proposta +
        stageCounts.fechado + stageCounts.perdido;

    // Calculate cumulative (leads that reached this stage OR beyond)
    const getCumulativeCount = (stageIndex) => {
        let count = 0;
        for (let i = stageIndex; i < stages.length - 1; i++) { // Exclude 'Perdido' from cumulative
            count += stageCounts[stages[i].key] || 0;
        }
        return count;
    };

    return (
        <div style={{
            background: 'var(--bg-card)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border)',
            marginBottom: '2rem'
        }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                Funil de Conversão
            </h3>

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

                    // Rate vs total new leads
                    const rateVsTotal = totalNewLeads > 0 ? Math.round((count / totalNewLeads) * 100) : 0;

                    const showArrow = index > 0 && index < stages.length;

                    return (
                        <React.Fragment key={stage.key}>
                            {/* Arrow with conversion rates */}
                            {showArrow && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    minWidth: '60px'
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
                                minWidth: '100px',
                                textAlign: 'center',
                                flex: '1 1 100px'
                            }}>
                                <div style={{
                                    fontSize: '0.75rem',
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
