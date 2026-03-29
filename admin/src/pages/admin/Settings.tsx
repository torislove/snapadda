import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings/whatsapp');
      const data = await response.json();
      if (data.status === 'success' && data.data) {
        setWhatsappNumber(data.data.number || '');
        setWhatsappMessage(data.data.message || '');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/settings/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: {
            number: whatsappNumber,
            message: whatsappMessage,
          },
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings.');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage('Error saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Global Settings</h1>
        <p>Manage application-wide configurations</p>
      </div>

      <div className="settings-card">
        <h2>WhatsApp Integration</h2>
        <p className="settings-desc">Configure the floating WhatsApp button on the client application.</p>
        
        {message && <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label htmlFor="whatsappNumber">WhatsApp Phone Number</label>
            <input
              type="text"
              id="whatsappNumber"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="e.g. 1234567890 (no spaces or hyphens)"
              required
            />
            <small>Include country code without '+' (e.g. 919876543210 for India)</small>
          </div>

          <div className="form-group">
            <label htmlFor="whatsappMessage">Default Pre-filled Message</label>
            <textarea
              id="whatsappMessage"
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              placeholder="e.g. Hello, I am interested in property details."
              rows={3}
            />
            <small>This message will be automatically populated when the user clicks the floating button.</small>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isSaving} className="save-btn">
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
