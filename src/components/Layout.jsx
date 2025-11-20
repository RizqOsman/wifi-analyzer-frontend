import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Wifi,
  Radio,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Zap,
  Lock,
  User,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Radio, label: 'Campaigns', path: '/campaigns' },
    { icon: Wifi, label: 'Networks', path: '/networks' },
    { icon: Zap, label: 'Attacks', path: '/attacks' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Lock, label: 'Roles', path: '/roles' },
    { icon: Settings, label: 'Permissions', path: '/permissions' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      // Force reload untuk memastikan state benar-benar clear
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Tetap redirect meskipun ada error
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-blue/5 via-transparent to-transparent pointer-events-none" />

      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-neon-blue/20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center gap-3">
                <Shield className="text-neon-blue animate-pulse-slow" size={32} />
                <span className="text-xl font-bold neon-text hidden sm:block">
                  WiFi Security Analyzer
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <User size={18} />
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 w-64 h-[calc(100vh-4rem)] glass-effect border-r border-neon-blue/20 overflow-y-auto"
            >
              <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                          ? 'bg-neon-blue/20 text-neon-blue neon-glow'
                          : 'hover:bg-white/5 text-gray-300 hover:text-white'
                        }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'
            }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
