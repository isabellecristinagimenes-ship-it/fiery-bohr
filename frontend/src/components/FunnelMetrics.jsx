import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Calendar } from 'lucide-react';

/**
 * FunnelMetrics Component
 * Shows all 6 pipeline stages horizontally on desktop, as visual funnel on mobile
 */
const FunnelMetrics = ({ stageCounts, period, onPeriodChange, customDateRange, onCustomDateChange }) => {
    const [showCustom, setShowCustom] = useState(period === 'custom');
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const stages = [
        { key: 'novoLead', label: 'NOVO LEAD', color: '#6366f1' },
        { key: 'qualificacao', label: 'QUALIFICAÇÃO', color: '#8b5cf6' },
        { key: 'visita', label: 'VISITA', color: '#06b6d4' },
        { key: 'proposta', label: 'PROPOSTA', color: '#22c55e' },
        { key: 'fechado', label: 'FECHADO', color: '#fbbf24' },
    ];

    // Get total (first stage count) for percentage calculations
    const total = stageCounts.novoLead || 1;

    const inputStyle = {
        background: 'var(--bg-card)',
        color: 'var(--text-main)',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        fontSize: '0.85rem'
    };

    // Mobile funnel widths (decreasing)
    const funnelWidths = ['100%', '85%', '70%', '55%', '40%'];

    const renderMobileFunnel = () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
            {stages.map((stage, index) => {
                const count = stageCounts[stage.key] || 0;
                const prevCount = index > 0 ? (stageCounts[stages[index - 1].key] || 0) : count;
                const rateVsPrev = index === 0 ? 100 : (prevCount > 0 ? Math.round((count / prevCount) * 100) : 0);
                const rateVsTotal = Math.round((count / total) * 100);

                return (
                    <React.Fragment key={stage.key}>
                        {/* Funnel Stage */}
                        <div style={{
                            width: funnelWidths[index],
                            background: `linear-gradient(135deg, ${stage.color}20, ${stage.color}10)`,
                            border: `1px solid ${stage.color}50`,
                            borderRadius: index === 0 ? '1rem 1rem 0 0' : index === stages.length - 1 ? '0 0 1rem 1rem' : '0',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            position: 'relative',
                            marginTop: index === 0 ? 0 : '-1px'
                        }}>
                            <div style={{
                                fontSize: '0.65rem',
                                color: 'var(--text-muted)',
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
                            {index > 0 && (
                                <div style={{
                                    fontSize: '0.7rem',
                                    color: rateVsPrev >= 50 ? '#22c55e' : rateVsPrev >= 25 ? '#fbbf24' : '#ef4444',
                                    fontWeight: 600,
                                    marginTop: '0.25rem'
                                }}>
                                    {rateVsPrev}% <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({rateVsTotal}% total)</span>
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                );
            })}

            {/* Hibernação & Perdidos row */}
            <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1rem',
                width: '100%',
                justifyContent: 'center'
            }}>
                {stageCounts.hibernacao > 0 && (
                    <div style={{
                        background: 'rgba(148, 163, 184, 0.1)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        borderRadius: '0.75rem',
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                        flex: 1,
                        maxWidth: '45%'
                    }}>
                        <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                            💤 HIBERNAÇÃO
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#94a3b8' }}>
                            {stageCounts.hibernacao}
                        </div>
                    </div>
                )}
                {stageCounts.perdido > 0 && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '0.75rem',
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                        flex: 1,
                        maxWidth: '45%'
                    }}>
                        <div style={{ fontSize: '0.6rem', color: '#ef4444', textTransform: 'uppercase' }}>
                            ✕ PERDIDOS
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>
                            {stageCounts.perdido}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderDesktopFunnel = () => (
        <>
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

                {/* Hibernação - Separate (cinza/azul - pode voltar) */}
                {stageCounts.hibernacao > 0 && (
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
                                color: '#94a3b8',
                                fontWeight: 600
                            }}>
                                💤
                            </div>
                            <ChevronRight size={20} color="#94a3b8" />
                        </div>
                        <div style={{
                            background: 'rgba(148, 163, 184, 0.1)',
                            border: '1px solid rgba(148, 163, 184, 0.3)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            minWidth: '90px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '0.65rem',
                                color: '#94a3b8',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase'
                            }}>
                                HIBERNAÇÃO
                            </div>
                            <div style={{
                                fontSize: '1.75rem',
                                fontWeight: 700,
                                color: '#94a3b8'
                            }}>
                                {stageCounts.hibernacao}
                            </div>
                        </div>
                    </>
                )}

                {/* Perdidos - Vermelho (definitivo) */}
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
        </>
    );

    return (
        <div style={{
            background: 'var(--bg-card)',
            padding: isMobile ? '1rem' : '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border)',
            marginBottom: '2rem'
        }}>
            {/* Header with Date Filter */}
            <div style={{
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '1rem'
            }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                    Funil de Conversão
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {/* Preset Dropdown */}
                    <select
                        value={showCustom ? 'custom' : period}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                                setShowCustom(true);
                                onPeriodChange('custom');
                            } else {
                                setShowCustom(false);
                                onPeriodChange(val === 'current_year' ? 'current_year' : Number(val));
                            }
                        }}
                        style={inputStyle}
                    >
                        <option value={7}>Últimos 7 dias</option>
                        <option value={30}>Últimos 30 dias</option>
                        <option value={90}>Últimos 3 meses</option>
                        <option value="current_year">Este Ano</option>
                        <option value="custom">📅 Personalizado</option>
                    </select>

                    {/* Custom Date Range Picker */}
                    {showCustom && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <Calendar size={16} color="var(--text-muted)" />
                            <input
                                type="date"
                                value={customDateRange?.start || ''}
                                onChange={(e) => onCustomDateChange?.({ ...customDateRange, start: e.target.value })}
                                style={inputStyle}
                            />
                            <span style={{ color: 'var(--text-muted)' }}>até</span>
                            <input
                                type="date"
                                value={customDateRange?.end || ''}
                                onChange={(e) => onCustomDateChange?.({ ...customDateRange, end: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Render appropriate layout */}
            {isMobile ? renderMobileFunnel() : renderDesktopFunnel()}
        </div>
    );
};

export default FunnelMetrics;

