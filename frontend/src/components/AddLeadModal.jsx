import { useAuth } from '../context/AuthContext';

const API_URL = 'https://fiery-bohr-production-b324.up.railway.app';
console.log('🔌 FE is trying to connect to:', API_URL); // Debug request URL

const AddLeadModal = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        nome_do_lead: '',
        telefone: '',
        imovel: '', // Mantendo como "Interesse" ou detalhe
        valor_do_imovel: '',
        origem: '',
        outro_origem: '', // Para armazenar o texto digitado quando "Outro" é selecionado
        tipo_de_imovel: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.nome_do_lead) {
                throw new Error('O nome do lead é obrigatório.');
            }

            // Prepara os dados para envio
            const dataToSend = {
                ...formData,
                corretor: user?.name || 'Desconhecido', // Auto-fill corretor
                // Se origem for "Outro", usa o valor digitado, senão usa o valor do select
                origem: formData.origem === 'Outro' ? formData.outro_origem : formData.origem
            };

            // Remove o campo auxiliar antes de enviar
            delete dataToSend.outro_origem;

            await axios.post(`${API_URL}/metrics/leads`, dataToSend);

            // Reset form and close
            setFormData({
                nome_do_lead: '',
                telefone: '',
                imovel: '',
                valor_do_imovel: '',
                origem: '',
                outro_origem: '',
                tipo_de_imovel: ''
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Erro ao salvar lead:', err);
            setError(err.response?.data?.error || err.message || 'Erro ao salvar lead.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: 'var(--bg-card)',
                padding: '2rem',
                borderRadius: '1rem',
                width: '100%',
                maxWidth: '600px', // Aumentei um pouco a largura
                border: '1px solid var(--border)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Novo Lead</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '0.5rem',
                        color: '#f87171',
                        marginBottom: '1rem',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nome do Lead *</label>
                            <input
                                type="text"
                                name="nome_do_lead"
                                value={formData.nome_do_lead}
                                onChange={handleChange}
                                placeholder="Ex: João Silva"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Telefone</label>
                            <input
                                type="text"
                                name="telefone"
                                value={formData.telefone}
                                onChange={handleChange}
                                placeholder="Ex: 11999999999"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Tipo de Imóvel</label>
                            <select
                                name="tipo_de_imovel"
                                value={formData.tipo_de_imovel}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="">Selecione...</option>
                                <option value="Apartamento">Apartamento</option>
                                <option value="Casa">Casa</option>
                                <option value="Terreno">Terreno</option>
                                <option value="Chácara / Sítio">Chácara / Sítio</option>
                                <option value="Comercial">Comercial</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Valor do Imóvel</label>
                            <select
                                name="valor_do_imovel"
                                value={formData.valor_do_imovel}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="">Selecione...</option>
                                <option value="Até R$ 100 mil">Até R$ 100 mil</option>
                                <option value="R$ 100 mil – R$ 200 mil">R$ 100 mil – R$ 200 mil</option>
                                <option value="R$ 200 mil – R$ 300 mil">R$ 200 mil – R$ 300 mil</option>
                                <option value="R$ 300 mil – R$ 500 mil">R$ 300 mil – R$ 500 mil</option>
                                <option value="R$ 500 mil – R$ 800 mil">R$ 500 mil – R$ 800 mil</option>
                                <option value="R$ 800 mil – R$ 1,2 milhão">R$ 800 mil – R$ 1,2 milhão</option>
                                <option value="mais de R$ 1,2 milhão">mais de R$ 1,2 milhão</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Detalhes do Interesse</label>
                            <input
                                type="text"
                                name="imovel"
                                value={formData.imovel}
                                onChange={handleChange}
                                placeholder="Ex: Cond. Vista Verde"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Origem do Lead</label>
                        <select
                            name="origem"
                            value={formData.origem}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-main)',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="">Selecione...</option>
                            <option value="Indicação">Indicação</option>
                            <option value="Placa / Passante">Placa / Passante</option>
                            <option value="Cliente antigo">Cliente antigo</option>
                            <option value="Parceria">Parceria</option>
                            <option value="Portais imobiliários">Portais imobiliários</option>
                            <option value="Outro">Outro</option>
                        </select>

                        {formData.origem === 'Outro' && (
                            <input
                                type="text"
                                name="outro_origem"
                                value={formData.outro_origem}
                                onChange={handleChange}
                                placeholder="Qual a origem?"
                                style={{
                                    width: '100%',
                                    marginTop: '0.5rem',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem'
                                }}
                            />
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                        {loading ? 'Salvando...' : 'Cadastrar Lead'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddLeadModal;
