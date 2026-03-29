import { useState, useEffect } from 'react';
import { Mail, Calendar, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminClients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      setClients(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-gold-600">
            Registered Clients
          </h1>
          <p className="text-gray-400">Manage your user base and their real estate requirements</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 w-[300px]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white hover:border-gold-500 transition-colors">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden glass-effect">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/50 border-b border-gray-700">
                <th className="p-4 text-sm font-semibold text-gray-300">Client Profile</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Property Requirement</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Budget Constraint</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Target Area</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">Loading clients data...</td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">No registered clients found.</td>
                </tr>
              ) : (
                clients.map((client, idx) => (
                  <motion.tr 
                    key={client._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={client.avatar || `https://ui-avatars.com/api/?name=${client.name}`} 
                          alt={client.name} 
                          className="w-10 h-10 rounded-full border border-gray-700"
                        />
                        <div>
                          <p className="font-medium text-white">{client.name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {client.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {client.onboardingCompleted ? (
                        <div>
                          <p className="text-gold-400 font-medium">{client.preferences?.propertyType || 'Any'}</p>
                          <p className="text-xs text-gray-400">{client.preferences?.purpose || 'N/A'}</p>
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-900/40 text-yellow-500 rounded text-xs border border-yellow-800/50">
                          Pending Onboarding
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-gray-300">
                        {client.preferences?.budget || '--'}
                      </span>
                    </td>
                    <td className="p-4">
                      {client.preferences?.locations?.length > 0 
                        ? client.preferences.locations.join(', ')
                        : 'Any Location'}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(client.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminClients;
