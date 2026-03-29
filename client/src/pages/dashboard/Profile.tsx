import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { MapPin, Settings, LogOut, ChevronRight, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const menuItems = [
    { label: 'My Inquiries', icon: ShieldCheck },
    { label: 'Saved Regions', icon: MapPin },
    { label: 'Notification Settings', icon: Settings },
  ];

  if (!user) return null;

  return (
    <div className="profile-page flex flex-col items-center">
      <div className="profile-header w-full flex flex-col items-center mb-8 mt-4">
        <div className="avatar-wrapper w-24 h-24 rounded-full overflow-hidden border-2 border-accent-gold mb-4 p-1">
          <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=c9a84c&color=111`} alt={user.name} className="w-full h-full rounded-full object-cover" />
        </div>
        <h2 className="text-2xl font-bold">{user.name}</h2>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <div className="profile-preferences w-full bg-secondary border border-subtle rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-accent-gold">Current Preferences</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm border-b border-subtle pb-2">
            <span className="text-muted-foreground">Property Type</span>
            <span className="font-medium">{user.preferences?.propertyType || 'Not specified'}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-subtle pb-2">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">{user.preferences?.budget || 'Not specified'}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-subtle pb-2">
            <span className="text-muted-foreground">Purpose</span>
            <span className="font-medium">{user.preferences?.purpose || 'Not specified'}</span>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <span className="text-sm text-muted-foreground">Looking in</span>
            <div className="flex flex-wrap gap-2">
              {(user.preferences?.locations?.length ?? 0) > 0 ? (
                user.preferences?.locations.map((loc, idx) => (
                  <span key={idx} className="bg-muted text-accent-gold text-xs font-semibold px-2 py-1 rounded-lg border border-gold-dim">
                    {loc}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground opacity-50 italic">None selected</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="settings-menu w-full space-y-2 mb-10">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.button
              whileTap={{ scale: 0.98 }}
              key={idx}
              className="w-full flex items-center justify-between p-4 bg-tertiary rounded-xl text-sm font-medium border border-subtle hover:border-accent-gold-dim transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className="text-accent-gold" />
                <span>{item.label}</span>
              </div>
              <ChevronRight size={16} />
            </motion.button>
          );
        })}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-4 text-red-400 font-semibold hover:bg-red-900/10 rounded-xl transition-colors mt-6"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>

      <p className="text-xs text-muted-foreground opacity-30 mt-10">SnapAdda v1.0.2 Premium Edition</p>
    </div>
  );
};

export default Profile;
