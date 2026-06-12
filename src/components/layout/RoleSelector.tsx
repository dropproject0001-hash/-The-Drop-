import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Radio, Target, Leaf, Satellite, MessageSquare, AlertCircle, Terminal, Info, ChevronDown, ChevronUp, Activity, ShieldCheck, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonIcon } from '../ui/NeonIcons';
import { BannerSlider } from '../ui/BannerSlider';

export function RoleSelector() {
  return (
    <div 
      style={{ borderColor: '#309313' }}
      className="relative flex flex-col items-center justify-start min-h-[calc(100vh-80px)] gap-8 pt-6 pb-16 px-6 text-center overflow-y-auto custom-scrollbar"
    >
      {/* Enhanced Tactical Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Layer 1: High-Fidelity Primary Background with Breathing Animation */}
        <motion.div 
          animate={{ 
            opacity: [0.55, 0.65, 0.55],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full mix-blend-luminosity bg-cover bg-center bg-no-repeat grayscale-[0.5] brightness-75 transition-opacity duration-1000"
          style={{ backgroundImage: `url('/regenerated_image_1781027109738.jpg')` }}
        />
        
        {/* Layer 2: Dynamic Atmospheric Scanning Mask (Full Frame) */}
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-y-0 w-full bg-gradient-to-r from-transparent via-[#106011]/10 to-transparent skew-x-[30deg] pointer-events-none z-10"
        />

        {/* Global HUD Scanning Emission Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/45 to-black/95 pointer-events-none" />

        {/* Layer 3: Tactical Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.1]" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 96, 17, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 96, 17, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }}
        />

        {/* Layer 4: Global Scanning HUD Line */}
        <motion.div 
          animate={{ y: ['-100%', '300%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#106011]/40 to-transparent blur-[1px] z-10"
        />

        {/* CRT Scanlines and Vignette */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />
      </div>

      {/* Mission Selection Title Panel */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center gap-1 mt-4"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#106011]" />
          <motion.span 
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-[10px] font-mono font-black text-[#0ad111] tracking-[0.4em] uppercase drop-shadow-[0_0_8px_rgba(10,209,17,0.8)] px-3 py-1 bg-[#106011]/10 border border-[#106011]/30 rounded-sm relative overflow-hidden group"
          >
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-[#0ad111]/20 to-transparent skew-x-12 pointer-events-none"
            />
            MANATILING LOWKEY AT KALMADO KEEP SAFE
          </motion.span>
          <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#106011]" />
        </div>
        <motion.h1 
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-4xl font-display font-black text-white tracking-tighter uppercase italic relative px-6 py-2 overflow-hidden"
        >
          {/* Internal Header Scanning Mask */}
          <motion.div 
            animate={{ x: ['-100%', '250%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-y-0 w-full bg-gradient-to-r from-transparent via-[#0ad111]/25 to-transparent skew-x-[35deg] pointer-events-none z-0"
          />
          <span className="relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Nueva Ecija</span> <span className="text-[#0ad111] relative z-10 drop-shadow-[0_0_15px_rgba(10,209,17,0.4)]">Representing</span>
        </motion.h1>
      </motion.div>
      
      <motion.div 
        animate={{ opacity: [0.98, 1, 0.98] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full relative z-10"
      >
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
            "Getto 💲",
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
      </motion.div>

      {/* Bulletins / Field Updates Drawer */}
      <BulletinDrawer />
    </div>
  )
}

function RoleCard({ to, icon, title, description, features, color }: { to: string, icon: React.ReactNode, title: string, description?: string, features?: string[], color: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const themes = {
    red: { // Boss / Owner (Crimson & Solar Amber)
      border: "border-red-950/60 hover:border-red-500 shadow-[0_0_20px_rgba(220,25,25,0.1)] hover:shadow-[0_0_40px_rgba(220,25,25,0.4)]",
      text: "text-red-500 drop-shadow-[0_0_8px_rgba(220,25,25,0.6)]",
      hoverText: "group-hover:text-red-400 group-hover:drop-shadow-[0_0_15px_rgba(220,25,25,0.9)]",
      iconBg: "border-red-900/40 group-hover:border-red-500/80 bg-red-950/20",
      iconGlow: "group-hover:shadow-[0_0_25px_rgba(220,25,25,0.3)]",
      titleBorder: "border-red-500/50 group-hover:border-red-400 group-hover:shadow-[0_0_25px_rgba(220,25,25,0.8)] bg-black/95",
      subBorder: "border-red-500/40 group-hover:border-red-400/70 group-hover:shadow-[0_0_20px_rgba(220,25,25,0.5)]",
      headingText: "text-red-400",
      lineBorder: "border-red-500/20 group-hover:border-red-500/40",
      cornerBorder: "border-red-500/40 group-hover:border-red-400",
      bulletBg: "bg-red-500 shadow-[0_0_8px_rgba(220,25,25,0.9)]",
      sigDot: "bg-red-500 drop-shadow-[0_0_6px_rgba(220,25,25,1)] animate-pulse",
      sigText: "text-red-500 font-black tracking-widest",
      sigLabel: "SECTOR_ALPHA_01",
      bgOverlay: "from-red-950/10 via-transparent to-red-950/20",
      accentTitleText: "text-red-500/90 group-hover:text-red-400",
      bulletSubheaderText: "text-red-400 font-black uppercase tracking-[0.2em] border-l-4 border-red-500 pl-3 py-0.5 bg-red-500/5"
    },
    blue: { // Dropper (Tactical Cobalt & Cyan)
      border: "border-blue-950/60 hover:border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]",
      text: "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]",
      hoverText: "group-hover:text-blue-400 group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.9)]",
      iconBg: "border-blue-900/40 group-hover:border-blue-500/80 bg-blue-950/20",
      iconGlow: "group-hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]",
      titleBorder: "border-blue-500/50 group-hover:border-blue-400 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] bg-black/95",
      subBorder: "border-blue-500/40 group-hover:border-blue-400/70 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]",
      headingText: "text-blue-400",
      lineBorder: "border-blue-500/20 group-hover:border-blue-500/40",
      cornerBorder: "border-blue-500/40 group-hover:border-blue-400",
      bulletBg: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.9)]",
      sigDot: "bg-blue-500 drop-shadow-[0_0_6px_rgba(59,130,246,1)] animate-pulse",
      sigText: "text-blue-500 font-black tracking-widest",
      sigLabel: "SECTOR_BETA_09",
      bgOverlay: "from-blue-950/10 via-transparent to-blue-950/20",
      accentTitleText: "text-blue-500/90 group-hover:text-blue-400",
      bulletSubheaderText: "text-blue-400 font-black uppercase tracking-[0.2em] border-l-4 border-blue-500 pl-3 py-0.5 bg-blue-500/5"
    },
    green: { // Boss / Owner (Cyber Emerald & Volt Lime)
      border: "border-[#106011]/40 hover:border-[#106011] shadow-[0_0_25px_rgba(16,96,17,0.15)] hover:shadow-[0_0_50px_rgba(16,96,17,0.4)]",
      text: "text-[#106011] drop-shadow-[0_0_8px_rgba(16,96,17,0.6)]",
      hoverText: "group-hover:text-[#0ad111] group-hover:drop-shadow-[0_0_18px_rgba(10,209,17,0.9)]",
      iconBg: "border-[#106011]/40 group-hover:border-[#106011] bg-[#106011]/10",
      iconGlow: "group-hover:shadow-[0_0_30px_rgba(16,96,17,0.4)]",
      titleBorder: "border-[#106011]/70 group-hover:border-[#0ad111] group-hover:shadow-[0_0_30px_rgba(16,96,17,0.9)] bg-black/95",
      subBorder: "border-[#106011]/60 group-hover:border-[#0ad111]/80 group-hover:shadow-[0_0_25px_rgba(16,96,17,0.6)]",
      headingText: "text-[#0ad111]",
      lineBorder: "border-[#106011]/30 group-hover:border-[#106011]/60",
      cornerBorder: "border-[#106011] group-hover:border-[#0ad111] drop-shadow-[0_0_5px_rgba(10,209,17,0.5)]",
      bulletBg: "bg-[#0ad111] shadow-[0_0_8px_rgba(10,209,17,0.9)]",
      sigDot: "bg-[#0ad111] drop-shadow-[0_0_8px_rgba(10,209,17,1)] animate-pulse",
      sigText: "text-[#0ad111] font-black tracking-widest",
      sigLabel: "106.011 MHz",
      bgOverlay: "from-emerald-950/15 via-transparent to-emerald-950/25",
      accentTitleText: "text-[#0ad111] group-hover:text-emerald-400",
      bulletSubheaderText: "text-[#0ad111] font-black uppercase tracking-[0.2em] border-l-4 border-[#106011] pl-3 py-0.5 bg-[#106011]/15"
    },
    gold: { // Client (Tactical Gold / Solar Amber)
      border: "border-[#e2c80f]/40 hover:border-[#fdb804] shadow-[0_0_20px_rgba(226,200,15,0.15)] hover:shadow-[0_0_40px_rgba(253,184,4,0.45)]",
      text: "text-[#e2c80f] drop-shadow-[0_0_8px_rgba(226,200,15,0.6)]",
      hoverText: "group-hover:text-[#fdb804] group-hover:drop-shadow-[0_0_15px_rgba(253,184,4,0.9)]",
      iconBg: "border-[#e2c80f]/40 group-hover:border-[#fdb804]/80 bg-amber-950/20",
      iconGlow: "group-hover:shadow-[0_0_25px_rgba(253,184,4,0.35)]",
      titleBorder: "border-[#e2c80f]/50 group-hover:border-[#f8b206] group-hover:shadow-[0_0_25px_rgba(248,178,6,0.8)] bg-black/95",
      subBorder: "border-[#e2c80f]/40 group-hover:border-[#f8b206]/70 group-hover:shadow-[0_0_20px_rgba(248,178,6,0.5)]",
      headingText: "text-[#f8b206]",
      lineBorder: "border-[#e2c80f]/20 group-hover:border-[#fdb804]/40",
      cornerBorder: "border-[#e2c80f]/40 group-hover:border-[#fdb804]",
      bulletBg: "bg-[#e2c80f] shadow-[0_0_8px_rgba(226,200,15,0.9)]",
      sigDot: "bg-[#f8b206] drop-shadow-[0_0_6px_rgba(248,178,6,1)] animate-pulse",
      sigText: "text-[#f5b616] font-black tracking-widest",
      sigLabel: "217.180 MHz",
      bgOverlay: "from-amber-950/10 via-transparent to-amber-950/20",
      accentTitleText: "text-[#f8b206] group-hover:text-amber-400",
      bulletSubheaderText: "text-[#fdb804] font-black uppercase tracking-[0.2em] border-l-4 border-[#e2c80f] pl-3 py-0.5 bg-amber-500/10"
    }
  };

  const theme = themes[color as keyof typeof themes] || themes.green;

  return (
    <motion.div
      animate={{ opacity: [0.96, 1, 0.96] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className={`${isExpanded ? 'h-auto min-h-[600px]' : 'h-[600px]'} transition-all duration-500`}
    >
      <div 
        onClick={() => !isExpanded && navigate(to)}
        className={`group flex flex-col items-center gap-6 p-8 rounded-[2rem] bg-black/95 transition-all duration-700 border-2 ${theme.border} ${!isExpanded ? 'hover:-translate-y-4 cursor-pointer' : ''} relative overflow-hidden select-none h-full shadow-[0_0_40px_rgba(0,0,0,0.5)]`}
      >
        {/* 0. Primary Scanning Mask Layer (Global Card Level) */}
        <motion.div 
          animate={{ x: ['-150%', '250%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className={`absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-current to-transparent skew-x-[30deg] opacity-0 group-hover:opacity-[0.05] pointer-events-none z-10 ${theme.text}`}
        />

        {/* 1. Tactical Ambient Core Layer */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgOverlay} opacity-30 group-hover:opacity-60 transition-opacity duration-1000 pointer-events-none`} />
      
      {/* 2. Precision Scanning Matrix Mask */}
      <motion.div 
        animate={{ y: ['-20%', '120%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className={`absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-current to-transparent opacity-0 group-hover:opacity-[0.08] blur-2xl z-20 pointer-events-none ${theme.text}`}
      />

      {/* 3. Horizontal Scanning HUD Line */}
      <motion.div 
        animate={{ y: ['-100%', '300%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className={`absolute inset-x-0 h-0.5 bg-current opacity-0 group-hover:opacity-30 blur-[1px] z-30 pointer-events-none ${theme.text}`}
      />

      {/* 4. Global HUD Precision Brackets */}
      <div className={`absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 ${theme.cornerBorder} rounded-tl-2xl pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:-translate-x-1 group-hover:-translate-y-1`}></div>
      <div className={`absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 ${theme.cornerBorder} rounded-tr-2xl pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:translate-x-1 group-hover:-translate-y-1`}></div>
      <div className={`absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 ${theme.cornerBorder} rounded-bl-2xl pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:-translate-x-1 group-hover:translate-y-1`}></div>
      <div className={`absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 ${theme.cornerBorder} rounded-br-2xl pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:translate-x-1 group-hover:translate-y-1`}></div>

      {/* 5. Concentric Nested Tactical HUD Lines */}
      <div className={`absolute inset-3 border border-dashed ${theme.lineBorder} rounded-[1.75rem] pointer-events-none transition-all duration-500 group-hover:border-current group-hover:opacity-40`}></div>
      <div className={`absolute inset-5 border border-dotted opacity-20 ${theme.lineBorder} rounded-[1.5rem] pointer-events-none transition-all duration-500 group-hover:opacity-30`}></div>

      {/* 6. Measurement Side Rails (Ticks) */}
      <div className="absolute left-2.5 top-20 bottom-20 flex flex-col justify-between items-center z-20 opacity-20 group-hover:opacity-40 transition-opacity">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`w-2 h-[1px] bg-current ${i % 3 === 0 ? 'w-4 h-[1.5px]' : 'w-2'} ${theme.text}`} />
        ))}
      </div>
      <div className="absolute right-2.5 top-20 bottom-20 flex flex-col justify-between items-center z-20 opacity-20 group-hover:opacity-40 transition-opacity">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`w-2 h-[1px] bg-current ${i % 3 === 0 ? 'w-4 h-[1.5px]' : 'w-2'} ${theme.text}`} />
        ))}
      </div>

      {/* 7. Tactical Title Module (At Top) */}
      <div className="w-full flex-shrink-0 relative z-40">
        <motion.h2 
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`mx-auto relative px-6 py-3 font-display font-black uppercase tracking-[0.4em] text-xs text-center border-2 rounded-xl overflow-hidden select-none transition-all duration-500 ${theme.titleBorder} shadow-lg w-full flex items-center justify-center whitespace-nowrap`}
        >
          {/* Dynamic Scanning Mask Layer */}
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-current to-transparent skew-x-12 opacity-0 group-hover:opacity-20 pointer-events-none z-0 ${theme.text}`}
          />

          {/* Tactical HUD Corner Brackets inside Title */}
          <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${theme.cornerBorder} pointer-events-none`}></div>
          <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${theme.cornerBorder} pointer-events-none`}></div>
          <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${theme.cornerBorder} pointer-events-none`}></div>
          <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${theme.cornerBorder} pointer-events-none`}></div>

          <span className={`relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] ${theme.hoverText}`}>{title}</span>
        </motion.h2>
      </div>

      {/* 8. Animated Icon Module (Centered) */}
      <div className="flex-1 flex items-center justify-center w-full relative z-10 my-4">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
          className={`p-6 rounded-full bg-black/60 border-2 ${theme.iconBg} shadow-[0_0_30px_rgba(0,0,0,0.4)] relative transition-all duration-500 ${theme.iconGlow}`}
        >
          {icon}
        </motion.div>
      </div>
      
      {/* 9. Content Cluster (Bottom Cluster) */}
      <div className="flex flex-col gap-6 items-center w-full relative z-20 mt-auto mb-4">
        {/* Features Matrix Toggle */}
        {features && features.length > 0 && (
          <div className="w-full flex flex-col gap-2 relative z-20">
            <motion.button 
              animate={{ 
                opacity: isExpanded ? 1 : [0.8, 1, 0.8],
                boxShadow: isExpanded ? [`0 0 15px ${theme.border.split(' ')[0].replace('border-', '')}`] : []
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className={`flex items-center justify-between w-full px-5 py-3 rounded-xl border-2 transition-all duration-500 group/btn relative overflow-hidden ${isExpanded ? theme.border + ' bg-black/60 shadow-lg' : 'border-slate-800/60 hover:border-slate-600 bg-black/40'}`}
            >
              {/* Internal Button Dynamic Scanning Mask */}
              <motion.div 
                animate={{ x: ['-200%', '300%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className={`absolute inset-y-0 w-full bg-gradient-to-r from-transparent via-current to-transparent skew-x-[30deg] opacity-0 group-hover/btn:opacity-20 pointer-events-none z-0 ${theme.text}`}
              />

              {/* HUD Brackets for Toggle */}
              <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l pointer-events-none transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0'} ${theme.cornerBorder}`} />
              <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r pointer-events-none transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0'} ${theme.cornerBorder}`} />

              <div className="flex items-center gap-3 relative z-10">
                <Layers className={`w-4 h-4 transition-transform duration-500 ${isExpanded ? theme.text + ' rotate-180' : 'text-slate-500'}`} />
                <span className={`text-[11px] font-mono font-black uppercase tracking-[0.25em] transition-colors duration-500 ${isExpanded ? theme.text : 'text-slate-400 group-hover/btn:text-slate-200'}`}>
                  Operational Matrix
                </span>
              </div>
              
              <div className="relative z-10">
                {isExpanded ? (
                  <ChevronUp className={`w-4 h-4 ${theme.text} drop-shadow-[0_0_5px_currentColor]`} />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 group-hover/btn:text-slate-300 transition-colors" />
                )}
              </div>
            </motion.button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="overflow-hidden"
                >
                  <div className="text-[11px] font-mono flex flex-col items-start w-full mt-2 space-y-2 pl-2 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar-thin bg-black/30 rounded-xl p-3 border border-white/5">
                    {features.map((feature, i) => {
                      if (feature.endsWith(':')) {
                        return (
                          <motion.div 
                            key={i} 
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className={`mt-4 mb-1 text-[10px] w-full ${theme.bulletSubheaderText}`}
                          >
                            {feature.replace(':', '')}
                          </motion.div>
                        );
                      }
                      return (
                        <motion.div 
                          key={i} 
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 0.8 }}
                          whileHover={{ x: 5, opacity: 1 }}
                          className="flex items-start gap-3 text-left text-slate-300 transition-all duration-300"
                        >
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${theme.bulletBg}`}></span> 
                          {feature === "Getto 💲" ? (
                            <motion.span 
                              animate={{ opacity: [1, 0.5, 1], scale: [1, 1.05, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="text-[#fdb804] font-black drop-shadow-[0_0_12px_rgba(253,184,4,0.8)]"
                            >
                              {feature}
                            </motion.span>
                          ) : (
                            <span className="leading-tight group-hover:text-white transition-colors">{feature}</span>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Signal/Metadata Badge */}
        <div className={`relative px-6 py-2 flex items-center justify-center overflow-hidden border-2 bg-black/90 rounded-full transition-all duration-500 select-none ${theme.subBorder} shadow-md`}>
          <div className="flex items-center gap-2.5 relative z-10">
            <motion.div 
              animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-2 h-2 rounded-full shrink-0 ${theme.sigDot}`}
            />
            <span className={`text-[9px] font-mono font-black tracking-[0.25em] uppercase ${theme.sigText}`}>
              {theme.sigLabel}
            </span>
          </div>
        </div>
      </div>
      
      {/* Footer / Initialize Button Action (At Bottom) */}
      <div className="w-full flex-shrink-0 mt-2">
        <Link 
          to={to}
          onClick={(e) => e.stopPropagation()}
          className={`flex items-center justify-center gap-3 w-full py-4 rounded-xl border-2 font-mono font-black uppercase tracking-[0.3em] text-[11px] transition-all duration-500 shadow-lg ${theme.titleBorder} ${theme.hoverText} hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group/init`}
        >
          {/* Internal Button Scan Line */}
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none`}
          />
          <span className="animate-pulse relative z-10">Initialize Sequence</span>
          <Terminal className="w-4 h-4 relative z-10" />
        </Link>
      </div>
      </div>
    </motion.div>
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
        className="w-full bg-black/95 border-2 border-[#106011]/70 hover:border-[#0ad111] rounded-2xl p-5 flex items-center justify-between shadow-[0_0_35px_rgba(16,96,17,0.3)] hover:shadow-[0_0_50px_rgba(16,96,17,0.5)] transition-all group overflow-hidden relative"
      >
        {/* Advanced Tactical HUD Layer */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#106011]/5 via-transparent to-[#106011]/5 pointer-events-none" />
        
        {/* Dynamic Scanning Line */}
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#106011]/20 to-transparent blur-[2px] skew-x-12 z-0"
        />

        {/* Global HUD Brackets */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 z-20 border-[#0ad111] drop-shadow-[0_0_8px_#0ad111]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 z-20 border-[#0ad111] drop-shadow-[0_0_8px_#0ad111]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 z-20 border-[#0ad111] drop-shadow-[0_0_8px_#0ad111]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 z-20 border-[#0ad111] drop-shadow-[0_0_8px_#0ad111]" 
        />

        {/* Triple Nested HUD Outlines */}
        <div className="absolute inset-1 border-[2px] border-dashed pointer-events-none rounded-xl z-20 border-[#106011]/50 group-hover:border-[#0ad111]/70 transition-colors" />
        <div className="absolute inset-2 border-[1px] border-dotted pointer-events-none rounded-lg z-20 border-[#106011]/30 group-hover:border-[#0ad111]/50 transition-colors" />
        <div className="absolute inset-3 border-[0.5px] pointer-events-none rounded-md z-20 border-[#106011]/10 group-hover:border-[#0ad111]/30 transition-colors" />


        <div className="flex flex-col items-center justify-center gap-2 w-full text-center">
          <div className="flex items-center gap-3 w-full overflow-hidden">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#0ad111] bg-black shrink-0 shadow-[0_0_8px_rgba(10,209,17,0.4)] flex items-center justify-center p-0.5 group-hover:shadow-[0_0_12px_#0ad111] relative z-10">
              <img src="/Appicon.png" alt="App Icon" className="w-full h-full object-cover rounded-full" />
            </div>
            
            <div 
              style={{ backgroundColor: '#1a1515' }}
              className="flex-1 overflow-hidden relative h-6 flex items-center"
            >
              <motion.div 
                animate={{ x: [0, "-50%"] }}
                transition={{ duration: 30, ease: "linear", repeat: Infinity }}
                className="flex items-center whitespace-nowrap gap-12"
              >
                {[1, 2].map((i) => (
                  <h3 
                    key={i}
                    style={{ 
                      borderColor: '#148f23', 
                      textDecorationLine: 'underline', 
                      textAlign: 'left', 
                      fontFamily: 'Times New Roman', 
                      color: '#219f12', 
                      backgroundColor: '#6a0f0f' 
                    }}
                    className="text-sm font-black tracking-[0.25em] font-mono uppercase drop-shadow-[0_0_4px_rgba(10,209,17,0.6)] border px-4"
                  >
                    ANNOUNCEMENTS AND ALL UPDATES WILL BE POSTED HERE. ALWAYS CHECK THE UPDATES FOR FREE DROPS, PROMOS, EVENTS ✅
                  </h3>
                ))}
              </motion.div>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-[#106011]/10 border border-[#106011]/30 rounded font-mono text-[8px] text-[#0ad111] shrink-0 relative z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0ad111] animate-ping" />
              LIVE_LINK
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 w-full px-8">
            <div className="h-px bg-gradient-to-r from-transparent via-[#106011]/50 to-transparent flex-1" />
            <p className="text-[9px] text-[#0ad111]/80 font-mono tracking-widest uppercase">
              Update stream from: Boss / Super Admin Console
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-[#106011]/50 to-transparent flex-1" />
            
            {isOpen ? <ChevronUp className="text-[#0ad111] w-4 h-4 shrink-0" /> : <ChevronDown className="text-[#0ad111] w-4 h-4 shrink-0" />}
          </div>
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
            <div className="mt-4 bg-black/98 border-2 border-[#106011]/60 rounded-3xl p-10 shadow-[inset_0_0_120px_rgba(16,96,17,0.2),0_0_40px_rgba(16,96,17,0.1)] relative text-left overflow-hidden group/panel">
              {/* Ultra-High Contrast Background Core */}
              <div 
                className="absolute inset-0 w-full h-full opacity-40 pointer-events-none mix-blend-screen bg-cover bg-center bg-no-repeat grayscale-[0.2] brightness-110 contrast-150 scale-105 transition-transform duration-1000 group-hover/panel:scale-110"
                style={{ backgroundImage: `url('/regenerated_image_1781027109738.jpg')` }}
              />

              {/* Tactical Flux Overlays */}
              <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-[#106011]/10 pointer-events-none z-0" />
              
              {/* Complex Tactical Precision Grid */}
              <div 
                className="absolute inset-0 opacity-[0.08] pointer-events-none z-10"
                style={{
                  backgroundImage: `
                    linear-gradient(#106011 1.5px, transparent 1.5px), 
                    linear-gradient(90deg, #106011 1.5px, transparent 1.5px),
                    linear-gradient(#0ad111 0.5px, transparent 0.5px), 
                    linear-gradient(90deg, #0ad111 0.5px, transparent 0.5px)
                  `,
                  backgroundSize: '80px 80px, 80px 80px, 20px 20px, 20px 20px'
                }}
              />

              {/* Geometric HUD Accents */}
              <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-[#0ad111] opacity-60 z-20" />
              <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-[#0ad111] opacity-60 z-20" />
              <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-[#0ad111] opacity-60 z-20" />
              <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-[#0ad111] opacity-60 z-20" />

              {/* CRT Lens Distortion & Noise */}
              <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(10,209,17,0.05)_50%)] bg-[length:100%_2px] pointer-events-none z-20 opacity-40" />

              {/* Dynamic Scanning Matrix Mask */}
              <motion.div 
                animate={{ y: ['-20%', '120%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-[#0ad111]/10 to-transparent blur-xl z-20 pointer-events-none"
              />

              {/* Precision HUD Measurement Ticks (Static Sidebar Decoration) */}
              <div className="absolute left-3 top-20 bottom-20 flex flex-col justify-between items-center z-20 opacity-30">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`w-3 h-[1px] bg-[#0ad111] ${i % 2 === 0 ? 'w-5' : 'w-3'}`} />
                ))}
              </div>

              {/* Hyper-Detailed HUD Frame */}
              <div className="absolute inset-2 border-[1.5px] border-dashed border-[#106011]/40 rounded-[2rem] pointer-events-none z-20" />
              <div className="absolute inset-5 border border-[#106011]/20 rounded-[1.5rem] pointer-events-none z-20 shadow-[0_0_40px_rgba(16,96,17,0.1)]" />
              
              <div className="relative z-30 space-y-6 max-h-[450px] overflow-y-auto custom-scrollbar pr-6 pl-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#106011]/20">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0ad111] animate-pulse shadow-[0_0_12px_#0ad111]" />
                      <span className="text-sm font-mono font-black text-[#0ad111] tracking-[0.4em] uppercase drop-shadow-[0_0_8px_rgba(10,209,17,0.6)]">Bulletin_Manifest_v2.5</span>
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-mono text-[#106011]/60 uppercase tracking-widest pl-5">
                      <Terminal className="w-2 h-2" />
                      Stream_Source: HQ_COMMAND_UPLINK
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="px-3 py-1 bg-[#106011]/20 rounded-md border border-[#106011]/40 text-[9px] font-mono text-[#0ad111] tracking-tighter uppercase font-black">AUTH_VERIFIED</div>
                    <div className="text-[7px] font-mono text-[#106011]/40 select-none">SEQ_ID: {Math.random().toString(16).slice(2, 8).toUpperCase()}</div>
                  </div>
                </div>

                {bulletins.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                    whileHover={{ x: 10, backgroundColor: 'rgba(10, 209, 17, 0.05)' }}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border-l-4 rounded-r-xl transition-all duration-300 gap-4 group/item relative overflow-hidden bg-black/40 ${
                      item.type === 'CRITICAL' ? 'border-red-600 shadow-[inset_0_0_20px_rgba(220,25,25,0.05)]' : 
                      item.type === 'SUPER_ADMIN' ? 'border-blue-500 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]' : 
                      'border-[#106011] shadow-[inset_0_0_20px_rgba(16,96,17,0.05)]'
                    }`}
                  >
                    {/* Item HUD Brackets */}
                    <div className={`absolute top-0 right-0 w-4 h-4 border-t border-r opacity-0 group-hover/item:opacity-40 transition-opacity ${
                      item.type === 'CRITICAL' ? 'border-red-500' : item.type === 'SUPER_ADMIN' ? 'border-blue-400' : 'border-[#0ad111]'
                    }`} />
                    <div className={`absolute bottom-0 right-0 w-4 h-4 border-b border-r opacity-0 group-hover/item:opacity-40 transition-opacity ${
                      item.type === 'CRITICAL' ? 'border-red-500' : item.type === 'SUPER_ADMIN' ? 'border-blue-400' : 'border-[#0ad111]'
                    }`} />

                    <div className="flex flex-col gap-2 relative z-10">
                      <div className="flex items-center gap-3">
                        <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded-sm border uppercase shadow-sm ${
                          item.type === 'CRITICAL' ? 'border-red-800 text-red-400 bg-red-950/40' : 
                          item.type === 'SUPER_ADMIN' ? 'border-blue-800 text-blue-300 bg-blue-950/40' : 
                          'border-[#106011]/60 text-[#0ad111] bg-[#106011]/30'
                        }`}>
                          {item.type}
                        </span>
                        <div className="flex items-center gap-1.5 text-[8px] text-slate-500 font-mono tracking-tighter">
                          <Satellite className="w-2.5 h-2.5" />
                          STAMP: {item.time}
                        </div>
                      </div>
                      <p className={`text-[11px] font-mono leading-relaxed tracking-wider transition-colors ${
                         item.type === 'CRITICAL' ? 'text-red-100/90' : 'text-slate-100'
                      }`}>
                        {item.text}
                      </p>
                    </div>
                    <div className="shrink-0 opacity-40 group-hover/item:opacity-100 transition-all group-hover/item:scale-110">
                       <Radio className={`w-4 h-4 ${
                         item.type === 'CRITICAL' ? 'text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                         item.type === 'SUPER_ADMIN' ? 'text-blue-400' : 
                         'text-[#0ad111] shadow-[0_0_8px_rgba(10,209,17,0.4)]'
                       }`} />
                    </div>
                  </motion.div>
                ))}

                {bulletins.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-[9px] text-slate-600 font-mono italic">NO ACTIVE BROADCASTS DETECTED</p>
                  </div>
                )}
              </div>

              {/* Maintenance & Connectivity Diagnostics */}
              <div className="mt-8 pt-6 border-t border-[#106011]/20 flex flex-wrap justify-between items-center gap-4 relative z-30">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[6px] font-mono text-[#106011]/60 uppercase tracking-widest">Device_Signature</span>
                    <span className="bg-[#1c1c1c] border border-[#dc1919]/60 text-[#dc1919] px-2 py-0.5 rounded-sm text-[8px] font-black font-mono shadow-[0_0_10px_rgba(220,25,25,0.15)]">TERMINAL_ID: BN-9981</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[6px] font-mono text-[#106011]/60 uppercase tracking-widest">Security_Protocol</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0ad111] animate-ping" />
                      <span className="text-[8px] font-mono text-[#0ad111] font-bold uppercase tracking-tighter">AES_256_ACTIVE</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[6px] font-mono text-[#106011]/60 uppercase tracking-widest">Signal_Latency</span>
                    <div className="flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5 text-[#0ad111]" />
                      <span className="text-[8px] font-mono text-[#0ad111] font-bold">14.2ms</span>
                    </div>
                  </div>
                  <div className="h-6 w-[1px] bg-[#106011]/20" />
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[6px] font-mono text-[#106011]/60 uppercase tracking-widest">Uplink_Node</span>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5 text-[#0ad111]" />
                      <span className="text-[8px] font-mono text-[#0ad111] font-bold">SECURE_ALPHA_IX</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
