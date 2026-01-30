import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    TrendingUp,
    Target,
    Award,
    BarChart3,
    RefreshCcw,
    LogOut,
    Building2,
    DollarSign,
    Calendar,
    Filter,
    ChevronDown,
    UserCheck,
    Clock
} from 'lucide-react';
import BrokerRankingWidget from '../components/BrokerRankingWidget';
import PropertyRankingWidget from '../components/PropertyRankingWidget';
import FunnelMetrics from '../components/FunnelMetrics';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export default function OwnerDashboard() {
    const { user, logout } = useAuth();
    const [metrics, setMetrics] = useState(null);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Analytics State
    const [period, setPeriod] = useState(30);
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
    const [brokerRank, setBrokerRank] = useState([]);
    const [propRank, setPropRank] = useState([]);
    const [loadingRank, setLoadingRank] = useState(false);

    // Broker filter
    const [selectedBroker, setSelectedBroker] = useState('all');
    const [brokers, setBrokers] = useState([]);

    // Parse DD/MM/YYYY date format from sheet
    const parseSheetDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return null;
        const [day, month, year] = dateStr.split('/');
        if (!day || !month || !year) return null;
        return new Date(`${year}-${month}-${day}`);
    };

    // Calculate date range based on period
    const getDateRange = () => {
        const end = new Date();
        let start = new Date();

        if (period === 'custom' && customDateRange.start && customDateRange.end) {
            return {
                start: new Date(customDateRange.start),
                end: new Date(customDateRange.end)
            };
        } else if (period === 'current_year') {
            start = new Date(new Date().getFullYear(), 0, 1);
        } else if (typeof period === 'number') {
            start.setDate(end.getDate() - period);
        }
        return { start, end };
    };

    // Filter leads by period and optionally by broker
    const filteredLeads = leads.filter(lead => {
        const { start, end } = getDateRange();
        const entryDate = parseSheetDate(lead.data_entrada);
        const stageDate = parseSheetDate(lead.data_mudancadeetapa);

        const entryInPeriod = entryDate && entryDate >= start && entryDate <= end;
        const stageInPeriod = stageDate && stageDate >= start && stageDate <= end;
        const inPeriod = entryInPeriod || stageInPeriod;

        if (selectedBroker === 'all') return inPeriod;
        return inPeriod && lead.corretor === selectedBroker;
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { 'x-agency-id': user?.agencyId } };
            const [metricsRes, leadsRes] = await Promise.all([
                axios.get(`${API_URL}/metrics/overview`, config),
                axios.get(`${API_URL}/metrics/leads`, config)
            ]);
            setMetrics(metricsRes.data);
            setLeads(leadsRes.data);

            // Extract unique brokers
            const uniqueBrokers = [...new Set(leadsRes.data.map(l => l.corretor).filter(Boolean))];
            setBrokers(uniqueBrokers);

            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Erro ao carregar dados. Verifique se o backend está online.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRankings = async () => {
        setLoadingRank(true);
        try {
            const config = { headers: { 'x-agency-id': user?.agencyId } };

            let start, end;

            if (period === 'custom' && customDateRange.start && customDateRange.end) {
                start = new Date(customDateRange.start);
                end = new Date(customDateRange.end);
            } else if (period === 'current_year') {
                start = new Date(new Date().getFullYear(), 0, 1);
                end = new Date();
            } else if (typeof period === 'number') {
                end = new Date();
                start = new Date();
                start.setDate(end.getDate() - period);
            } else {
                end = new Date();
                start = new Date();
                start.setDate(end.getDate() - 30);
            }

            let query = `?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;

            const propRes = await axios.get(`${API_URL}/metrics/ranking/property${query}`, config);
            setPropRank(propRes.data);

            try {
                const brokerRes = await axios.get(`${API_URL}/metrics/ranking/brokers${query}`, config);
                setBrokerRank(brokerRes.data);
            } catch (e) {
                // Broker ranking may not be implemented
            }

        } catch (err) {
            console.error('Error fetching rankings:', err);
        } finally {
            setLoadingRank(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchRankings();
    }, [period, customDateRange]);

    // Calculate broker metrics
    const calculateBrokerMetrics = () => {
        const brokerStats = {};

        filteredLeads.forEach(lead => {
            const broker = lead.corretor || 'Sem Corretor';
            if (!brokerStats[broker]) {
                brokerStats[broker] = {
                    total: 0,
                    fechados: 0,
                    qualificados: 0,
                    visitas: 0,
                    propostas: 0,
                    perdidos: 0
                };
            }
            brokerStats[broker].total++;

            const stage = lead.etapa_atual?.toLowerCase() || '';
            if (stage.includes('fechado') || stage.includes('venda')) brokerStats[broker].fechados++;
            if (stage.includes('qualifica')) brokerStats[broker].qualificados++;
            if (stage.includes('visita')) brokerStats[broker].visitas++;
            if (stage.includes('proposta')) brokerStats[broker].propostas++;
            if (stage.includes('perdido')) brokerStats[broker].perdidos++;
        });

        return Object.entries(brokerStats)
            .map(([name, stats]) => ({
                name,
                ...stats,
                conversionRate: stats.total > 0 ? Math.round((stats.fechados / stats.total) * 100) : 0
            }))
            .sort((a, b) => b.fechados - a.fechados);
    };

    const brokerMetrics = calculateBrokerMetrics();

    // Calculate stage counts for funnel (cumulative - each stage shows leads that reached AT LEAST that stage)
    // Helper to check which stage a lead has reached
    const getStageLevel = (stage) => {
        const s = stage?.toLowerCase() || '';
        if (s.includes('fechado') || s.includes('venda')) return 5;
        if (s.includes('proposta')) return 4;
        if (s.includes('visita')) return 3;
        if (s.includes('qualifica')) return 2;
        if (s.includes('hiberna')) return -1; // Out of funnel
        if (s.includes('perdido')) return -2; // Out of funnel
        return 1; // Novo Lead is default
    };

    const stageCounts = {
        // Novo Lead = ALL leads in the active funnel (excluding hibernação and perdidos)
        novoLead: filteredLeads.filter(l => getStageLevel(l.etapa_atual) >= 1).length,
        // Qualificação = leads that reached level 2 or beyond
        qualificacao: filteredLeads.filter(l => getStageLevel(l.etapa_atual) >= 2).length,
        // Visita = leads that reached level 3 or beyond
        visita: filteredLeads.filter(l => getStageLevel(l.etapa_atual) >= 3).length,
        // Proposta = leads that reached level 4 or beyond
        proposta: filteredLeads.filter(l => getStageLevel(l.etapa_atual) >= 4).length,
        // Fechado = only level 5
        fechado: filteredLeads.filter(l => getStageLevel(l.etapa_atual) === 5).length,
        // Hibernação and Perdidos are separate
        hibernacao: filteredLeads.filter(l => getStageLevel(l.etapa_atual) === -1).length,
        perdido: filteredLeads.filter(l => getStageLevel(l.etapa_atual) === -2).length
    };

    // Calculate overall metrics
    const totalLeads = filteredLeads.length;
    const totalFechados = stageCounts.fechado;
    const conversionRate = totalLeads > 0 ? Math.round((totalFechados / totalLeads) * 100) : 0;
    const activeBrokers = brokerMetrics.length;

    const MetricCard = ({ label, value, icon: Icon, color, subtitle }) => (
        <div className="metric-card" style={{ minWidth: '180px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="metric-label">{label}</span>
                <Icon size={20} color={color} />
            </div>
            <div className="metric-value" style={{ color }}>{value}</div>
            {subtitle && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {subtitle}
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#ef4444' }}>{error}</p>
                <button onClick={fetchData} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Imobiliária CRM
                        <span style={{
                            fontSize: '0.8rem',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: '#fff',
                            fontWeight: 600
                        }}>
                            DONO
                        </span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Visão Gerencial • {user?.name}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }} className="header-actions">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        title="Atualizar"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-main)',
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <RefreshCcw size={20} className={loading ? 'spin' : ''} />
                    </button>

                    <button
                        onClick={logout}
                        title="Sair"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            color: '#ef4444',
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Key Metrics Overview */}
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart3 size={24} color="var(--primary)" />
                    Resumo Executivo
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem'
                }}>
                    <MetricCard
                        label="Total de Leads"
                        value={totalLeads}
                        icon={Users}
                        color="#6366f1"
                        subtitle="No período selecionado"
                    />
                    <MetricCard
                        label="Vendas Fechadas"
                        value={totalFechados}
                        icon={Target}
                        color="#22c55e"
                        subtitle={`${conversionRate}% conversão`}
                    />
                    <MetricCard
                        label="Corretores Ativos"
                        value={activeBrokers}
                        icon={UserCheck}
                        color="#f59e0b"
                        subtitle="Com leads no período"
                    />
                    <MetricCard
                        label="Em Negociação"
                        value={stageCounts.proposta}
                        icon={DollarSign}
                        color="#8b5cf6"
                        subtitle="Propostas enviadas"
                    />
                </div>
            </section>

            {/* Funnel Metrics */}
            <FunnelMetrics
                stageCounts={stageCounts}
                period={period}
                onPeriodChange={setPeriod}
                customDateRange={customDateRange}
                onCustomDateChange={setCustomDateRange}
            />

            {/* Broker Performance Table */}
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={24} color="var(--primary)" />
                    Performance dos Corretores
                </h2>

                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: '1rem',
                    border: '1px solid var(--border)',
                    overflow: 'hidden'
                }}>
                    {/* Filter by broker */}
                    <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        flexWrap: 'wrap'
                    }}>
                        <Filter size={16} color="var(--text-muted)" />
                        <select
                            value={selectedBroker}
                            onChange={(e) => setSelectedBroker(e.target.value)}
                            style={{
                                background: 'var(--bg-main)',
                                color: 'var(--text-main)',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border)',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">Todos os Corretores</option>
                            {brokers.map(broker => (
                                <option key={broker} value={broker}>{broker}</option>
                            ))}
                        </select>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {filteredLeads.length} leads encontrados
                        </span>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>#</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Corretor</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Leads</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Qualificados</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Visitas</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Propostas</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fechados</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Perdidos</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Conversão</th>
                                </tr>
                            </thead>
                            <tbody>
                                {brokerMetrics.map((broker, idx) => (
                                    <tr
                                        key={broker.name}
                                        style={{
                                            borderBottom: '1px solid var(--border)',
                                            background: idx === 0 ? 'rgba(226, 165, 2, 0.05)' : 'transparent'
                                        }}
                                    >
                                        <td style={{ padding: '1rem' }}>
                                            {idx === 0 && <span style={{ fontSize: '1.25rem' }}>🥇</span>}
                                            {idx === 1 && <span style={{ fontSize: '1.25rem' }}>🥈</span>}
                                            {idx === 2 && <span style={{ fontSize: '1.25rem' }}>🥉</span>}
                                            {idx > 2 && <span style={{ color: 'var(--text-muted)' }}>{idx + 1}</span>}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 600 }}>{broker.name}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>{broker.total}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center', color: '#8b5cf6' }}>{broker.qualificados}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center', color: '#06b6d4' }}>{broker.visitas}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center', color: '#22c55e' }}>{broker.propostas}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center', color: '#fbbf24', fontWeight: 700 }}>{broker.fechados}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center', color: '#ef4444' }}>{broker.perdidos}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{
                                                background: broker.conversionRate >= 20 ? 'rgba(34, 197, 94, 0.2)' : broker.conversionRate >= 10 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                color: broker.conversionRate >= 20 ? '#22c55e' : broker.conversionRate >= 10 ? '#fbbf24' : '#ef4444',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.5rem',
                                                fontWeight: 600,
                                                fontSize: '0.85rem'
                                            }}>
                                                {broker.conversionRate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {brokerMetrics.length === 0 && (
                                    <tr>
                                        <td colSpan="9" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            Nenhum corretor encontrado no período selecionado
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Rankings Side by Side */}
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={24} color="var(--primary)" />
                    Rankings
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <BrokerRankingWidget data={brokerRank || []} loading={loadingRank} />
                    <PropertyRankingWidget data={propRank || []} loading={loadingRank} />
                </div>
            </section>

            {/* Recent Activity Summary */}
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={24} color="var(--primary)" />
                    Últimas Movimentações
                </h2>
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: '1rem',
                    border: '1px solid var(--border)',
                    padding: '1rem',
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}>
                    {filteredLeads
                        .sort((a, b) => {
                            const dateA = parseSheetDate(a.data_mudancadeetapa) || parseSheetDate(a.data_entrada);
                            const dateB = parseSheetDate(b.data_mudancadeetapa) || parseSheetDate(b.data_entrada);
                            return (dateB || 0) - (dateA || 0);
                        })
                        .slice(0, 15)
                        .map((lead, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem',
                                    borderBottom: idx < 14 ? '1px solid var(--border)' : 'none',
                                    gap: '1rem'
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{lead.nome || 'Lead sem nome'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {lead.corretor || 'Sem corretor'} • {lead.imovel_interesse || 'Sem imóvel'}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.5rem',
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        color: '#6366f1',
                                        display: 'inline-block'
                                    }}>
                                        {lead.etapa_atual || 'Novo Lead'}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        {lead.data_mudancadeetapa || lead.data_entrada}
                                    </div>
                                </div>
                            </div>
                        ))}
                    {filteredLeads.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Nenhuma movimentação no período selecionado
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
