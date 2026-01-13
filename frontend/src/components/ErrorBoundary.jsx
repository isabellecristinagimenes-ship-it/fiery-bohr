import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    background: '#111',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    textAlign: 'left'
                }}>
                    <div style={{ border: '1px solid red', padding: '2rem', borderRadius: '1rem', background: '#220000', maxWidth: '800px', width: '100%' }}>
                        <h1 style={{ color: '#ff4444', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <AlertTriangle /> Algo deu errado (v26.0)
                        </h1>
                        <p>Por favor, tire um print desta tela e envie para o suporte.</p>

                        <hr style={{ borderColor: '#444', margin: '1rem 0' }} />

                        <h3 style={{ color: '#fbbf24' }}>Erro:</h3>
                        <pre style={{ background: 'black', padding: '1rem', overflow: 'auto' }}>
                            {this.state.error && this.state.error.toString()}
                        </pre>

                        <h3 style={{ color: '#fbbf24', marginTop: '1rem' }}>Local:</h3>
                        <pre style={{ background: 'black', padding: '1rem', overflow: 'auto', fontSize: '0.8rem' }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>

                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                marginTop: '1rem',
                                background: '#fbbf24',
                                color: 'black',
                                border: 'none',
                                padding: '1rem 2rem',
                                borderRadius: '0.5rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Tentar Recarregar
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
