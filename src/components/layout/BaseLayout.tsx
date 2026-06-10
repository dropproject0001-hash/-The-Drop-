import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalModals } from '@/components/ui/GlobalModals';
import { Settings, Map as MapIcon, Package, MessageSquare, Activity, Users, ShieldAlert, Lock, Unlock, ShoppingCart, LogOut } from 'lucide-react';

import { CargoBayView } from './views/CargoBayView';
import { ChatBoxView } from './views/ChatBoxView';
import { DropperListView } from './views/DropperListView';
import { StocksAnalysisView } from './views/StocksAnalysisView';
import { ControlSettingsView } from './views/ControlSettingsView';
import { useRole } from '@/context/RoleContext';
import { useAuth } from '@/app/providers/AuthContext';

export function BaseLayout() {
  const { isClient, role, loading } = useRole();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'cargo' | 'chat' | 'droppers' | 'stocks' | 'settings'>('map');
  
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
          
          <img 
            src="/coverphoto3.jpg" 
            alt="Droppin Ops Brand" 
            className="w-full h-full object-cover relative z-10 opacity-90 group-hover/brand:opacity-100 group-hover/brand:scale-105 transition-all duration-300" 
            referrerPolicy="no-referrer"
          />

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
        </nav>
        
        {/* Bottom Actions */}
        <div className="w-full flex flex-col gap-3 z-10 pt-4 border-t border-[#106011]/20">
          <NavItem icon={<Settings className="w-5 h-5 animate-spin-slow" />} active={activeTab === 'settings'} tooltip="Control Settings" label="CONTROL SETTINGS" isExpanded={isExpanded} onClick={() => setActiveTab('settings')} />
          
          {/* Latch Lock Switch */}
          <button 
            onClick={() => setIsLocked(!isLocked)}
            className="w-full h-10 rounded-xl flex items-center justify-center text-[#106011] bg-black/95 hover:bg-[#106011]/20 border-2 border-[#106011] shadow-[0_0_15px_rgba(16,96,17,0.45)] hover:shadow-[0_0_22px_rgba(16,96,17,0.7)] transition-all duration-300 cursor-pointer relative gap-3 px-3 overflow-hidden select-none font-bold group"
          >
            {/* Tactical HUD Corner Brackets */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.9)] z-20"></div>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.9)] z-20"></div>
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.9)] z-20"></div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.9)] z-20"></div>
            
            {/* Inner Nested Rectangle Lines */}
            <div className="absolute inset-0.5 border border-dashed border-[#106011]/30 pointer-events-none rounded-[10px] z-10"></div>
            <div className="absolute inset-1 border border-[#106011]/15 pointer-events-none rounded-[8px] z-10"></div>

            <div className="shrink-0 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300">
              {isLocked ? (
                <Lock className="w-4 h-4 text-[#106011] drop-shadow-[0_0_6px_rgba(16,96,17,0.85)]" />
              ) : (
                <Unlock className="w-4 h-4 text-[#106011] drop-shadow-[0_0_4px_rgba(16,96,17,0.5)] animate-pulse" />
              )}
            </div>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-[9px] font-mono text-[#106011] font-black uppercase tracking-[0.18em] whitespace-nowrap bg-black/40 px-2.5 py-0.5 rounded border border-[#106011]/45 relative z-10 drop-shadow-[0_0_5px_rgba(16,96,17,0.7)]"
                >
                  {isLocked ? "LOCK ON" : "LOCK OFF"}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Mission Protocol / Instructions Drawer */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="w-full bg-[#050f05]/95 border-2 border-[#106011]/60 rounded-xl overflow-hidden p-3 shadow-[inset_0_0_20px_rgba(16,96,17,0.15)] mb-1 relative"
              >
                {/* Background Cover Photo Overlay */}
                <div 
                  className="absolute inset-0 w-full h-full opacity-15 pointer-events-none mix-blend-luminosity bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url('/coverphoto3.jpg')` }}
                />

                {/* Universal Tactical HUD Corner Brackets */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 pointer-events-none z-20 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)]"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 pointer-events-none z-20 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)]"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 pointer-events-none z-20 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)]"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 pointer-events-none z-20 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)]"></div>

                {/* Nested Rectangle Tactical HUD borders */}
                <div className="absolute inset-0.5 border border-dashed pointer-events-none rounded-[10px] z-20 border-[#106011]/30"></div>
                <div className="absolute inset-1 border pointer-events-none rounded-[8px] z-20 border-[#106011]/15"></div>

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#106011]/30 pb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0ad111] animate-pulse" />
                    <span className="text-[10px] font-mono font-black text-[#0ad111] tracking-widest uppercase">Mission Protocol</span>
                  </div>
                  
                  <div className="space-y-3 overflow-y-auto max-h-[160px] pr-1 custom-scrollbar">
                    {/* Boss/Owner Instructions */}
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-100/90 border-l-2 border-amber-600 pl-1.5 font-mono">BOSS / OWNER</p>
                      <ul className="text-[8px] text-slate-400 font-mono space-y-1 pl-2">
                        <li className="flex gap-1"><span>•</span> <span>Track Droppers in real-time</span></li>
                        <li className="flex gap-1"><span>•</span> <span>Monitor spatial telemetry updates</span></li>
                        <li className="flex gap-1"><span>•</span> <span>Verify payment & drop proof</span></li>
                      </ul>
                    </div>

                    {/* Dropper Instructions */}
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-100/90 border-l-2 border-blue-600 pl-1.5 font-mono">ADMIN / DROPPER</p>
                      <ul className="text-[8px] text-slate-400 font-mono space-y-1 pl-2">
                        <li className="flex gap-1"><span>•</span> <span>Initialize product drop units</span></li>
                        <li className="flex gap-1"><span>•</span> <span>Pin exact GPS grid coordinates</span></li>
                        <li className="flex gap-1"><span>•</span> <span>Sync tactical photo evidence</span></li>
                      </ul>
                    </div>

                    {/* Client Instructions */}
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-100/90 border-l-2 border-[#106011] pl-1.5 font-mono">CLIENT / BUYER</p>
                      <ul className="text-[8px] text-slate-400 font-mono space-y-1 pl-2">
                        <li className="flex gap-1"><span>•</span> <span>Access real-time sector map</span></li>
                        <li className="flex gap-1"><span>•</span> <span>View verified drop waypoints</span></li>
                        <li className="flex gap-1"><span>•</span> <span>Submit payment decryption</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* About System / Guides Drawer */}
          <AboutDrawer isExpanded={isExpanded} />

          {/* Logout / Terminate Session Button */}
          <button 
            onClick={handleLogout}
            className="w-full h-8 bg-red-950/40 border border-red-900/60 hover:border-red-600 rounded-lg text-red-500 hover:text-red-400 font-mono text-[8px] font-black tracking-[0.25em] transition-all uppercase flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_10px_rgba(220,38,38,0.1)] relative"
          >
            <LogOut className={`w-3 h-3 group-hover:scale-110 transition-transform ${isExpanded ? '' : 'drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]'}`} />
            
            <AnimatePresence>
              {isExpanded && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  LOG OUT
                </motion.span>
              )}
            </AnimatePresence>

            {/* Tooltip for collapsed state */}
            {!isExpanded && (
              <span className="absolute left-full ml-4 px-2.5 py-1 bg-black/95 border-2 text-[9px] font-mono rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 tracking-widest border-red-900 text-red-500 shadow-[0_0_10px_rgba(220,38,38,0.3)]">
                LOG OUT
              </span>
            )}
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Top Header with High-Contrast Tactical HUD and Nested Signal Borders */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[#106011]/50 bg-black/95 relative shrink-0 z-40 overflow-hidden shadow-[0_4px_25px_rgba(16,96,17,0.15)]">
          {/* Tactical HUD Inset Borders & Corner Brackets */}
          <div className="absolute inset-x-4 inset-y-2 border border-[#106011]/30 pointer-events-none rounded-md"></div>
          <div className="absolute inset-x-5 inset-y-2.5 border border-dashed border-[#106011]/15 pointer-events-none rounded-md"></div>
          
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

          <div className="flex items-center gap-4 relative z-10 pl-2">
            <ShoppingCart className="w-6 h-6 text-[#106011] shrink-0 drop-shadow-[0_0_8px_rgba(16,96,17,0.8)]" />
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
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#106011]/30">
              <span className="w-2 h-2 rounded-full bg-[#106011] animate-ping"></span>
              <span 
                className="text-xs font-mono uppercase tracking-widest font-semibold drop-shadow-[0_0_5px_rgba(16,96,17,0.6)]"
                style={{ color: '#2fe731' }}
              >
                CONNECTION ESTABLISHED
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 relative z-10 pr-2">
            
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto custom-scrollbar relative">
          {activeTab === 'map' && <Outlet />}
          {activeTab === 'cargo' && <CargoBayView />}
          {activeTab === 'chat' && <ChatBoxView />}
          {activeTab === 'droppers' && <DropperListView onSwitchToChat={() => setActiveTab('chat')} />}
          {activeTab === 'stocks' && <StocksAnalysisView />}
          {activeTab === 'settings' && <ControlSettingsView />}
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
  const buttonStyle = active
    ? "bg-[#106011]/25 text-[#106011] shadow-[inset_0_0_12px_rgba(16,96,17,0.4)] border border-[#106011] font-bold drop-shadow-[0_0_6px_rgba(16,96,17,0.7)] cursor-default"
    : "text-slate-400 hover:text-[#106011] bg-black/40 border border-[#106011]/30 hover:border-[#106011] hover:shadow-[0_0_12px_rgba(16,96,17,0.3)] transition-all cursor-pointer";

  return (
    <button 
      onClick={onClick}
      className={`relative group w-full h-11 rounded-xl flex items-center ${isExpanded ? 'px-3 gap-3 justify-start' : 'justify-center'} transition-all duration-300 overflow-hidden ${buttonStyle}`}
    >
      {/* Universal Tactical HUD Corner Brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 pointer-events-none z-20 group-hover:scale-105 transition-transform duration-300 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)]"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 pointer-events-none z-20 group-hover:scale-105 transition-transform duration-300 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)]"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 pointer-events-none z-20 group-hover:scale-105 transition-transform duration-300 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)]"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 pointer-events-none z-20 group-hover:scale-105 transition-transform duration-300 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)]"></div>
      
      {/* Inner Nested Rectangle Lines */}
      <div className="absolute inset-0.5 border border-dashed pointer-events-none rounded-[10px] z-10 border-[#106011]/30 group-hover:border-[#106011]/50 transition-colors"></div>
      <div className="absolute inset-1 border pointer-events-none rounded-[8px] z-10 border-[#106011]/15 group-hover:border-[#106011]/30 transition-colors"></div>

      <div className={`${isExpanded ? 'shrink-0' : 'mx-auto'} relative z-10 ${active ? 'text-[#106011] drop-shadow-[0_0_5px_rgba(16,96,17,0.85)]' : 'group-hover:scale-110 group-hover:text-[#106011] transition-all duration-300'}`}>
        {icon}
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex-1 flex items-center justify-between min-w-0"
          >
            <span 
              className={`text-[10px] font-display font-black tracking-widest uppercase truncate relative z-10 ${active ? 'text-[#106011] drop-shadow-[0_0_6px_rgba(16,96,17,0.7)]' : 'text-slate-200 group-hover:text-[#106011] transition-colors'}`}
            >
              {label || tooltip}
            </span>
            {badge && (
              <span className={`text-[8px] font-mono leading-none px-1.5 py-0.5 rounded border select-none h-fit shrink-0 tracking-wider font-extrabold max-w-[85px] truncate flex items-center justify-center min-w-[50px] ${badgeStyle || 'border-[#106011] bg-black text-[#106011]'}`}>
                {badge}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* When collapsed, show tiny glowing badge pill or notification dot */}
      {!isExpanded && badge && (
        <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full border border-black z-20 ${badge.includes('ACTIVE') || badge.includes('ON') ? 'bg-red-500 animate-pulse shadow-[0_0_6px_rgba(220,38,38,0.9)]' : 'bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.9)]'}`}></span>
      )}

      {/* Tooltip Link */}
      {!isExpanded && (
        <span className="absolute left-full ml-4 px-2.5 py-1 bg-black/95 border-2 text-[9px] font-mono rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 tracking-widest border-[#106011] text-[#106011] drop-shadow-[0_0_5px_rgba(16,96,17,0.5)] shadow-[0_0_10px_rgba(16,96,17,0.3)]">
          {tooltip}
        </span>
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
              style={{ backgroundImage: `url('/coverphoto3.jpg')` }}
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
                  <div className="w-1 h-1 rounded-full bg-[#0ad111]" />
                  <span className="text-[9px] font-black text-slate-100 tracking-wider font-mono">SYSTEM_GUIDES</span>
                </div>
                <p className="text-[7px] text-slate-500 font-mono leading-relaxed pl-3">
                  This terminal facilitates secure drop tracking via real-time satellite UAV uplinks. Use the sidebar to toggle between map telemetry, secure comms, and inventory locks.
                </p>
              </div>

              {/* Tactical Guilds */}
              <div className="space-y-1.5 border-b border-[#106011]/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  <span className="text-[9px] font-black text-slate-100 tracking-wider font-mono">OPERATIONAL_FLOW</span>
                </div>
                <p className="text-[7px] text-slate-500 font-mono leading-relaxed pl-3">
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
                  <span className="text-[9px] font-black text-slate-100 tracking-wider font-mono">CREDENTIAL_PROTOCOL</span>
                </div>
                <div className="bg-red-950/20 border border-red-500/20 p-2 rounded">
                  <p className="text-[7px] text-red-400 font-mono leading-relaxed italic">
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
