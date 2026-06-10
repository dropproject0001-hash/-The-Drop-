import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Target, Leaf, Satellite, MessageSquare, AlertCircle, Terminal, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonIcon } from '../ui/NeonIcons';
import { BannerSlider } from '../ui/BannerSlider';

export function RoleSelector() {
  return (
    <div className="relative flex flex-col items-center justify-start min-h-[calc(100vh-80px)] gap-6 pt-4 pb-12 px-6 text-center overflow-y-auto custom-scrollbar">
      {/* Background Cover Photo */}
      <div 
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none mix-blend-luminosity bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/Backgroundimage.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[--bg-primary]/30 via-[--bg-primary]/80 to-[--bg-primary] pointer-events-none" />


      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full relative z-10">
         <RoleCard 
           to="/super-admin" 
           icon={<NeonIcon imageSrc="/Appicon.png" color="green" size={120} className="group-hover:scale-110 transition-transform duration-300" />} 
           title="Boss/Owner" 
           features={[
             "LIVE GPS TRACKING:",
             "Track Admin/Droppers in realtime",
             "Realtime map movement updates",
             "Live movement path history",
             "GPS activity logs",
             "Last active timestamps",
             "LIVE MAP MONITORING:",
             "View product pin locations",
             "Different marker colors/icons",
             "Clickable modal popup on pins",
             "PRODUCT DROP ANALYTICS:",
             "Product dropped timestamps",
             "Daily/weekly/monthly analytics",
             "Heatmap analysis",
             "Drop success logs",
             "Looted product logs",
             "INVENTORY SYSTEM:",
             "Inventory monitoring",
             "Product stock analysis",
             "Low stock warnings",
             "Product categories",
             "Inventory charts",
             "CHAT SYSTEM:",
             "Private chat with Admins/Clients",
             "Realtime messaging",
             "Typing & read indicators",
             "File attachments",
             "LOG SYSTEM:",
             "GPS logs",
             "Product logs",
             "Transaction logs",
             "User activity logs",
             "Security logs"
           ]}
           color="green"
         />
         <RoleCard 
           to="/dropper" 
           icon={<NeonIcon imageSrc="/Dropper-icon.png" color="blue" size={120} className="group-hover:scale-110 transition-transform duration-300" />} 
           title="DROPPER" 
           features={[
             "PRODUCT DROP SYSTEM:",
             "Create product drop",
             "Pin exact GPS location",
             "Upload: image & video guide",
             "Add instructions/notes",
             "Generate QR code for drop",
             "CLIENT MANAGEMENT:",
             "Private client chat",
             "Approve orders/payments",
             "Send live drop location",
             "Track client GPS",
             "LIVE MAP:",
             "Realtime map",
             "Client tracking",
             "Product drop pins",
             "GPS navigation pathway",
             "INVENTORY:",
             "View inventory",
             "Update stock",
             "Product logs",
             "Delivery status",
             "TRANSACTION SYSTEM:",
             "Order approvals",
             "Payment status",
             "Transaction timestamps",
             "Delivery confirmation"
           ]}
           color="blue"
         />
         <RoleCard 
           to="/client" 
           icon={<NeonIcon imageSrc="/buyer-icon.png" color="gold" size={120} className="group-hover:scale-110 transition-transform duration-300" />} 
           title="Client" 
           features={[
             "PRODUCT MAP VIEW:",
             "Realtime map",
             "View approved dropped product location",
             "GPS route/pathway to dropped product",
             "Product pin marker",
             "Distance calculation",
             "PRIVATE CHAT:",
             "Private order messaging with Admin",
             "Upload proof/payment screenshots",
             "Realtime chat",
             "PRODUCT ACCESS:",
             "client receives live pinned location",
             "receives hidden product image",
             "receives short guide video",
             "receives QR code",
             "PRODUCT LOOT SYSTEM:",
             "Client can mark product as “Looted”",
             "Product pin disappears after looted",
             "Transaction closes automatically",
             "Timestamp logs saved"
           ]}
           color="gold"
         />
      </div>

      {/* Bulletins / Field Updates Drawer */}
      <BulletinDrawer />
    </div>
  )
}

function RoleCard({ to, icon, title, description, features, color }: { to: string, icon: React.ReactNode, title: string, description?: string, features?: string[], color: string }) {
  const themes = {
    red: { // Boss / Owner (Crimson & Solar Amber)
      border: "border-red-950/50 hover:border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.05)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]",
      text: "text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.6)]",
      hoverText: "group-hover:text-red-400 group-hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.85)]",
      iconBg: "border-red-950/40 group-hover:border-red-500/70",
      iconGlow: "group-hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]",
      titleBorder: "border-red-500/40 group-hover:border-red-500 group-hover:shadow-[0_0_22px_rgba(239,68,68,0.7)] group-hover:drop-shadow-[0_0_15px_rgba(239,68,68,0.9)] bg-black/95",
      subBorder: "border-red-500/30 group-hover:border-red-500/60 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]",
      headingText: "text-red-500",
      lineBorder: "border-red-500/10 group-hover:border-red-500/25",
      cornerBorder: "border-red-500/30 group-hover:border-red-500/80",
      bulletBg: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.85)]",
      sigDot: "bg-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.95)] animate-pulse",
      sigText: "text-red-500/90 font-black drop-shadow-[0_0_4px_rgba(239,68,68,0.55)]",
      sigLabel: "SECTOR_ALPHA_01",
      bgOverlay: "from-red-950/5 via-transparent to-red-950/10",
      accentTitleText: "text-red-500/80 group-hover:text-red-400",
      bulletSubheaderText: "text-red-400 font-black uppercase tracking-[0.15em] border-l-2 border-red-500 pl-2"
    },
    blue: { // Dropper (Deep Sat-Blue & Tactical Cyan)
      border: "border-blue-950/50 hover:border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.05)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]",
      text: "text-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.6)]",
      hoverText: "group-hover:text-blue-400 group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.85)]",
      iconBg: "border-blue-950/40 group-hover:border-blue-500/70",
      iconGlow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]",
      titleBorder: "border-blue-500/40 group-hover:border-blue-500 group-hover:shadow-[0_0_22px_rgba(59,130,246,0.7)] group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.9)] bg-black/95",
      subBorder: "border-blue-500/30 group-hover:border-blue-500/60 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]",
      headingText: "text-blue-500",
      lineBorder: "border-blue-500/10 group-hover:border-blue-500/25",
      cornerBorder: "border-blue-500/30 group-hover:border-blue-500/80",
      bulletBg: "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.85)]",
      sigDot: "bg-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.95)] animate-pulse",
      sigText: "text-blue-500/90 font-black drop-shadow-[0_0_4px_rgba(59,130,246,0.55)]",
      sigLabel: "SECTOR_BETA_09",
      bgOverlay: "from-blue-950/5 via-transparent to-blue-950/10",
      accentTitleText: "text-blue-500/80 group-hover:text-blue-400",
      bulletSubheaderText: "text-blue-400 font-black uppercase tracking-[0.15em] border-l-2 border-blue-500 pl-2"
    },
    green: { // Client (Cyber Emerald & Volt Lime)
      border: "border-[#106011]/30 hover:border-[#106011]/85 shadow-[0_0_15px_rgba(16,96,17,0.1)] hover:shadow-[0_0_30px_rgba(16,96,17,0.3)]",
      text: "text-[#106011] drop-shadow-[0_0_5px_rgba(16,96,17,0.5)]",
      hoverText: "group-hover:text-[#0ad111] group-hover:drop-shadow-[0_0_12px_rgba(10,209,17,0.85)]",
      iconBg: "border-[#106011]/30 group-hover:border-[#106011]",
      iconGlow: "group-hover:shadow-[0_0_20px_rgba(16,96,17,0.4)]",
      titleBorder: "border-[#106011] group-hover:shadow-[0_0_22px_rgba(16,96,17,0.85)] group-hover:drop-shadow-[0_0_15px_rgba(16,96,17,1)] bg-black/95",
      subBorder: "border-[#106011]/45 group-hover:border-[#106011]/80 group-hover:shadow-[0_0_15px_rgba(16,96,17,0.5)]",
      headingText: "text-[#106011]",
      lineBorder: "border-[#106011]/20 group-hover:border-[#106011]/45",
      cornerBorder: "border-[#106011] opacity-50 group-hover:opacity-100",
      bulletBg: "bg-[#0ad111] shadow-[0_0_6px_rgba(10,209,17,0.85)]",
      sigDot: "bg-[#0ad111] drop-shadow-[0_0_5px_rgba(10,209,17,0.95)] animate-pulse",
      sigText: "text-[#0ad111]/90 font-black drop-shadow-[0_0_4px_rgba(10,209,17,0.55)]",
      sigLabel: "106.011 MHz",
      bgOverlay: "from-emerald-950/5 via-transparent to-emerald-950/10",
      accentTitleText: "text-[#106011] group-hover:text-[#0ad111]",
      bulletSubheaderText: "text-[#0ad111]/90 font-black uppercase tracking-[0.15em] border-l-2 border-[#106011] pl-2"
    },
    gold: { // Client (Tactical Gold / Solar Amber)
      border: "border-[#e2c80f]/30 hover:border-[#fdb804]/85 shadow-[0_0_15px_rgba(226,200,15,0.1)] hover:shadow-[0_0_30px_rgba(253,184,4,0.35)]",
      text: "text-[#e2c80f] drop-shadow-[0_0_5px_rgba(226,200,15,0.5)]",
      hoverText: "group-hover:text-[#fdb804] group-hover:drop-shadow-[0_0_12px_rgba(253,184,4,0.85)]",
      iconBg: "border-[#e2c80f]/30 group-hover:border-[#fdb804]",
      iconGlow: "group-hover:shadow-[0_0_20px_rgba(253,184,4,0.4)]",
      titleBorder: "border-[#e2c80f] group-hover:shadow-[0_0_22px_rgba(253,184,4,0.85)] group-hover:drop-shadow-[0_0_15px_rgba(253,184,4,1)] bg-black/95",
      subBorder: "border-[#e2c80f]/45 group-hover:border-[#fdb804]/80 group-hover:shadow-[0_0_15px_rgba(253,184,4,0.5)]",
      headingText: "text-[#e2c80f]",
      lineBorder: "border-[#e2c80f]/20 group-hover:border-[#fdb804]/45",
      cornerBorder: "border-[#e2c80f] opacity-50 group-hover:opacity-100",
      bulletBg: "bg-[#e2c80f] shadow-[0_0_6px_rgba(226,200,15,0.85)]",
      sigDot: "bg-[#f8b206] drop-shadow-[0_0_5px_rgba(248,178,6,0.95)] animate-pulse",
      sigText: "text-[#f5b616] font-black drop-shadow-[0_0_4px_rgba(245,182,22,0.55)]",
      sigLabel: "217.180 MHz",
      bgOverlay: "from-amber-950/5 via-transparent to-amber-950/10",
      accentTitleText: "text-[#e2c80f] group-hover:text-[#fdb804]",
      bulletSubheaderText: "text-[#fdb804]/90 font-black uppercase tracking-[0.15em] border-l-2 border-[#e2c80f] pl-2"
    }
  };

  const theme = themes[color as keyof typeof themes] || themes.green;

  return (
    <Link to={to} className={`group flex flex-col items-center gap-6 p-8 rounded-2xl bg-black/95 transition-all duration-500 border ${theme.border} hover:-translate-y-2 relative overflow-hidden select-none h-[550px]`}>
      {/* Background Cover Photo Overlay */}
      <div 
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none mix-blend-overlay bg-cover bg-center bg-no-repeat group-hover:scale-110 transition-transform duration-700"
        style={{ backgroundImage: `url('/Backgroundimage.png')` }}
      />
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.bgOverlay} pointer-events-none`} />

      {/* Tactical HUD Corner Brackets */}
      <div className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 ${theme.cornerBorder} rounded-tl-xl pointer-events-none transition-all duration-300 group-hover:scale-105`}></div>
      <div className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 ${theme.cornerBorder} rounded-tr-xl pointer-events-none transition-all duration-300 group-hover:scale-105`}></div>
      <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 ${theme.cornerBorder} rounded-bl-xl pointer-events-none transition-all duration-300 group-hover:scale-105`}></div>
      <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 ${theme.cornerBorder} rounded-br-xl pointer-events-none transition-all duration-300 group-hover:scale-105`}></div>

      {/* Inner Nested High-Contrast Tactical HUD Lines */}
      <div className={`absolute inset-1.5 border border-dashed ${theme.lineBorder} rounded-xl pointer-events-none transition-colors duration-300`}></div>
      <div className={`absolute inset-2.5 border border-dashed opacity-30 ${theme.lineBorder} rounded-lg pointer-events-none transition-colors duration-300`}></div>

      {/* Decorative vertical target/measurement rails */}
      <div className={`absolute top-6 bottom-6 left-1.5 w-px border-l border-dotted ${theme.lineBorder} transition-colors duration-300`}></div>
      <div className={`absolute top-6 bottom-6 right-1.5 w-px border-r border-dotted ${theme.lineBorder} transition-colors duration-300`}></div>

      <div className={`p-4 rounded-full bg-black/40 border ${theme.iconBg} shadow-[0_0_10px_rgba(16,96,17,0.15)] relative z-10 transition-all duration-300 ${theme.iconGlow}`}>
        {icon}
      </div>
      
      <div className="flex flex-col gap-3 items-center w-full relative z-10">
        <h2 className={`relative px-6 py-2.5 font-display font-black uppercase tracking-[0.25em] text-xs text-center border-2 rounded overflow-hidden select-none transition-all duration-300 ${theme.titleBorder}`}>
          {/* Tactical HUD Corner Brackets inside */}
          <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${theme.cornerBorder} pointer-events-none`}></div>
          <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${theme.cornerBorder} pointer-events-none`}></div>
          <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${theme.cornerBorder} pointer-events-none`}></div>
          <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${theme.cornerBorder} pointer-events-none`}></div>

          {/* Double Nested Rectangle dashed/solid HUD lines */}
          <div className={`absolute inset-0.5 border border-dashed ${theme.lineBorder} rounded pointer-events-none`}></div>
          <div className={`absolute inset-1 border ${theme.lineBorder} opacity-30 rounded pointer-events-none`}></div>

          <span className={`relative z-10 ${theme.hoverText}`}>{title}</span>
        </h2>
        
        <div className={`relative w-32 h-5 flex items-center justify-center overflow-hidden border bg-black/80 rounded transition-all duration-300 select-none ${theme.subBorder}`}>
          {/* Tactical HUD Corner Brackets */}
          <div className={`absolute top-0 left-0 w-1.5 h-1.5 border-t border-l ${theme.cornerBorder} pointer-events-none`}></div>
          <div className={`absolute top-0 right-0 w-1.5 h-1.5 border-t border-r ${theme.cornerBorder} pointer-events-none`}></div>
          <div className={`absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l ${theme.cornerBorder} pointer-events-none`}></div>
          <div className={`absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r ${theme.cornerBorder} pointer-events-none`}></div>

          {/* Double Nested Rectangle dashed/solid borders */}
          <div className={`absolute inset-[1px] border border-dashed ${theme.lineBorder} rounded pointer-events-none`}></div>

          {/* Frequency & tactical metadata */}
          <div className="flex items-center gap-1.5 relative z-10">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme.sigDot}`}></span>
            <span className={`text-[7.5px] font-mono tracking-[0.2em] uppercase ${theme.sigText}`}>
              {theme.sigLabel}
            </span>
          </div>
        </div>
        
        {description && (
          <p className="text-[11px] font-mono text-[--text-secondary] text-center leading-relaxed max-w-[200px]">
            {description}
          </p>
        )}
        
        {features && features.length > 0 && (
          <div className="text-[10px] font-mono flex flex-col items-start w-full mt-2 space-y-1.5 pl-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
            {features.map((feature, i) => {
              if (feature.endsWith(':')) {
                return (
                  <div key={i} className={`mt-3 mb-1 text-[9px] ${theme.bulletSubheaderText}`}>
                    {feature.replace(':', '')}
                  </div>
                );
              }
              return (
                <div key={i} className="flex items-start gap-2 text-left text-slate-300 opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${theme.bulletBg}`}></span> 
                  <span>{feature}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      <div className={`mt-auto text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 ${theme.hoverText}`}>
        Initialize Sequence →
      </div>
    </Link>
  );
}

function BulletinDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const bulletins = [
    { id: 1, type: 'CRITICAL', text: "NEW PRODUCT LOOTED IN SECTOR VII // GRID: 14.28 N, 120.59 E", time: "02:45" },
    { id: 2, type: 'OPERATIONAL', text: "SAT-LINK STAMPED // ALL GPS MODULES NOMINAL", time: "03:12" },
    { id: 3, type: 'SUPER_ADMIN', text: "INVENTORY RESTOCK COMMENCING AT DEPOT_ALPHA", time: "05:22" },
    { id: 4, type: 'SECURITY', text: "ENCRYPTED CHANNELS ROTATED // RE-AUTH REQUIRED FOR DROPPER_UNIT_9", time: "08:15" },
  ];

  return (
    <div className="w-full max-w-5xl mt-6 mb-8 relative z-10 mx-auto">
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-[#106011]/5 blur-3xl rounded-full transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/90 border-2 border-[#106011]/60 hover:border-[#106011] rounded-xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(16,96,17,0.2)] hover:shadow-[0_0_30px_rgba(16,96,17,0.4)] transition-all group overflow-hidden relative"
      >
        {/* Universal Tactical HUD Corner Brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 pointer-events-none z-20 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)] group-hover:scale-110 transition-transform"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 pointer-events-none z-20 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)] group-hover:scale-110 transition-transform"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 pointer-events-none z-20 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)] group-hover:scale-110 transition-transform"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 pointer-events-none z-20 border-[#106011] drop-shadow-[0_0_3px_rgba(16,96,17,0.8)] group-hover:scale-110 transition-transform"></div>

        {/* Nested Rectangle Tactical HUD borders */}
        <div className="absolute inset-1 border-[1.5px] border-dashed pointer-events-none rounded-lg z-20 border-[#106011]/40 group-hover:border-[#106011]/60 transition-colors"></div>
        <div className="absolute inset-2 border pointer-events-none rounded-md z-20 border-[#106011]/20 group-hover:border-[#106011]/40 transition-colors"></div>


        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#0ad111] bg-black shrink-0 shadow-[0_0_10px_rgba(10,209,17,0.4)] flex items-center justify-center p-0.5 group-hover:shadow-[0_0_15px_#0ad111]">
            <img src="/Appicon.png" alt="App Icon" className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-black text-[#0ad111] tracking-[0.2em] font-mono uppercase">Announcements & Free Drops Update</h3>
            <p className="text-[8px] text-slate-500 font-mono tracking-widest mt-0.5">FROM: BOSS / SUPER ADMIN CONSOLE</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-[#106011]/5 border border-[#106011]/20 rounded font-mono text-[7px] text-[#0ad111]">
            <span className="w-1 h-1 rounded-full bg-[#0ad111] animate-ping" />
            LIVE_LINK
          </div>
          {isOpen ? <ChevronUp className="text-[#0ad111]" /> : <ChevronDown className="text-[#0ad111]" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            className="overflow-hidden"
          >
            <div className="mt-4 bg-black/95 border-2 border-[#106011]/30 rounded-2xl p-6 shadow-[inset_0_0_50px_rgba(16,96,17,0.1)] relative text-left overflow-hidden">
              {/* Background Cover Photo Overlay */}
              <div 
                className="absolute inset-0 w-full h-full opacity-15 pointer-events-none mix-blend-luminosity bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('/coverphoto2.jpg')` }}
              />

              {/* Nested HUD Lines */}
              <div className="absolute inset-1 border border-dashed border-[#106011]/10 rounded-xl pointer-events-none" />
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {bulletins.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-l-2 border-[#106011]/40 bg-white/[0.02] hover:bg-white/[0.05] transition-colors gap-2"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[7px] font-mono px-1.5 py-0.5 rounded border ${
                          item.type === 'CRITICAL' ? 'border-red-900/50 text-red-500 bg-red-950/20' : 
                          item.type === 'SUPER_ADMIN' ? 'border-blue-900/50 text-blue-400 bg-blue-950/20' : 
                          'border-[#106011]/30 text-[#0ad111] bg-[#106011]/10'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-[7px] text-slate-600 font-mono">STAMP: {item.time}</span>
                      </div>
                      <p className="text-[9px] text-slate-100 font-mono leading-relaxed tracking-wider">
                        {item.text}
                      </p>
                    </div>
                    <div className="shrink-0 opacity-20 hover:opacity-100 transition-opacity">
                       <Info className="w-3 h-3 text-[#106011]" />
                    </div>
                  </motion.div>
                ))}

                {bulletins.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-[9px] text-slate-600 font-mono italic">NO ACTIVE BROADCASTS DETECTED</p>
                  </div>
                )}
              </div>

              {/* Maintenance Data */}
              <div className="mt-4 pt-4 border-t border-[#106011]/10 flex justify-between items-center text-[7px] text-[#106011] font-mono opacity-40">
                <span>TERMINAL_ID: BN-9981</span>
                <span className="animate-pulse">ENCRYPTION: AES_256_ACTIVE</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
