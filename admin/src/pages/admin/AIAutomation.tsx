import { useState, useEffect } from 'react';
import { 
  Bot, AlertTriangle, CheckCircle, RefreshCcw, 
  Terminal, ShieldCheck, Zap, MessageSquare,
  Search, Command
} from 'lucide-react';
import './AIAutomation.css';

interface Diagnostic {
  _id: string;
  errorMessage: string;
  context: string;
  diagnosis: string;
  rootCause: string;
  recommendedFix: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Resolved' | 'Ignored';
  timestamp: string;
}

const AIAutomation = () => {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [stats, setStats] = useState({ errorCount: 0, resolvedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDiag, setSelectedDiag] = useState<Diagnostic | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/ai/stats`);
      const data = await res.json();
      if (data.status === 'success') {
        setDiagnostics(data.data.diagnostics);
        setStats({
          errorCount: data.data.errorCount,
          resolvedCount: data.data.resolvedCount
        });
      }
    } catch (err) {
      console.error('Failed to fetch AI stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id: string, status: 'Resolved' | 'Ignored') => {
    try {
      const res = await fetch(`${API_URL}/ai/diagnostic/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchData();
        if (selectedDiag?._id === id) setSelectedDiag(null);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return (
      <div className="ai-loading-container">
        <Bot className="ai-pulse-icon" />
        <p>Initializing AI Automation Core...</p>
      </div>
    );
  }

  return (
    <div className="ai-automation-page">
      <header className="ai-header">
        <div className="ai-title-group">
          <div className="ai-icon-bg">
            <Bot size={24} color="var(--gold)" />
          </div>
          <div>
            <h1>SnapAdda Elite AI</h1>
            <p>Predictive Error Resolution & System Intelligence</p>
          </div>
        </div>
        <div className="ai-stats-row">
          <div className="ai-stat-card">
            <span className="stat-label">Active Issues</span>
            <span className="stat-value error">{stats.errorCount}</span>
          </div>
          <div className="ai-stat-card">
            <span className="stat-label">Resolved</span>
            <span className="stat-value success">{stats.resolvedCount}</span>
          </div>
        </div>
      </header>

      <div className="ai-content-grid">
        {/* Left Column: Error Log */}
        <div className="ai-log-section">
          <div className="section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={16} color="var(--rose)" />
              <h2>System Diagnostics</h2>
            </div>
            <button onClick={fetchData} className="refresh-btn">
              <RefreshCcw size={14} />
            </button>
          </div>

          <div className="diagnostic-list">
            {diagnostics.length === 0 ? (
              <div className="empty-state">
                <ShieldCheck size={40} opacity={0.2} />
                <p>System Operating within Nominal Parameters</p>
              </div>
            ) : (
              diagnostics.map(diag => (
                <div 
                  key={diag._id} 
                  className={`diag-item ${selectedDiag?._id === diag._id ? 'active' : ''} status-${diag.status.toLowerCase()}`}
                  onClick={() => setSelectedDiag(diag)}
                >
                  <div className="diag-item-header">
                    <span className={`severity-badge ${diag.severity.toLowerCase()}`}>
                      {diag.severity}
                    </span>
                    <span className="diag-time">
                      {new Date(diag.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h3 className="diag-error-msg">{diag.errorMessage}</h3>
                  <p className="diag-context">{diag.context}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis Detail */}
        <div className="ai-detail-section">
          {!selectedDiag ? (
            <div className="ai-placeholder">
              <Zap size={48} color="var(--gold)" opacity={0.1} />
              <h3>Select a diagnostic for AI Analysis</h3>
              <p>SnapAdda Elite AI is standing by to resolve system anomalies.</p>
            </div>
          ) : (
            <div className="ai-analysis-card animate-fade-in">
              <div className="analysis-header">
                <Bot size={20} color="var(--gold)" />
                <span>AI Resolution Report</span>
                <div className="status-tag">{selectedDiag.status}</div>
              </div>

              <div className="analysis-body">
                <section className="analysis-part">
                  <h4><Search size={14} /> Diagnosis</h4>
                  <p>{selectedDiag.diagnosis || "Processing..."}</p>
                </section>

                <section className="analysis-part">
                  <h4><AlertTriangle size={14} /> Root Cause</h4>
                  <p>{selectedDiag.rootCause || "N/A"}</p>
                </section>

                <section className="analysis-part">
                  <h4><Command size={14} /> Recommended Fix</h4>
                  <div className="code-block">
                    <pre><code>{selectedDiag.recommendedFix || "// No automated fix available"}</code></pre>
                  </div>
                </section>
              </div>

              <div className="analysis-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => handleResolve(selectedDiag._id, 'Resolved')}
                >
                  <CheckCircle size={16} /> Mark as Resolved
                </button>
                <button 
                  className="action-btn secondary"
                  onClick={() => handleResolve(selectedDiag._id, 'Ignored')}
                >
                   Ignore Issue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Features teaser */}
      <footer className="ai-footer">
        <div className="footer-feature">
          <MessageSquare size={16} />
          <span>Conversational Search: Active</span>
        </div>
        <div className="footer-feature">
          <Zap size={16} />
          <span>Real-time Log Correction: Streaming</span>
        </div>
        <div className="footer-feature">
          <ShieldCheck size={16} />
          <span>Model: Llama 3.2 (Transformers.js)</span>
        </div>
      </footer>
    </div>
  );
};

export default AIAutomation;
