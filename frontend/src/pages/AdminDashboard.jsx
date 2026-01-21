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
    TrendingUp
} from 'lucide-react';
import AddLeadModal from '../components/AddLeadModal';
import EditLeadModal from '../components/EditLeadModal';
import BrokerRankingWidget from '../components/BrokerRankingWidget';
import PropertyRankingWidget from '../components/PropertyRankingWidget';
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
    const [brokerRank, setBrokerRank] = useState([]);
    const [propRank, setPropRank] = useState([]);
    const [loadingRank, setLoadingRank] = useState(false);

    // Helper for safe comparison
    const normalize = (str) => str ? String(str).toLowerCase().trim() : '';

    // Admin sees ALL leads
    const filteredLeads = leads;

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

            const end = new Date();
            let start = new Date();

            if (period === 'current_year') {
                start = new Date(new Date().getFullYear(), 0, 1); // Jan 1st of current year
            } else {
                start.setDate(end.getDate() - period);
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
    }, [period]);

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

    const stages = ['Novo Lead', 'Qualificação', 'Visita', 'Proposta', 'Negócio Fechado', 'Perdido'];

    return (
        <div className="dashboard-container">
            <header>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Imobiliária CRM <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>(v6.0)</span>
                        <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '10px', background: 'var(--primary)', color: 'white' }}>
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
                    <div className="metrics-grid">
                        <MetricCard label="Total de Leads" value={metrics?.total_leads || 0} icon={Users} color="var(--accent-blue)" />
                        <MetricCard label="Visitas Realizadas" value={metrics?.total_visitas || 0} icon={Eye} color="var(--accent-purple)" />
                        <MetricCard label="Propostas" value={metrics?.total_propostas || 0} icon={FileText} color="var(--accent-green)" />
                        <MetricCard label="Perdas" value={metrics?.total_perdas || 0} icon={XOctagon} color="#ef4444" />
                    </div>

                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <TrendingUp size={24} color="var(--accent-gold)" />
                                Performance da Agência
                            </h2>
                            <select
                                value={period}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setPeriod(val === 'current_year' ? 'current_year' : Number(val));
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

                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <BrokerRankingWidget data={brokerRank} loading={loadingRank} />
                            <PropertyRankingWidget data={propRank} loading={loadingRank} />
                        </div>
                    </div>

                    <div className="kanban-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <LayoutDashboard size={24} color="var(--primary)" />
                                <h2 style={{ fontSize: '1.5rem' }}>Pipeline de Vendas</h2>
                            </div>
                        </div>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="kanban-grid">
                                {stages.map((stage) => {
                                    const stageLeads = filteredLeads.filter(l => normalize(l.etapa_atual) === normalize(stage));

                                    return (
                                        <Droppable droppableId={stage} key={stage}>
                                            {(provided, snapshot) => (
                                                <div
                                                    className="kanban-column"
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    style={{
                                                        background: snapshot.isDraggingOver ? 'rgba(255,255,255,0.02)' : '',
                                                        border: snapshot.isDraggingOver ? '1px dashed var(--primary)' : ''
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
                                                                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{lead.nome_do_lead}</div>
                                                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                                        Imóvel: {lead.imovel}
                                                                    </div>

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
