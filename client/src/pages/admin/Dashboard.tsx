const StatCard = ({ title, value, label }: any) => (
  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
    <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 'var(--spacing-sm)' }}>{title}</h3>
    <div style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>{value}</div>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</p>
  </div>
);

const AdminDashboard = () => {
  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Dashboard Overview</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)' }}>
        <StatCard title="Total Properties" value="24" label="Across all regions" />
        <StatCard title="Active Leads" value="156" label="+12 this week" />
        <StatCard title="Mediations Closed" value="38" label="$45.2M in value" />
      </div>
    </div>
  );
};

export default AdminDashboard;
