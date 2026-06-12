import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalModals } from '@/components/ui/GlobalModals';
import { Settings, Map as MapIcon, Package, MessageSquare, Activity, Users, ShieldAlert, Lock, Unlock, ShoppingCart, LogOut, RefreshCw, Wifi, WifiOff, Shield, Terminal } from 'lucide-react';

import { CargoBayView } from './views/CargoBayView';
import { ChatBoxView } from './views/ChatBoxView';
import { DropperListView } from './views/DropperListView';
import { UserRosterView } from './views/UserRosterView';
import { StocksAnalysisView } from './views/StocksAnalysisView';
import { ControlSettingsView } from './views/ControlSettingsView';
import { useRole } from '@/context/RoleContext';
import { useAuth } from '@/app/providers/AuthContext';
import { useLocationOutboxStatus } from '@/hooks/useLocationOutboxStatus';

export function BaseLayout() {
  const { isClient, role, loading, isSuperAdmin } = useRole();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'cargo' | 'chat' | 'droppers' | 'stocks' | 'settings' | 'roster'>('map');
  
  const isExpanded = isHovered || isLocked;

  // Auto-redirect if client tries to access restricted tabs
  useEffect(() => {
    if (!loading && isClient && (activeTab === 'cargo' || activeTab === 'stocks' || activeTab === 'droppers')) {
      setActiveTab('map');
    }
  }, [activeTab, isClient, loading]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const getAccountBadge = (userRole: string | null | undefined) => {
    const r = (userRole || '').toLowerCase();
    if (r === 'admin' || r === 'dropper') {
      return {
        src: '/dropper_role_icon.jpg',
        borderColor: 'border-[#3b82f6]',
        shadowColor: 'rgba(59,130,246,0.5)',
        textColor: 'text-blue-400',
        textGlow: 'drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]',
        label: 'DROPPER'
      };
    } else if (r === 'client' || r === 'buyer') {
      return {
        src: '/client_role_icon.jpg',
        borderColor: 'border-[#f5a623]',
        shadowColor: 'rgba(245,166,35,0.5)',
        textColor: 'text-amber-500',
        textGlow: 'drop-shadow-[0_0_6px_rgba(245,166,35,0.5)]',
        label: 'BUYER/CLIENT'
      };
    } else {
      return {
        src: '/admin_role_icon.jpg',
        borderColor: 'border-[#0ad111]',
        shadowColor: 'rgba(10,209,17,0.5)',
        textColor: 'text-emerald-400',
        textGlow: 'drop-shadow-[0_0_6px_rgba(10,209,17,0.5)]',
        label: 'OPERATOR/BOSS'
      };
    }
  };

  const badge = getAccountBadge(role);

  return (
    <div 
      className="min-h-screen bg-black text-[--text-primary] flex font-sans overflow-hidden"
    >
      
      {/* Sidebar Navigation */}
      <motion.aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{ 
          width: isExpanded ? 280 : 80,
          boxShadow: isExpanded 
            ? "12px 0 50px rgba(16,96,17,0.3), inset -4px 0 15px rgba(16,96,17,0.15)" 
            : "4px 0 25px rgba(16,96,17,0.15), inset 0 0 0 rgba(16,96,17,0)",
          borderColor: isExpanded ? "rgba(16,96,17,0.9)" : "rgba(16,96,17,0.6)"
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8, bounce: 0.15 }}
        className="h-full border-r bg-black/95 flex flex-col items-start p-4 py-6 gap-8 z-50 shrink-0 select-none relative overflow-hidden"
      >
        {/* Tactical HUD Corner Brackets */}
        <div className="absolute top-1 left-1.5 w-4 h-4 border-t-2 border-l-2 border-[#106011] pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.85)] z-20"></div>
        <div className="absolute top-1 right-1.5 w-4 h-4 border-t-2 border-r-2 border-[#106011] pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.85)] z-20"></div>
        <div className="absolute bottom-1 left-1.5 w-4 h-4 border-b-2 border-l-2 border-[#106011] pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.85)] z-20"></div>
        <div className="absolute bottom-1 right-1.5 w-4 h-4 border-b-2 border-r-2 border-[#106011] pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.85)] z-20"></div>

        {/* Inner Nested High-Contrast Tactical HUD Lines */}
        <div className="absolute inset-y-2 inset-x-2 border border-dashed border-[#106011]/30 pointer-events-none rounded-md z-10"></div>
        <div className="absolute inset-y-3 inset-x-3 border border-[#106011]/15 pointer-events-none rounded-sm z-10"></div>

        {/* Decorative side telemetry ticks */}
        <div className="absolute top-20 bottom-20 left-1 w-px border-l border-dotted border-[#106011]/20 pointer-events-none z-10"></div>
        <div className="absolute top-20 bottom-20 right-1 w-px border-r border-dotted border-[#106011]/20 pointer-events-none z-10"></div>

        {/* Animated Background Rings (Tactical radar deco) */}
        <div className="absolute inset-x-0 top-0 h-40 pointer-events-none opacity-10">
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full border border-dashed border-[#106011]/40 animate-spin-slow"></div>
          <div className="absolute -top-8 -left-8 w-36 h-36 rounded-full border border-dotted border-[#106011]/30 animate-spin-reverse-slow"></div>
        </div>

        {/* Brand / Home Link - Tactical HUD Chat Box / Comms Brand */}
        <Link 
          to="/" 
          onClick={() => setActiveTab('map')}
          className="relative group/brand flex items-center justify-center w-full h-16 rounded-xl bg-black/95 border border-[#106011]/50 shadow-[0_0_15px_rgba(16,96,17,0.25)] hover:border-[#106011] hover:shadow-[0_0_20px_rgba(16,96,17,0.5)] transition-all duration-300 select-none z-10 overflow-hidden"
          id="sidebar-brand-link"
        >
          {/* Universal Tactical HUD Corner Brackets (On top of image) */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 pointer-events-none z-20 group-hover/brand:scale-105 transition-transform duration-300 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)]"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 pointer-events-none z-20 group-hover/brand:scale-105 transition-transform duration-300 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)]"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 pointer-events-none z-20 group-hover/brand:scale-105 transition-transform duration-300 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)]"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 pointer-events-none z-20 group-hover/brand:scale-105 transition-transform duration-300 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)]"></div>

          {/* Nested Rectangle Tactical HUD borders (On top of image) */}
          <div className="absolute inset-0.5 border border-dashed pointer-events-none rounded-[10px] z-20 border-[#106011]/30 group-hover/brand:border-[#106011]/50 transition-colors"></div>
          <div className="absolute inset-1 border pointer-events-none rounded-[8px] z-20 border-[#106011]/15 group-hover/brand:border-[#106011]/30 transition-colors"></div>
          
          <motion.div
            animate={{ opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full relative z-10"
          >
            <img 
              src="/coverphoto003.jpg" 
              alt="Droppin Ops Brand" 
              className="w-full h-full object-cover group-hover/brand:scale-105 transition-all duration-700" 
              referrerPolicy="no-referrer"
            />
            {/* Dynamic Scanning Mask Layer for Brand Image */}
            <motion.div 
              animate={{ x: ['-150%', '250%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-full bg-gradient-to-r from-transparent via-[#0ad111]/15 to-transparent skew-x-[25deg] pointer-events-none z-20"
            />
          </motion.div>

          {/* Tactical Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-20"></div>
          <div className="absolute top-1 right-2 text-[6px] font-mono text-[#106011] tracking-widest uppercase z-30 opacity-70">
            OP.UNIT: ALPHA
          </div>
        </Link>
        
        {/* Sidebar Nav Items */}
        <nav className="flex-1 flex flex-col items-start gap-4 w-full z-10 mt-2">
          <NavItem icon={<MapIcon className="w-5 h-5" />} active={activeTab === 'map'} tooltip="Drop Map" label="DROP MAP" isExpanded={isExpanded} onClick={() => setActiveTab('map')} />
          {!isClient && (
            <NavItem icon={<Package className="w-5 h-5" />} active={activeTab === 'cargo'} tooltip="Inventory" label="INV. LOCKER" isExpanded={isExpanded} onClick={() => setActiveTab('cargo')} badge="LOCK ON" badgeStyle="border-red-900 bg-red-950 text-red-500 font-bold shadow-[0_0_12px_rgba(220,38,38,0.5)]" />
          )}
          <NavItem icon={<MessageSquare className="w-5 h-5" />} active={activeTab === 'chat'} tooltip="Chat Box" label="CHAT BOX" isExpanded={isExpanded} onClick={() => setActiveTab('chat')} />
          {!isClient && (
            <NavItem icon={<Users className="w-5 h-5" />} active={activeTab === 'droppers'} tooltip="Dropper List" label="ONLINE DROPPERS" isExpanded={isExpanded} onClick={() => setActiveTab('droppers')} badge="4 ACTIVE" badgeStyle="border-[#106011] bg-[#106011]/20 text-green-400 font-bold shadow-[0_0_12px_rgba(16,96,17,0.5)] animate-pulse" />
          )}
          {!isClient && (
            <NavItem icon={<Activity className="w-5 h-5" />} active={activeTab === 'stocks'} tooltip="Stocks Analysis" label="STOCKS ANALYSIS" isExpanded={isExpanded} onClick={() => setActiveTab('stocks')} />
          )}
          {isSuperAdmin && (
            <NavItem icon={<Users className="w-5 h-5" />} active={activeTab === 'roster'} tooltip="Account Roster" label="SECURE ROSTER" isExpanded={isExpanded} onClick={() => setActiveTab('roster')} badge="FULL CONTROL" badgeStyle="border-red-900 bg-red-950/40 text-red-500 animate-pulse" />
          )}
        </nav>
        
        {/* Bottom Actions - Tactical Control Panel */}
        <div className="w-full flex flex-col gap-3 z-10 pt-5 mt-auto border-t border-[#106011]/30 relative group/bottom">
          {/* Subtle scanning glow background for the control area */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#106011]/5 to-transparent pointer-events-none opacity-0 group-hover/bottom:opacity-100 transition-opacity duration-700" />
          
          <NavItem 
            icon={<Settings className="w-5 h-5 animate-spin-[10s_linear_infinite]" />} 
            active={activeTab === 'settings'} 
            tooltip="Control Settings" 
            label="SYSTEM CONFIG" 
            isExpanded={isExpanded} 
            onClick={() => setActiveTab('settings')} 
          />
          
          {/* Latch Lock Switch - Enhanced HUD Action */}
          <button 
            id="sidebar-lock-toggle"
            onClick={() => setIsLocked(!isLocked)}
            className="w-full h-10 rounded-xl flex items-center justify-center text-[#106011] bg-black/95 hover:bg-[#106011]/25 border-2 border-[#106011]/80 shadow-[0_0_15px_rgba(16,96,17,0.35)] hover:shadow-[0_0_25px_rgba(16,96,17,0.6)] transition-all duration-300 cursor-pointer relative gap-3 px-3 overflow-hidden select-none font-bold group/lock"
          >
            {/* Tactical HUD Corner Brackets */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.9)] z-20 transition-transform group-hover/lock:-translate-x-0.5 group-hover/lock:-translate-y-0.5"></div>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.9)] z-20 transition-transform group-hover/lock:translate-x-0.5 group-hover/lock:-translate-y-0.5"></div>
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.9)] z-20 transition-transform group-hover/lock:-translate-x-0.5 group-hover/lock:translate-y-0.5"></div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.9)] z-20 transition-transform group-hover/lock:translate-x-0.5 group-hover/lock:translate-y-0.5"></div>
            
            {/* Inner Nested HUD Overlay */}
            <div className="absolute inset-0.5 border border-dashed border-[#106011]/30 pointer-events-none rounded-[10px] z-10 group-hover/lock:border-[#106011]/50 transition-colors"></div>
            <div className="absolute inset-1 border border-[#106011]/15 pointer-events-none rounded-[8px] z-10"></div>

            {/* Glowing Scanline */}
            <motion.div 
              animate={{ y: ['-100%', '200%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-x-0 h-px bg-[#106011]/40 blur-[1px] pointer-events-none z-10"
            />

            <div className="shrink-0 flex items-center justify-center relative z-10 group-hover/lock:scale-110 transition-transform duration-300">
              {isLocked ? (
                <Lock className="w-4 h-4 text-[#106011] drop-shadow-[0_0_8px_rgba(10,209,17,0.9)]" />
              ) : (
                <Unlock className="w-4 h-4 text-[#106011] drop-shadow-[0_0_5px_rgba(16,96,17,0.5)] animate-pulse" />
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.span 
                  key={isLocked ? 'locked' : 'unlocked'}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-[9px] font-mono text-[#0ad111] font-black uppercase tracking-[0.18em] whitespace-nowrap bg-black/60 px-2.5 py-0.5 rounded border border-[#106011]/45 relative z-10 shadow-[0_0_10px_rgba(16,96,17,0.2)]"
                >
                  {isLocked ? "LOCK ENGAGED" : "AUTO-EXPAND"}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </button>
<AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="w-full bg-[#050f05]/95 border-2 border-[#106011]/60 rounded-xl overflow-hidden p-3 shadow-[inset_0_0_20px_rgba(16,96,17,0.2)] mb-1 relative"
              >
                {/* Mission Protocol Contents */}
                <div 
                  className="absolute inset-0 w-full h-full opacity-10 pointer-events-none mix-blend-luminosity bg-cover bg-center bg-no-repeat grayscale"
                  style={{ backgroundImage: `url('/coverphoto003.jpg')` }}
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none" />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#106011]/40 pb-2">
                    <div className="w-2 h-2 rounded-full bg-[#0ad111] animate-pulse shadow-[0_0_8px_#0ad111]" />
                    <span className="text-[10px] font-mono font-black text-[#0ad111] tracking-widest uppercase drop-shadow-[0_0_5px_rgba(10,209,17,0.5)]">Mission Protocol</span>
                  </div>
                  
                  <div className="space-y-4 overflow-y-auto max-h-[160px] pr-1 custom-scrollbar">
                    {/* User Role Quick Reference */}
                    {[
                      { role: 'BOSS / OWNER', color: 'border-amber-600', text: 'amber-500', items: ['Track Real-time GPS', 'Monitor Telemetry', 'Verify Proofs'] },
                      { role: 'ADMIN / DROPPER', color: 'border-blue-600', text: 'blue-500', items: ['Pin Grid Coordinates', 'Initialize Drop Units', 'Sync Photo Evidence'] },
                      { role: 'CLIENT / BUYER', color: 'border-green-600', text: 'green-500', items: ['Access Sector Map', 'View Verified Waypoints', 'Submit Payment Hash'] }
                    ].map((item) => (
                      <div key={item.role} className="space-y-1.5 p-1.5 rounded bg-black/40 border border-[#106011]/10">
                        <p className={`text-[9px] font-bold text-[#0ad111] border-l-2 ${item.color} pl-2 font-mono drop-shadow-[0_0_3px_rgba(10,209,17,0.6)]`}>{item.role}</p>
                        <ul className="text-[8px] text-[#0ad111]/80 font-mono space-y-1 pl-3">
                          {item.items.map(subItem => (
                            <li key={subItem} className="flex gap-2">
                              <span className="text-[#0ad111]/60">»</span> 
                              <span>{subItem}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AboutDrawer isExpanded={isExpanded} />

          {/* Logout Button - Critical Action HUD */}
          <button 
            id="sidebar-logout-button"
            onClick={handleLogout}
            className="w-full h-9 bg-red-950/30 border-2 border-red-900/40 hover:border-red-500/80 rounded-xl text-red-500 hover:text-red-400 font-mono text-[9px] font-black tracking-[0.3em] transition-all uppercase flex items-center justify-center gap-3 group/logout cursor-pointer shadow-[0_0_12px_rgba(220,38,38,0.05)] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] relative overflow-hidden"
          >
            {/* Red Pulsing Underglow */}
            <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover/logout:opacity-100 animate-pulse transition-opacity duration-500" />
            
            <LogOut className={`w-3.5 h-3.5 z-10 transition-all duration-300 ${isExpanded ? 'group-hover:translate-x-1' : 'drop-shadow-[0_0_8px_rgba(239,68,68,0.9)] group-hover:scale-125'}`} />
            
            <AnimatePresence>
              {isExpanded && (
                <motion.span 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ 
                    opacity: [1, 0.2, 1], // Blinking effect
                    x: 0 
                  }}
                  transition={{ 
                    opacity: { repeat: Infinity, duration: 1, ease: "easeInOut" },
                    x: { duration: 0.3 }
                  }}
                  exit={{ opacity: 0, x: -5 }}
                  className="whitespace-nowrap z-10 drop-shadow-[0_0_5px_rgba(239,68,68,0.4)] flex items-center gap-1"
                >
                  LOGOUT
                  <motion.span 
                    animate={{ opacity: [1, 0, 1], y: [0, 2, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-[10px]"
                  >
                    ↓
                  </motion.span>
                </motion.span>
              )}
            </AnimatePresence>

            {/* Tactical HUD Corner Elements */}
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-red-500/30 group-hover/logout:border-red-500 z-10 transition-colors" />
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-red-500/30 group-hover/logout:border-red-500 z-10 transition-colors" />

            {/* Tooltip for collapsed state */}
            {!isExpanded && (
              <span className="absolute left-full ml-4 px-3 py-1.5 bg-black border-2 border-red-900/80 text-[10px] font-mono font-bold text-red-500 rounded-lg opacity-0 group-hover/logout:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 pointer-events-none whitespace-nowrap z-[100] tracking-[0.3em] shadow-[0_0_25px_rgba(220,38,38,0.4)] animate-pulse">
                LOGOUT
              </span>
            )}
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Top Header with High-Contrast Tactical HUD and Nested Signal Borders */}
        <motion.header 
          animate={{ opacity: [0.94, 1, 0.94] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="h-16 flex items-center justify-between px-6 border-b border-[#106011]/50 bg-black/95 relative shrink-0 z-40 overflow-hidden shadow-[0_4px_30px_rgba(16,96,17,0.2)]"
        >
          {/* Dynamic Scanning Mask Layer */}
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-[#106011]/10 to-transparent skew-x-[20deg] pointer-events-none z-0"
          />

          {/* Tactical HUD Inset Borders & Corner Brackets */}
          <div className="absolute inset-x-4 inset-y-2 border border-[#106011]/30 pointer-events-none rounded-md"></div>
          <div className="absolute inset-x-5 inset-y-2.5 border border-dashed border-[#106011]/20 pointer-events-none rounded-md"></div>
          
          {/* Header HUD Corner Segments */}
          <div className="absolute top-1 left-3 w-3 h-2 border-t-2 border-l-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.8)]"></div>
          <div className="absolute top-1 right-3 w-3 h-2 border-t-2 border-r-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.8)]"></div>
          <div className="absolute bottom-1 left-3 w-3 h-2 border-b-2 border-l-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.8)]"></div>
          <div className="absolute bottom-1 right-3 w-3 h-2 border-b-2 border-r-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.8)]"></div>

          {/* Miniature telemetry overlay coordinates */}
          <div className="absolute top-2 left-8 text-[7px] font-mono text-[#106011]/60 tracking-widest hidden lg:block pointer-events-none">
            SYS.FRQ: 106.011 MHZ // BND: WIDE
          </div>
          <div className="absolute top-2 right-20 text-[7px] font-mono text-[#106011]/60 tracking-widest hidden lg:block pointer-events-none">
            NODE.LAT: 13.4348° N // LON: 120.5721° E
          </div>

          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-4 relative z-10 pl-2 cursor-pointer"
          >
            <ShoppingCart className="w-6 h-6 text-[#106011] shrink-0 drop-shadow-[0_0_12px_rgba(16,96,17,1)]" />
            <div className="w-44 sm:w-64 md:w-[400px] lg:w-[500px] overflow-hidden relative flex shrink-0 mask-image-fade">
              <motion.h1 
                initial={{ x: "0%" }}
                animate={{ x: "-50%" }}
                transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
                className="text-[10px] md:text-xs font-mono font-bold tracking-[0.12em] text-[#0ad111] uppercase border border-[#ba0202] px-2 py-0.5 bg-black/60 text-center no-underline not-italic drop-shadow-[0_0_8px_rgba(10,209,17,0.75)] whitespace-nowrap"
                style={{ paddingRight: '22px' }}
              >
                {"Message 📩- Payment💲 - Confirmation ✅- Approval 💯-Pin Dropped product loc📍- Legitimate transactions🫱🏻🫲🏽 • Message 📩- Payment💲 - Confirmation ✅- Approval 💯-Pin Dropped product loc📍- Legitimate transactions🫱🏻🫲🏽 • "}
              </motion.h1>
            </div>
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#106011]/30 group/status">
              <motion.span 
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2.5 h-2.5 rounded-full bg-[#0ad111] shadow-[0_0_10px_#0ad111]"
              />
              <span 
                className="text-xs font-mono uppercase tracking-[0.2em] font-black drop-shadow-[0_0_8px_rgba(10,209,17,0.8)]"
                style={{ color: '#0ad111' }}
              >
                CONNECTION ESTABLISHED
              </span>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-5 relative z-10 pr-2">
            <LocationSyncWidget />
            
            {/* Account Login Indicator Badge */}
            <div className="flex items-center gap-2.5 pl-4 border-l border-[#106011]/30 select-none">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-[10px] font-mono font-black text-slate-200 uppercase tracking-widest truncate max-w-[120px]">
                  {profile?.username || profile?.alias || 'OPERATOR'}
                </span>
                <span className={`text-[8px] font-mono font-black uppercase tracking-[0.18em] ${badge.textColor} ${badge.textGlow}`}>
                  {badge.label}
                </span>
              </div>
              
              {/* Glowing Interactive Circle Badge Avatar */}
              <div 
                className={`w-9 h-9 rounded-full border-2 shrink-0 ${badge.borderColor} bg-black flex items-center justify-center p-0.5 relative group/profile shadow-lg`}
                style={{ boxShadow: `0 0 10px ${badge.shadowColor}` }}
              >
                <img 
                  src={badge.src} 
                  alt={badge.label} 
                  className="w-full h-full object-cover rounded-full group-hover/profile:scale-110 transition-transform duration-300" 
                  referrerPolicy="no-referrer" 
                />
                
                {/* Role Icon Overlay Badge */}
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border border-black flex items-center justify-center z-20 shadow-md ${
                  role === 'super_admin' ? 'bg-red-600' : role === 'admin' ? 'bg-blue-600' : role === 'dropper' ? 'bg-emerald-600' : 'bg-amber-600'
                }`}>
                  {role === 'super_admin' || role === 'admin' ? (
                    <Shield size={8} className="text-white" />
                  ) : role === 'dropper' ? (
                    <Terminal size={8} className="text-white" />
                  ) : (
                    <ShoppingCart size={8} className="text-white" />
                  )}
                </div>

                {/* Glowing status ring dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#0ad111] border border-black animate-pulse shadow-[0_0_8px_#0ad111]" />
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto custom-scrollbar relative bg-black/95">
          {/* Enhanced Tactical Background layer active for non-map tabs to preserve operational atmosphere */}
          {activeTab !== 'map' && (
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
              {/* Subtle grid background */}
              <div 
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(16, 96, 17, 0.25) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(16, 96, 17, 0.25) 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px'
                }}
              />
              
              {/* Atmospheric Breathing Glows */}
              <motion.div 
                animate={{ 
                  opacity: [0.15, 0.35, 0.15],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#106011]/8 blur-[100px] pointer-events-none"
              />
              
              <motion.div 
                animate={{ 
                  opacity: [0.1, 0.25, 0.1],
                  scale: [1, 0.95, 1]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#0ad111]/5 blur-[120px] pointer-events-none"
              />

              {/* Symmetrical HUD Ticks and Crosshairs */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[#106011]/40" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[#106011]/40" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[#106011]/40" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[#106011]/40" />

              {/* Glowing vector target indicators */}
              <div className="absolute top-1/2 left-6 -translate-y-1/2 flex flex-col gap-4 text-[7px] font-mono text-[#106011]/40 tracking-widest uppercase font-black">
                <div>[COM_LINK_STABLE]</div>
                <div>SEC: D_NUEVA</div>
              </div>
              <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col gap-4 text-[7px] font-mono text-[#106011]/40 tracking-widest uppercase font-black items-end">
                <div>SYS.VOLTS: 3.8V</div>
                <div>[OPS_SYS_A]</div>
              </div>
            </div>
          )}

          {/* Child active views content styled to float seamlessly above background */}
          <div className="relative z-10 w-full h-full">
            {/* If we are on a specialized sub-route that isn't just the base role dashboard, force Outlet visibility */}
            {location.pathname !== '/' && 
             location.pathname !== '/super-admin' && 
             location.pathname !== '/admin' && 
             location.pathname !== '/dropper' && 
             location.pathname !== '/client' ? (
              <Outlet />
            ) : (
              <>
                {activeTab === 'map' && <Outlet />}
                {activeTab === 'cargo' && <CargoBayView />}
                {activeTab === 'chat' && <ChatBoxView />}
                {activeTab === 'droppers' && <DropperListView onSwitchToChat={() => setActiveTab('chat')} />}
                {activeTab === 'stocks' && <StocksAnalysisView />}
                {activeTab === 'settings' && <ControlSettingsView />}
                {activeTab === 'roster' && isSuperAdmin && <UserRosterView />}
              </>
            )}
          </div>
        </main>
      </div>

      <GlobalModals />
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  active?: boolean;
  tooltip: string;
  label?: string;
  isExpanded?: boolean;
  onClick?: () => void;
  badge?: string;
  badgeStyle?: string;
}

function NavItem({ icon, active, tooltip, label, isExpanded, onClick, badge, badgeStyle }: NavItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const buttonStyle = active
    ? "bg-[#106011]/25 text-[#106011] shadow-[inset_0_0_15px_rgba(16,96,17,0.5)] border border-[#106011] font-bold drop-shadow-[0_0_8px_rgba(16,96,17,0.8)] cursor-default"
    : "text-slate-400 hover:text-[#0ad111] bg-black/40 border border-[#106011]/30 hover:border-[#106011]/80 hover:shadow-[0_0_15px_rgba(16,96,17,0.4)] transition-all cursor-pointer";

  return (
    <button 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group w-full h-12 rounded-xl flex items-center ${isExpanded ? 'px-3 gap-3 justify-start' : 'justify-center'} transition-all duration-500 overflow-hidden ${buttonStyle}`}
    >
      {/* Dynamic Tactical HUD Corner Brackets */}
      <motion.div 
        animate={{ scale: isHovered || active ? 1.1 : 1, opacity: isHovered || active ? 1 : 0.6 }}
        className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 pointer-events-none z-20 border-[#106011] drop-shadow-[0_0_4px_rgba(16,96,17,0.9)]" 
      />
      <motion.div 
        animate={{ scale: isHovered || active ? 1.1 : 1, opacity: isHovered || active ? 1 : 0.6 }}
        className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 pointer-events-none z-20 border-[#106011] drop-shadow-[0_0_4px_rgba(16,96,17,0.9)]" 
      />
      <motion.div 
        animate={{ scale: isHovered || active ? 1.1 : 1, opacity: isHovered || active ? 1 : 0.6 }}
        className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 pointer-events-none z-20 border-[#106011] drop-shadow-[0_0_4px_rgba(16,96,17,0.9)]" 
      />
      <motion.div 
        animate={{ scale: isHovered || active ? 1.1 : 1, opacity: isHovered || active ? 1 : 0.6 }}
        className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 pointer-events-none z-20 border-[#106011] drop-shadow-[0_0_4px_rgba(16,96,17,0.9)]" 
      />
      
      {/* Scanning Line Animation */}
      {(isHovered || active) && (
        <motion.div 
          initial={{ y: "-100%" }}
          animate={{ y: "200%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 h-1 bg-[#106011]/20 blur-[2px] pointer-events-none z-0"
        />
      )}

      {/* Inner Nested Rectangle Lines */}
      <div className={`absolute inset-0.5 border border-dashed pointer-events-none rounded-[10px] z-10 transition-colors duration-500 ${isHovered || active ? 'border-[#106011]/60' : 'border-[#106011]/30'}`} />
      <div className={`absolute inset-1 border pointer-events-none rounded-[8px] z-10 transition-colors duration-500 ${isHovered || active ? 'border-[#106011]/40' : 'border-[#106011]/15'}`} />

      {/* Icon Container with interactive animations */}
      <motion.div 
        animate={{ 
          scale: active ? 1.15 : (isHovered ? 1.25 : 1),
          rotate: active ? 0 : (isHovered ? [0, -5, 5, 0] : 0),
          filter: active || isHovered ? "drop-shadow(0 0 8px rgba(10,209,17,0.8))" : "none"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 15,
          rotate: isHovered ? { duration: 0.5, repeat: Infinity, repeatType: "mirror" } : { duration: 0.2 }
        }}
        className={`${isExpanded ? 'shrink-0' : 'mx-auto'} relative z-10 ${active ? 'text-[#0ad111]' : 'group-hover:text-[#0ad111] transition-colors duration-300'}`}
      >
        {icon}
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="flex-1 flex items-center justify-between min-w-0"
          >
            <span 
              className={`text-[10px] font-display font-black tracking-[0.2em] uppercase truncate relative z-10 ${active ? 'text-[#0ad111] drop-shadow-[0_0_8px_rgba(10,209,17,0.6)]' : 'text-slate-300 group-hover:text-[#0ad111] transition-colors duration-300'}`}
            >
              {label || tooltip}
            </span>
            {badge && (
              <motion.span 
                animate={{ 
                  backgroundColor: active ? "rgba(16,96,17,0.3)" : "rgba(0,0,0,0.6)",
                  borderColor: active ? "rgba(16,96,17,0.8)" : "rgba(16,96,17,0.4)"
                }}
                className={`text-[8px] font-mono leading-none px-2 py-0.5 rounded-sm border select-none h-fit shrink-0 tracking-widest font-black max-w-[85px] truncate flex items-center justify-center min-w-[50px] shadow-[0_0_10px_rgba(0,0,0,0.5)] ${badgeStyle || 'border-[#106011] text-[#106011]'}`}
              >
                {badge}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip for collapsed state */}
      {!isExpanded && (
        <AnimatePresence>
          {isHovered && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute left-[calc(100%+16px)] px-3 py-1.5 bg-black border-2 border-[#106011] text-[#106011] text-[10px] font-mono font-bold rounded-lg whitespace-nowrap z-[100] tracking-widest shadow-[0_0_20px_rgba(16,96,17,0.5)] flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#106011] animate-pulse" />
              {tooltip}
            </motion.span>
          )}
        </AnimatePresence>
      )}
    </button>
  );
}

function AboutDrawer({ isExpanded }: { isExpanded: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isExpanded) return null;

  return (
    <div className="w-full space-y-1.5 mt-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-8 bg-black/80 border border-[#106011]/40 hover:border-[#106011] rounded-lg text-[#106011] font-mono text-[8px] font-black tracking-[0.25em] transition-all uppercase flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_10px_rgba(16,96,17,0.1)]"
      >
        <ShieldAlert className={`w-3 h-3 group-hover:scale-110 transition-transform ${isOpen ? 'text-[#0ad111] drop-shadow-[0_0_5px_#0ad111]' : ''}`} />
        ABOUT / PROTOCOLS
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-[#050f05]/95 border-2 border-[#106011]/60 rounded-lg overflow-hidden backdrop-blur-sm shadow-[inset_0_0_20px_rgba(16,96,17,0.15)] relative"
          >
            {/* Background Cover Photo Overlay */}
            <div 
              className="absolute inset-0 w-full h-full opacity-15 pointer-events-none mix-blend-luminosity bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('/coverphoto003.jpg')` }}
            />

            {/* Universal Tactical HUD Corner Brackets */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 pointer-events-none z-20 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)]"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 pointer-events-none z-20 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)]"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 pointer-events-none z-20 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)]"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 pointer-events-none z-20 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)]"></div>

            {/* Nested Rectangle Tactical HUD borders (On top of image) */}
            <div className="absolute inset-0.5 border border-dashed pointer-events-none rounded-[6px] z-20 border-[#106011]/30"></div>
            <div className="absolute inset-1 border pointer-events-none rounded-[4px] z-20 border-[#106011]/15"></div>

            <div className="p-3 space-y-3 custom-scrollbar max-h-[220px] overflow-y-auto relative z-10">
              {/* System Functionality */}
              <div className="space-y-1.5 border-b border-[#106011]/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#106011]" />
                  <span className="text-[9px] font-black text-[#0ad111] drop-shadow-[0_0_2px_rgba(10,209,17,0.8)] tracking-wider font-mono">SYSTEM_GUIDES</span>
                </div>
                <p className="text-[7px] text-[#0ad111]/90 font-mono leading-relaxed pl-3">
                  This terminal facilitates secure drop tracking via real-time satellite UAV uplinks. Use the sidebar to toggle between map telemetry, secure comms, and inventory locks.
                </p>
              </div>

              {/* Tactical Guilds */}
              <div className="space-y-1.5 border-b border-[#106011]/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#106011]" />
                  <span className="text-[9px] font-black text-[#0ad111] drop-shadow-[0_0_2px_rgba(10,209,17,0.8)] tracking-wider font-mono">OPERATIONAL_FLOW</span>
                </div>
                <p className="text-[7px] text-[#0ad111]/90 font-mono leading-relaxed pl-3">
                  Drops follow a strict three-phase protocol: <br/>
                  1. Initialize Grid Location <br/>
                  2. Upload Tactical Evidence <br/>
                  3. Verify Decrypted Receipt
                </p>
              </div>

              {/* Security Credentials */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-600 animate-pulse" />
                  <span className="text-[9px] font-black text-[#0ad111] tracking-wider font-mono">CREDENTIAL_PROTOCOL</span>
                </div>
                <div className="bg-red-950/20 border border-red-500/20 p-2 rounded">
                  <p className="text-[7px] text-red-500 font-mono leading-relaxed italic drop-shadow-[0_0_2px_rgba(239,68,68,0.8)]">
                    All field credentials are short-lived. Rotate OTP sequences every session. Never share terminal access keys via unencrypted bands.
                  </p>
                </div>
              </div>

              {/* Manifest Data */}
              <div className="pt-1 flex justify-between items-center opacity-30">
                <span className="text-[6px] text-[#106011] font-mono tracking-widest">VER: 1.0.82_STABLE</span>
                <span className="text-[6px] text-[#106011] font-mono tracking-widest">SIG: ENCRYPTED</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LocationSyncWidget() {
  const { isSyncing, queueSize, flush } = useLocationOutboxStatus();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  const handleManualSync = async () => {
    if (isSyncing) return;
    try {
      await flush();
    } catch (e) {
      console.error('[LocationSyncWidget] Manual sync error:', e);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Mini Connection Strength Status */}
      <div 
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-mono tracking-widest uppercase transition-all duration-300 ${
          online 
            ? 'border-[#106011]/30 bg-black/40 text-emerald-500' 
            : 'border-red-900 bg-red-950/20 text-red-500 animate-pulse'
        }`}
      >
        {online ? (
          <Wifi className="w-3.5 h-3.5 text-[#0ad111]" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-red-500" />
        )}
      </div>

      {/* Main Interactive Button */}
      <button
        onClick={handleManualSync}
        disabled={isSyncing || (!online && queueSize === 0)}
        className={`h-8 rounded-xl border flex items-center justify-center px-4 font-mono text-[10px] font-bold tracking-widest transition-all duration-300 select-none relative group/sync overflow-hidden ${
          isSyncing 
            ? 'bg-[#106011]/15 border-[#106011] text-emerald-400' 
            : queueSize > 0
              ? 'bg-amber-950/20 border-amber-600/80 hover:border-amber-500 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-black'
              : 'border-[#106011]/45 bg-black/40 text-[#106011] hover:border-[#106011]/80 hover:text-[#0ad111] hover:shadow-[0_0_15px_rgba(16,96,17,0.35)]'
        }`}
        title="Force Telemetry Outbox Sync Now"
      >
        {/* Tactical HUD Corner elements on hover */}
        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#106011]/25 group-hover/sync:border-[#106011]/80 transition-colors" />
        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#106011]/25 group-hover/sync:border-[#106011]/80 transition-colors" />

        {/* Dynamic Context-Aware Labels */}
        <span className="relative z-10 hidden sm:inline tracking-widest">
          {isSyncing 
            ? "SYNCING..." 
            : queueSize > 0 
              ? `SYNC NOW (${queueSize})` 
              : "SYNCED"
          }
        </span>
      </button>
    </div>
  );
}
