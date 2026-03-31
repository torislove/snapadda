import { useState, useEffect } from 'react';
import { 
  Heart, Share2, Users, Search, 
  TrendingUp, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EngagementLog {
  userId: { _id: string; name: string; email: string };
  timestamp: string;
  platform?: string;
}

interface EngagementData {
  _id: string;
  title: string;
  likeCount: number;
  shareCount: number;
  likeLogs: EngagementLog[];
  shareLogs: EngagementLog[];
}

const AdminEngagement = () => {
  const [data, setData] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'likes' | 'shares'>('all');

  useEffect(() => {
    fetchEngagement();
  }, []);

  const fetchEngagement = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/properties/engagement`);
      const result = await response.json();
      if (result.status === 'success') {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch engagement stats", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((item: EngagementData) => 
    item.title.toLowerCase().includes(search.toLowerCase())
  ).filter((item: EngagementData) => {
    if (activeTab === 'likes') return item.likeCount > 0;
    if (activeTab === 'shares') return item.shareCount > 0;
    return true;
  });

  const totalLikes = data.reduce((acc: number, curr: EngagementData) => acc + curr.likeCount, 0);
  const totalShares = data.reduce((acc: number, curr: EngagementData) => acc + curr.shareCount, 0);

  return (
    <div className="engagement-page" style={{ padding: '1rem' }}>
      {/* Header Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-glass)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '10px', background: 'rgba(245,57,123,0.1)', color: 'var(--rose)', borderRadius: '12px' }}>
              <Heart size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Platform Likes</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalLikes}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>+12% from last week</div>
        </div>

        <div style={{ background: 'var(--bg-glass)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '10px', background: 'rgba(91,102,242,0.1)', color: 'var(--violet)', borderRadius: '12px' }}>
              <Share2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Property Shares</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalShares}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--violet)' }}>Across WhatsApp, Meta, Web</div>
        </div>

        <div style={{ background: 'var(--bg-glass)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '10px', background: 'rgba(16,217,140,0.1)', color: 'var(--emerald)', borderRadius: '12px' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unique Interactors</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.length}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>Active Engaging Users</div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          {(['all', 'likes', 'shares'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 16px', borderRadius: '8px', border: 'none', background: activeTab === tab ? 'var(--gold)' : 'transparent',
                color: activeTab === tab ? '#000' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" placeholder="Search property name..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 10px 10px 40px', background: 'var(--bg-glass)', border: '1px solid var(--border)',
              borderRadius: '12px', color: '#fff', outline: 'none'
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: 'var(--bg-glass)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Property Title</th>
              <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Engagement</th>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Latest Activity</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredData.map((item, idx) => (
                <motion.tr 
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                  className="table-row-hover"
                >
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ fontWeight: 600 }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <TrendingUp size={12} color="var(--gold)" /> High Interest Property
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Heart size={14} color="var(--rose)" fill="rgba(245,57,123,0.1)" />
                        <span style={{ fontWeight: 700 }}>{item.likeCount}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Share2 size={14} color="var(--violet)" />
                        <span style={{ fontWeight: 700 }}>{item.shareCount}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    {item.likeLogs?.length > 0 || item.shareLogs?.length > 0 ? (
                      <div style={{ fontSize: '0.8rem' }}>
                        <div style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <Users size={12} /> 
                           {(item.likeLogs[0]?.userId?.name || item.shareLogs[0]?.userId?.name || 'Anonymous')}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                           <Calendar size={10} style={{ marginRight: '4px' }} />
                           {new Date(item.likeLogs[0]?.timestamp || item.shareLogs[0]?.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No logs available</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        
        {filteredData.length === 0 && !loading && (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No engagement data found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEngagement;
