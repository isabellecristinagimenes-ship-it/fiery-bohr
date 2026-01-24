import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    Users,
    Eye,
    FileText,
    XOctagon,
    LayoutDashboard,
    RefreshCcw,
    MessageSquare,
    Plus,
    LogOut,
    TrendingUp,
    Search
} from 'lucide-react';
import AddLeadModal from '../components/AddLeadModal';
import EditLeadModal from '../components/EditLeadModal';
import BrokerRankingWidget from '../components/BrokerRankingWidget';
import PropertyRankingWidget from '../components/PropertyRankingWidget';
import FunnelMetrics from '../components/FunnelMetrics';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [metrics, setMetrics] = useState(null);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Edit State
    const [editingLead, setEditingLead] = useState(null);

    // Analytics State
    const [period, setPeriod] = useState(30);
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
    const [brokerRank, setBrokerRank] = useState([]);
    const [propRank, setPropRank] = useState([]);
    const [loadingRank, setLoadingRank] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Helper for safe comparison
    const normalize = (str) => str ? String(str).toLowerCase().trim() : '';

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

    // Admin sees leads filtered by date period
    const filteredLeads = leads.filter(lead => {
        const { start, end } = getDateRange();
        const entryDate = parseSheetDate(lead.data_entrada);
        const stageDate = parseSheetDate(lead.data_mudancadeetapa);

        const entryInPeriod = entryDate && entryDate >= start && entryDate <= end;
        const stageInPeriod = stageDate && stageDate >= start && stageDate <= end;

        return entryInPeriod || stageInPeriod;
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
                start.setDate(end.getDate() - 30); // Default fallback
            }

            let query = `?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;

            // Admin sees everything, no extra filter needed

            const propRes = await axios.get(`${API_URL}/metrics/ranking/property${query}`, config);
            setPropRank(propRes.data);

            try {
                const brokerRes = await axios.get(`${API_URL}/metrics/ranking/brokers${query}`, config);
                setBrokerRank(brokerRes.data);
            } catch (e) {
                // console.warn("Broker ranking fetch failed or not impl", e);
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

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        setEditingLead(null);
        fetchData();
    };

    const openWhatsApp = (e, phone) => {
        e.stopPropagation();
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStage = destination.droppableId;

        const updatedLeads = leads.map(lead => {
            if (String(lead.id) === draggableId) {
                return { ...lead, etapa_atual: newStage };
            }
            return lead;
        });

        setLeads(updatedLeads);

        try {
            await axios.put(`${API_URL}/metrics/leads/${draggableId}`, {
                etapa_atual: newStage,
                agencyId: user?.agencyId
            });
            // Refresh data after stage change (small delay to ensure backend saves)
            setTimeout(() => {
                fetchRankings();
                fetchData(); // Refresh leads to get updated data_mudancadeetapa
            }, 500);
        } catch (err) {
            console.error("Failed to move lead", err);
            fetchData();
            alert("Erro ao mover card. Tente novamente.");
        }
    };

    const MetricCard = ({ label, value, icon: Icon, color }) => (
        <div className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="metric-label">{label}</span>
                <Icon size={20} color={color} />
            </div>
            <div className="metric-value">{value}</div>
        </div>
    );

    // Calculate days since last stage change (or entry if no stage change)
    const getDaysInStage = (lead) => {
        const stageDate = parseSheetDate(lead.data_mudancadeetapa) || parseSheetDate(lead.data_entrada);
        if (!stageDate) return null;
        const now = new Date();
        const diffTime = Math.abs(now - stageDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const stages = ['Novo Lead', 'Qualificação', 'Visita', 'Proposta', 'Negócio Fechado', 'Hibernação', 'Perdido'];

    return (
        <div className="dashboard-container">
            <header>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Imobiliária CRM <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>(v6.0)</span>
                        <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '10px', background: 'var(--primary)', color: '#0f172a', fontWeight: 600, WebkitTextFillColor: '#0f172a' }}>
                            ADMIN
                        </span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Bem-vindo, {user?.name}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            background: 'var(--primary)',
                            border: 'none',
                            color: 'white',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 600,
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                        }}
                    >
                        <Plus size={20} />
                        Novo Lead
                    </button>

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
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 500,
                            backdropFilter: 'var(--glass)'
                        }}
                    >
                        <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={logout}
                        title="Sair"
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 500
                        }}
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </header>

            {error && (
                <div style={{
                    padding: '1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '0.75rem',
                    color: '#f87171',
                    marginBottom: '2rem',
                    textAlign: 'center'
                }}>
                    {error}
                </div>
            )}

            {loading && !metrics ? (
                <div className="loading">
                    <div className="spinner"></div>
                    Carregando dados...
                </div>
            ) : (
                <>
                    <FunnelMetrics
                        stageCounts={(() => {
                            // Cumulative counts: each stage includes leads at that stage OR beyond
                            // Hibernação and Perdido are tracked separately (not part of main funnel)
                            const stageOrder = ['novo lead', 'qualificação', 'visita', 'proposta', 'negócio fechado'];
                            const getStageIndex = (stage) => stageOrder.indexOf(normalize(stage));

                            const countAtOrBeyond = (minStageIndex) =>
                                filteredLeads.filter(l => {
                                    const idx = getStageIndex(l.etapa_atual);
                                    const isExcluded = normalize(l.etapa_atual) === 'perdido' || normalize(l.etapa_atual) === 'hibernação';
                                    return idx >= minStageIndex && !isExcluded;
                                }).length;

                            return {
                                novoLead: countAtOrBeyond(0),
                                qualificacao: countAtOrBeyond(1),
                                visita: countAtOrBeyond(2),
                                proposta: countAtOrBeyond(3),
                                fechado: countAtOrBeyond(4),
                                hibernacao: filteredLeads.filter(l => normalize(l.etapa_atual) === 'hibernação').length,
                                perdido: filteredLeads.filter(l => normalize(l.etapa_atual) === 'perdido').length,
                            };
                        })()}
                        period={period}
                        onPeriodChange={setPeriod}
                        customDateRange={customDateRange}
                        onCustomDateChange={setCustomDateRange}
                    />

                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <TrendingUp size={24} color="var(--accent-gold)" />
                                Performance da Agência
                            </h2>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <BrokerRankingWidget data={brokerRank} loading={loadingRank} />
                            <PropertyRankingWidget data={propRank} loading={loadingRank} />
                        </div>
                    </div>

                    <div className="kanban-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <LayoutDashboard size={24} color="var(--primary)" />
                                <h2 style={{ fontSize: '1.5rem' }}>Pipeline de Vendas</h2>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou telefone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        background: 'var(--bg-card)',
                                        color: 'var(--text-main)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0.5rem',
                                        padding: '0.5rem 1rem 0.5rem 2.5rem',
                                        width: '250px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="kanban-grid">
                                {stages.map((stage) => {
                                    const stageLeads = filteredLeads.filter(l => {
                                        const matchesStage = normalize(l.etapa_atual) === normalize(stage);
                                        if (!matchesStage) return false;
                                        if (!searchQuery.trim()) return true;
                                        const query = searchQuery.toLowerCase();
                                        const matchesName = normalize(l.nome_do_lead).includes(query);
                                        const matchesPhone = normalize(l.telefone).includes(query);
                                        return matchesName || matchesPhone;
                                    });

                                    return (
                                        <Droppable droppableId={stage} key={stage}>
                                            {(provided, snapshot) => (
                                                <div
                                                    className="kanban-column"
                                                    style={{
                                                        background: snapshot.isDraggingOver ? 'rgba(255,255,255,0.02)' : '',
                                                        border: snapshot.isDraggingOver ? '1px dashed var(--primary)' : '',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        maxHeight: '520px'
                                                    }}
                                                >
                                                    <div className="column-header">
                                                        {stage}
                                                        <span style={{
                                                            marginLeft: 'auto',
                                                            background: 'rgba(99, 102, 241, 0.2)',
                                                            padding: '2px 8px',
                                                            borderRadius: '10px',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            {stageLeads.length}
                                                        </span>
                                                    </div>

                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        style={{
                                                            flex: 1,
                                                            overflowY: 'auto',
                                                            paddingRight: '4px'
                                                        }}
                                                    >
                                                        {stageLeads.map((lead, idx) => (
                                                            <Draggable
                                                                key={String(lead.id)}
                                                                draggableId={String(lead.id)}
                                                                index={idx}
                                                            >
                                                                {(provided, snapshot) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        onClick={() => setEditingLead(lead)}
                                                                        style={{
                                                                            background: 'rgba(255,255,255,0.05)',
                                                                            padding: '1rem',
                                                                            borderRadius: '0.75rem',
                                                                            border: '1px solid var(--border)',
                                                                            marginBottom: '1rem',
                                                                            cursor: 'grab',
                                                                            boxShadow: snapshot.isDragging ? '0 10px 20px rgba(0,0,0,0.5)' : 'none',
                                                                            transform: snapshot.isDragging ? 'scale(1.05)' : 'scale(1)',
                                                                            ...provided.draggableProps.style
                                                                        }}
                                                                    >
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                                            <div style={{ fontWeight: 600 }}>{lead.nome_do_lead}</div>
                                                                            <div style={{
                                                                                fontSize: '0.7rem',
                                                                                padding: '2px 6px',
                                                                                borderRadius: '10px',
                                                                                background: getDaysInStage(lead) > 7 ? 'rgba(239, 68, 68, 0.2)' :
                                                                                    getDaysInStage(lead) > 3 ? 'rgba(251, 191, 36, 0.2)' :
                                                                                        'rgba(34, 197, 94, 0.2)',
                                                                                color: getDaysInStage(lead) > 7 ? '#ef4444' :
                                                                                    getDaysInStage(lead) > 3 ? '#fbbf24' : '#22c55e'
                                                                            }}>
                                                                                {getDaysInStage(lead) ?? '-'}d
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                                                            Imóvel: {lead.imovel}
                                                                        </div>
                                                                        {lead.origem && (
                                                                            <div style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', marginBottom: '0.25rem' }}>
                                                                                📍 {lead.origem}
                                                                            </div>
                                                                        )}

                                                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', marginBottom: '1rem' }}>
                                                                            👤 {lead.corretor || 'Sem corretor'}
                                                                        </div>

                                                                        <button
                                                                            onClick={(e) => openWhatsApp(e, lead.telefone)}
                                                                            style={{
                                                                                width: '100%',
                                                                                background: '#25D366',
                                                                                color: '#fff',
                                                                                border: 'none',
                                                                                padding: '0.5rem',
                                                                                borderRadius: '0.5rem',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                gap: '0.5rem',
                                                                                cursor: 'pointer',
                                                                                fontWeight: 600
                                                                            }}
                                                                        >
                                                                            <MessageSquare size={16} />
                                                                            WhatsApp
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </div>
                                                </div>
                                            )}
                                        </Droppable>
                                    );
                                })}
                            </div>
                        </DragDropContext>
                    </div>
                </>
            )}

            <AddLeadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
                currentUser={user}
            />

            <EditLeadModal
                isOpen={!!editingLead}
                onClose={() => setEditingLead(null)}
                onSuccess={handleModalSuccess}
                currentUser={user}
                lead={editingLead}
            />
        </div>
    );
}
