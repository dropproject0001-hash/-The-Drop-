import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalModals } from '@/components/ui/GlobalModals';
import { Settings, Map as MapIcon, Package, MessageSquare, Activity, Users, ShieldAlert, Lock, Unlock } from 'lucide-react';

import { CargoBayView } from './views/CargoBayView';
import { ChatBoxView } from './views/ChatBoxView';
import { DropperListView } from './views/DropperListView';
import { StocksAnalysisView } from './views/StocksAnalysisView';
import { ControlSettingsView } from './views/ControlSettingsView';

export function BaseLayout() {
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'cargo' | 'chat' | 'droppers' | 'stocks' | 'settings'>('map');
  
  const isExpanded = isHovered || isLocked;

  return (
    <div className="min-h-screen bg-[--bg-primary] text-[--text-primary] flex font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <motion.aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{ width: isExpanded ? 240 : 80 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="h-full border-r border-[#106011]/60 bg-black/95 flex flex-col items-start p-4 py-6 gap-8 z-50 shrink-0 select-none relative overflow-hidden shadow-[4px_0_25px_rgba(16,96,17,0.15)]"
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
          className="relative group/brand flex items-center gap-3 w-full p-2.5 rounded-xl bg-black/95 border border-[#106011]/50 shadow-[0_0_15px_rgba(16,96,17,0.25)] hover:border-[#106011] hover:shadow-[0_0_20px_rgba(16,96,17,0.5)] transition-all duration-300 select-none z-10 overflow-hidden"
          id="sidebar-brand-link"
        >
          {/* Nested Rectangle Tactical HUD borders */}
          <div className="absolute inset-0.5 border border-[#106011]/25 pointer-events-none rounded-[10px] group-hover/brand:border-[#106011]/45 transition-colors duration-300"></div>
          <div className="absolute inset-1 border border-dashed border-[#106011]/15 pointer-events-none rounded-[8px] group-hover/brand:border-[#106011]/30 transition-colors duration-300"></div>

          {/* Corner Brackets inside the mini brand box */}
          <div className="absolute top-0.5 left-0.5 w-3 h-3 border-t-2 border-l-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.8)]"></div>
          <div className="absolute top-0.5 right-0.5 w-3 h-3 border-t-2 border-r-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.8)]"></div>
          <div className="absolute bottom-0.5 left-0.5 w-3 h-3 border-b-2 border-l-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.8)]"></div>
          <div className="absolute bottom-0.5 right-0.5 w-3 h-3 border-b-2 border-r-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.8)]"></div>

          {/* Mini telemetry detail */}
          <div className="absolute right-1 top-1 text-[5px] font-mono text-[#106011]/40 tracking-wider hidden lg:block uppercase select-none group-hover/brand:text-[#106011]/70 transition-colors duration-300">
            CH: 01
          </div>

          <div className="w-9 h-9 shrink-0 rounded-full bg-[#106011]/10 flex items-center justify-center border border-[#106011]/50 shadow-[0_0_12px_rgba(16,96,17,0.4)] group-hover/brand:bg-[#106011]/25 group-hover/brand:border-[#106011] group-hover/brand:shadow-[0_0_15px_rgba(16,96,17,0.7)] transition-all duration-300 cursor-pointer relative z-10 overflow-hidden">
            <img 
              src="/Appicon.png" 
              alt="Droppin Ops" 
              className="w-full h-full rounded-full object-cover relative z-10 group-hover/brand:scale-110 transition-transform duration-300" 
              referrerPolicy="no-referrer"
            />
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col relative z-10"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-[11px] text-white tracking-[0.2em] leading-none uppercase group-hover/brand:text-white transition-colors">
                    Droppin Ops
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#106011] animate-pulse shadow-[0_0_6px_rgba(16,96,17,0.8)]"></span>
                </div>
                <span className="text-[7.5px] font-mono text-[#106011] tracking-[0.12em] mt-1.5 uppercase font-bold drop-shadow-[0_0_4px_rgba(16,96,17,0.4)] group-hover/brand:drop-shadow-[0_0_6px_rgba(16,96,17,0.85)] transition-all">
                  Drop Drawer 📩💲📍✅
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        
        {/* Sidebar Nav Items */}
        <nav className="flex-1 flex flex-col items-start gap-4 w-full z-10 mt-2">
          <NavItem icon={<MapIcon className="w-5 h-5" />} active={activeTab === 'map'} tooltip="Drop Map" label="DROP MAP" isExpanded={isExpanded} onClick={() => setActiveTab('map')} />
          <NavItem icon={<Package className="w-5 h-5" />} active={activeTab === 'cargo'} tooltip="Inventory" label="inv. Locker 🗝️📊" isExpanded={isExpanded} onClick={() => setActiveTab('cargo')} badge="LOCK 📵" badgeStyle="border-[#106011] bg-black text-green-400 font-bold shadow-[0_0_12px_rgba(16,96,17,0.5)]" />
          <NavItem icon={<MessageSquare className="w-5 h-5" />} active={activeTab === 'chat'} tooltip="Chat Box" label="CHAT BOX" isExpanded={isExpanded} onClick={() => setActiveTab('chat')} />
          <NavItem icon={<Users className="w-5 h-5" />} active={activeTab === 'droppers'} tooltip="Dropper List" label="DROPPER LIST" isExpanded={isExpanded} onClick={() => setActiveTab('droppers')} badge="4 ACTIVE" badgeStyle="border-[#106011] bg-[#106011]/10 text-green-400 font-bold shadow-[0_0_12px_rgba(16,96,17,0.5)] animate-pulse" />
          <NavItem icon={<Activity className="w-5 h-5" />} active={activeTab === 'stocks'} tooltip="Stocks Analysis" label="STOCKS ANALYSIS" isExpanded={isExpanded} onClick={() => setActiveTab('stocks')} />
        </nav>
        
        {/* Bottom Actions */}
        <div className="w-full flex flex-col gap-4 z-10 pt-4 border-t border-[#106011]/20">
          <NavItem icon={<Settings className="w-5 h-5 animate-spin-slow" />} active={activeTab === 'settings'} tooltip="Control Settings" label="CONTROL SETTINGS" isExpanded={isExpanded} onClick={() => setActiveTab('settings')} />
          
          {/* Latch Lock Switch with High-Contrast Tactical HUD and Nested Signal Borders */}
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
            <h1 className="text-xl font-display font-black tracking-[0.2em] text-[#106011] uppercase drop-shadow-[0_0_10px_rgba(16,96,17,0.85)]">
              THE DROP SHOP
            </h1>
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#106011]/30">
              <span className="w-2 h-2 rounded-full bg-[#106011] animate-ping"></span>
              <span className="text-xs font-mono text-[#106011] uppercase tracking-widest font-semibold drop-shadow-[0_0_5px_rgba(16,96,17,0.6)]">
                CONNECTION ESTABLISHED
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 relative z-10 pr-2">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-sm font-bold text-white font-display uppercase tracking-wider">Landing Page</span>
              <span className="text-[10px] font-mono text-[#106011] uppercase tracking-widest font-semibold">Getto OTP Required 🔞</span>
            </div>
            <div className="relative group/avatar cursor-pointer">
              {/* Outer Glowing Pulsing Ring */}
              <div className="absolute -inset-0.5 rounded-full bg-[#106011] opacity-50 blur-sm group-hover/avatar:opacity-100 transition-opacity animate-pulse"></div>
              {/* Profile Image Container */}
              <div className="relative w-10 h-10 rounded-full border-2 border-[#106011] bg-black overflow-hidden shadow-[0_0_15px_rgba(16,96,17,0.9)] p-[1px] transition-transform duration-300 hover:scale-105">
                <img src="/Appicon.png" alt="avatar" className="w-full h-full rounded-full object-cover" />
              </div>
            </div>
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
  const isChatBox = label === "CHAT BOX" || tooltip === "Chat Box";
  const isSettings = label === "CONTROL SETTINGS" || tooltip === "Control Settings";
  const isStocks = label === "STOCKS ANALYSIS" || tooltip === "Stocks Analysis";
  const isDropperList = label === "DROPPER LIST" || tooltip === "Dropper List";
  const isCargoBay = label === "CARGO BAY" || label === "Inventry Locker 🗝️" || label === "inv. Locker 🗝️📊" || tooltip === "Inventory";
  const isSpecial = isChatBox || isSettings || isStocks;

  const buttonStyle = isSpecial
    ? "bg-black/95 text-[#106011] border-2 border-[#106011] shadow-[0_0_18px_rgba(16,96,17,0.55)] font-black"
    : active
    ? "bg-[#106011]/25 text-[#106011] shadow-[inset_0_0_12px_rgba(16,96,17,0.4)] border-2 border-[#106011] font-bold drop-shadow-[0_0_6px_rgba(16,96,17,0.7)] cursor-default"
    : isDropperList
    ? "text-slate-400 hover:text-[#106011] bg-black/40 border border-[#106011]/30 hover:border-[#106011] hover:shadow-[0_0_15px_rgba(34,197,94,0.45)] transition-all cursor-pointer relative"
    : isCargoBay
    ? "text-slate-400 hover:text-[#106011] bg-black/40 border border-[#106011]/30 hover:border-[#106011] hover:shadow-[0_0_15px_rgba(34,197,94,0.45)] transition-all cursor-pointer relative"
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
      
      {/* Tactical diagonal hazard stripes background overlay for Cargo Bay */}
      {isCargoBay && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-[linear-gradient(45deg,#106011_25%,transparent_25%,transparent_50%,#106011_50%,#106011_75%,transparent_75%,transparent)] bg-[size:12px_12px]" />
      )}

      {/* Dynamic tactical scanline overlay for Dropper List tracking vibe */}
      {isDropperList && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <motion.div
            animate={{
              y: ["-10%", "110%", "-10%"]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-full h-1 bg-gradient-to-r from-transparent via-green-500/40 to-transparent shadow-[0_0_10px_rgba(34,197,94,0.6)] opacity-70 group-hover:opacity-100"
          />
        </div>
      )}

      {/* Inner Nested Rectangle Lines */}
      <div className="absolute inset-0.5 border border-dashed pointer-events-none rounded-[10px] z-10 border-[#106011]/30"></div>
      <div className="absolute inset-1 border pointer-events-none rounded-[8px] z-10 border-[#106011]/15"></div>

      <div className={`${isExpanded ? 'shrink-0' : 'mx-auto'} relative z-10 ${isSpecial ? 'text-[#106011] drop-shadow-[0_0_5px_rgba(16,96,17,0.85)] animate-pulse' : 'group-hover:scale-115 group-hover:text-[#106011] transition-all duration-300'}`}>
        {icon}
        {isDropperList && (
          <span className="absolute -inset-1.5 rounded-full border border-green-500/20 animate-ping pointer-events-none opacity-30 group-hover:opacity-60 group-hover:border-green-500/50" />
        )}
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
              className={`text-[10px] font-display font-black tracking-widest uppercase truncate relative z-10 ${isSpecial ? 'text-[#106011] drop-shadow-[0_0_6px_rgba(16,96,17,0.7)]' : active ? 'text-[#106011]' : 'text-slate-200 group-hover:text-[#106011] group-hover:font-bold transition-colors'}`}
            >
              {label || tooltip}
            </span>
            {badge && (
              <span className={`text-[7px] font-mono leading-none px-1 py-0.5 rounded border select-none h-fit shrink-0 tracking-wider font-extrabold max-w-[85px] truncate ${badgeStyle || 'border-[#106011] bg-black text-[#106011]'}`}>
                {badge}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* When collapsed, show tiny glowing badge pill or notification dot */}
      {!isExpanded && badge && (
        <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full border border-black z-20 ${badge.includes('ACTIVE') ? 'bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.9)]' : 'bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.9)]'}`}></span>
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
