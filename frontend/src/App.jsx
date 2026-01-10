import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  Eye,
  FileText,
  XOctagon,
  LayoutDashboard,
  RefreshCcw,
  MessageSquare,
  ChevronRight,
  Plus
} from 'lucide-react';
import AddLeadModal from './components/AddLeadModal';

const API_URL = 'https://fiery-bohr-production-b324.up.railway.app';

function App() {
  const [metrics, setMetrics] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsRes, leadsRes] = await Promise.all([
        axios.get(`${API_URL}/metrics/overview`),
        axios.get(`${API_URL}/metrics/leads`)
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchData();
  };

  const openWhatsApp = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
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

  const stages = ['Novo Lead', 'Qualificação', 'Visita', 'Proposta'];

  return (
    <div className="dashboard-container">
      <header>
        <div>
          <h1>Imobiliária CRM</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Painel de Performance em Tempo Real</p>
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
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              padding: '0.75rem 1.25rem',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 500,
              backdropFilter: 'var(--glass)'
            }}
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Atualizando...' : 'Atualizar'}
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
          Carregando dados da planilha...
        </div>
      ) : (
        <>
          <div className="metrics-grid">
            <MetricCard
              label="Total de Leads"
              value={metrics?.total_leads || 0}
              icon={Users}
              color="var(--accent-blue)"
            />
            <MetricCard
              label="Visitas Realizadas"
              value={metrics?.total_visitas || 0}
              icon={Eye}
              color="var(--accent-purple)"
            />
            <MetricCard
              label="Propostas"
              value={metrics?.total_propostas || 0}
              icon={FileText}
              color="var(--accent-green)"
            />
            <MetricCard
              label="Perdas"
              value={metrics?.total_perdas || 0}
              icon={XOctagon}
              color="#ef4444"
            />
          </div>

          <div className="kanban-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <LayoutDashboard size={24} color="var(--primary)" />
                <h2 style={{ fontSize: '1.5rem' }}>Pipeline de Vendas</h2>
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Mover leads (Em breve)</span>
            </div>

            <div className="kanban-grid">
              {stages.map((stage) => (
                <div key={stage} className="kanban-column">
                  <div className="column-header">
                    {stage}
                    <span style={{
                      marginLeft: 'auto',
                      background: 'rgba(99, 102, 241, 0.2)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.75rem'
                    }}>
                      {leads.filter(l => l.etapa_atual === stage).length}
                    </span>
                  </div>

                  {leads.filter(l => l.etapa_atual === stage).map((lead, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(255,255,255,0.05)',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid var(--border)',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{lead.nome_do_lead}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Imóvel: {lead.imovel}</div>
                      <button
                        onClick={() => openWhatsApp(lead.telefone)}
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
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {/* Modal de Novo Lead */}
      <AddLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}

export default App;
