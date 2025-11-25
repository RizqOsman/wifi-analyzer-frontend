import { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const Layout = () => {
  // Sidebar state: true = expanded, false = collapsed (mini)
  // On mobile, we might want a different behavior (overlay), but for now let's handle desktop collapse
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Handle window resize to auto-collapse on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setSidebarExpanded(false); // Default to collapsed/hidden on mobile
      } else {
        setIsMobile(false);
        setSidebarExpanded(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuGroups = [
    {
      title: 'Overview',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      ]
    },
    {
      title: 'Operations',
      items: [
        { icon: Radio, label: 'Campaigns', path: '/campaigns' },
        { icon: Wifi, label: 'Networks', path: '/networks' },
        { icon: Zap, label: 'Attacks', path: '/attacks' },
      ]
    },
    {
      title: 'Administration',
      items: [
        { icon: Users, label: 'Users', path: '/users' },
        { icon: Lock, label: 'Roles', path: '/roles' },
        { icon: Settings, label: 'Permissions', path: '/permissions' },
      ]
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/login';
    }
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex flex-col">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-cyan-500/20 h-16">
        <div className="px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-cyan-400"
            >
              {sidebarExpanded ? <Menu size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center gap-3">
              <Shield className="text-cyan-400" size={28} />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-wider text-white">
                  R.A.D.A.R
                </span>
                <span className="text-[10px] text-cyan-400/70 font-medium hidden sm:block leading-tight tracking-widest">
                  ROGUE ACCESS DETECTION
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/5 hover:bg-white/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <User size={16} />
              </div>
              <div className="text-right hidden md:block pr-2">
                <p className="text-sm font-medium text-gray-200">{user?.name}</p>
                <p className="text-[10px] text-cyan-400">{user?.email}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex pt-16 h-screen overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            width: sidebarExpanded ? 260 : 80,
            x: isMobile && !sidebarExpanded ? -100 : 0
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed left-0 h-[calc(100vh-4rem)] glass-effect border-r border-cyan-500/20 z-40 flex flex-col
            ${isMobile && !sidebarExpanded ? '-translate-x-full' : ''}
          `}
        >
          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 custom-scrollbar">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {sidebarExpanded && (
                  <h3 className="px-4 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all group
                          ${isActive
                            ? 'bg-cyan-500/10 text-cyan-400'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }
                          ${!sidebarExpanded ? 'justify-center' : ''}
                        `}
                        title={!sidebarExpanded ? item.label : ''}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-cyan-500/10 rounded-xl border border-cyan-500/30"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}

                        <div className="relative z-10 flex items-center gap-3">
                          <Icon size={20} className={isActive ? 'text-cyan-400' : ''} />

                          {sidebarExpanded && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="font-medium whitespace-nowrap"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </div>

                        {/* Active Indicator Dot for Collapsed Mode */}
                        {!sidebarExpanded && isActive && (
                          <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer (Optional) */}
          <div className="p-4 border-t border-white/5">
            <div className={`flex items-center ${sidebarExpanded ? 'justify-between' : 'justify-center'}`}>
              {sidebarExpanded && (
                <span className="text-xs text-gray-600">v1.0.0</span>
              )}
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" title="System Online" />
            </div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-300 overflow-y-auto h-[calc(100vh-4rem)]
            ${sidebarExpanded && !isMobile ? 'ml-[260px]' : isMobile ? 'ml-0' : 'ml-[80px]'}
          `}
        >
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>

        {/* Mobile Overlay */}
        {isMobile && sidebarExpanded && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarExpanded(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Layout;
