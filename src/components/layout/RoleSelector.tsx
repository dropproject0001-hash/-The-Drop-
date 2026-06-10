import { Link } from 'react-router-dom';
import { Radio, Target, Leaf, Satellite } from 'lucide-react';
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

      <div className="space-y-4 relative z-10 w-full flex flex-col items-center">
        <div className="flex items-center justify-center flex-col md:flex-row gap-6 mb-4 w-full">
          <div className="flex flex-col items-center justify-center gap-4 w-full">

            <div 
              className="relative p-4 bg-black/80 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(16,96,17,0.4)] border border-[#106011]/50 mx-auto w-full max-w-4xl"
              style={{ height: '200px' }}
            >
              {/* Corner HUD Brackets */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[#106011] rounded-tl-2xl drop-shadow-[0_0_12px_rgba(16,96,17,0.95)]"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[#106011] rounded-tr-2xl drop-shadow-[0_0_12px_rgba(16,96,17,0.95)]"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[#106011] rounded-bl-2xl drop-shadow-[0_0_12px_rgba(16,96,17,0.95)]"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[#106011] rounded-br-2xl drop-shadow-[0_0_12px_rgba(16,96,17,0.95)]"></div>

              {/* Inner Nested High-Contrast Tactical HUD Lines */}
              <div className="absolute inset-2 border-2 border-dashed border-[#106011]/60 rounded-xl pointer-events-none"></div>
              <div className="absolute inset-4 border border-[#106011]/40 rounded-lg pointer-events-none"></div>

              {/* HUD Telemetry Labels */}
              <div className="absolute top-6 right-6 z-20 text-[8px] font-mono text-[#106011] tracking-[0.3em] uppercase flex items-center gap-1.5">
                <span className="animate-pulse">● THE DROP SYSTEM V1.0</span>
              </div>

              {/* Tactical grid scale lines/deco */}
              <div className="absolute top-6 bottom-6 left-2 w-px border-l border-dotted border-[#106011]/30"></div>
              <div className="absolute top-6 bottom-6 right-2 w-px border-r border-dotted border-[#106011]/30"></div>

              {/* Tactical frequency details & telemetry overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-[9px] font-mono text-[#106011] tracking-widest drop-shadow-[0_0_6px_rgba(16,96,17,0.9)] pointer-events-none bg-black/80 px-3 py-1 rounded border border-[#106011]/40 z-20">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#106011] animate-ping"></span>
                  SIG: 106.011 MHz
                </span>
                <span className="animate-pulse">● FEED ONLINE</span>
              </div>

              {/* Actual Dynamic Slider */}
              <div className="w-full h-full relative z-10">
                <BannerSlider />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full relative z-10">
         <RoleCard 
           to="/super-admin" 
           icon={<NeonIcon imageSrc="/Appicon.png" color="green" size={56} className="group-hover:scale-110 transition-transform duration-300" />} 
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
           color="red"
         />
         <RoleCard 
           to="/dropper" 
           icon={<NeonIcon imageSrc="/Dropper-icon.png" color="blue" size={56} className="group-hover:scale-110 transition-transform duration-300" />} 
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
           icon={<NeonIcon imageSrc="/buyer-icon.png" color="green" size={56} className="group-hover:scale-110 transition-transform duration-300" />} 
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
           color="green"
         />
      </div>
    </div>
  )
}

function RoleCard({ to, icon, title, description, features, color }: { to: string, icon: React.ReactNode, title: string, description?: string, features?: string[], color: string }) {
  const borderColors = {
    red: "border-[#106011]/30 hover:border-[#106011]/80 shadow-[0_0_15px_rgba(16,96,17,0.1)] hover:shadow-[0_0_25px_rgba(16,96,17,0.3)]",
    blue: "border-[#106011]/30 hover:border-[#106011]/80 shadow-[0_0_15px_rgba(16,96,17,0.1)] hover:shadow-[0_0_25px_rgba(16,96,17,0.3)]",
    green: "border-[#106011]/30 hover:border-[#106011]/80 shadow-[0_0_15px_rgba(16,96,17,0.1)] hover:shadow-[0_0_25px_rgba(16,96,17,0.3)]",
  }
  
  const textColors = {
    red: "text-[#106011] drop-shadow-[0_0_5px_rgba(16,96,17,0.5)]",
    blue: "text-[#106011] drop-shadow-[0_0_5px_rgba(16,96,17,0.5)]",
    green: "text-[#106011] drop-shadow-[0_0_5px_rgba(16,96,17,0.5)]",
  }

  return (
    <Link to={to} className={`group flex flex-col items-center gap-6 p-8 rounded-2xl bg-black/95 transition-all duration-500 border ${borderColors[color as keyof typeof borderColors]} hover:-translate-y-2 relative overflow-hidden select-none`}>
      {/* Background Cover Photo Overlay */}
      <div 
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none mix-blend-overlay bg-cover bg-center bg-no-repeat group-hover:scale-110 transition-transform duration-700"
        style={{ backgroundImage: `url('/Backgroundimage.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Tactical HUD Corner Brackets */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#106011] rounded-tl-xl pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.85)] opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"></div>
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#106011] rounded-tr-xl pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.85)] opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#106011] rounded-bl-xl pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.85)] opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"></div>
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#106011] rounded-br-xl pointer-events-none drop-shadow-[0_0_5px_rgba(16,96,17,0.85)] opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"></div>

      {/* Inner Nested High-Contrast Tactical HUD Lines */}
      <div className="absolute inset-1.5 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none group-hover:border-[#106011]/60 transition-colors duration-300"></div>
      <div className="absolute inset-2.5 border border-[#106011]/15 rounded-lg pointer-events-none group-hover:border-[#106011]/30 transition-colors duration-300"></div>

      {/* Decorative vertical target/measurement rails */}
      <div className="absolute top-6 bottom-6 left-1.5 w-px border-l border-dotted border-[#106011]/20 group-hover:border-[#106011]/45 transition-colors duration-300"></div>
      <div className="absolute top-6 bottom-6 right-1.5 w-px border-r border-dotted border-[#106011]/20 group-hover:border-[#106011]/45 transition-colors duration-300"></div>

      <div className={`p-4 rounded-full bg-black/40 border border-[#106011]/30 shadow-[0_0_10px_rgba(16,96,17,0.15)] relative z-10 transition-all duration-300 group-hover:border-[#106011] group-hover:shadow-[0_0_15px_rgba(16,96,17,0.4)]`}>
        {icon}
      </div>
      <div className="flex flex-col gap-3 items-center w-full relative z-10">
        <h2 className="relative px-6 py-2.5 font-display font-black uppercase tracking-[0.25em] text-xs text-center text-[#106011] bg-black/95 border-2 border-[#106011] shadow-[0_0_15px_rgba(16,96,17,0.55)] drop-shadow-[0_0_10px_rgba(16,96,17,0.9)] group-hover:shadow-[0_0_22px_rgba(16,96,17,0.85)] group-hover:drop-shadow-[0_0_15px_rgba(16,96,17,1)] transition-all duration-300 rounded overflow-hidden select-none">
          {/* Tactical HUD Corner Brackets inside */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.9)]"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.9)]"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.9)]"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#106011] pointer-events-none drop-shadow-[0_0_4px_rgba(16,96,17,0.9)]"></div>

          {/* Double Nested Rectangle dashed/solid HUD lines */}
          <div className="absolute inset-0.5 border border-dashed border-[#106011]/45 rounded pointer-events-none"></div>
          <div className="absolute inset-1 border border-[#106011]/20 rounded pointer-events-none"></div>

          <span className="relative z-10">{title}</span>
        </h2>
        <div className="relative w-28 h-5 flex items-center justify-center overflow-hidden border border-[#106011]/45 bg-black/80 rounded shadow-[0_0_10px_rgba(16,96,17,0.3)] group-hover:border-[#106011]/80 group-hover:shadow-[0_0_15px_rgba(16,96,17,0.5)] transition-all duration-300 select-none">
          {/* Tactical HUD Corner Brackets */}
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#106011] pointer-events-none drop-shadow-[0_0_3px_#106011]"></div>
          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#106011] pointer-events-none drop-shadow-[0_0_3px_#106011]"></div>
          <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#106011] pointer-events-none drop-shadow-[0_0_3px_#106011]"></div>
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#106011] pointer-events-none drop-shadow-[0_0_3px_#106011]"></div>

          {/* Double Nested Rectangle dashed/solid borders */}
          <div className="absolute inset-[1px] border border-dashed border-[#106011]/35 rounded pointer-events-none"></div>
          <div className="absolute inset-[2.5px] border border-[#106011]/15 rounded pointer-events-none"></div>

          {/* Frequency & tactical frequency metadata matching green signal */}
          <div className="flex items-center gap-1.5 relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#106011] drop-shadow-[0_0_4px_#106011] animate-pulse shrink-0"></span>
            <span className="text-[7.5px] font-mono font-black text-[#106011] tracking-[0.2em] uppercase drop-shadow-[0_0_4px_rgba(16,96,17,0.7)]">
              106.011 MHz
            </span>
          </div>
        </div>
        {description && (
          <p className="text-[11px] font-mono text-[--text-secondary] text-center leading-relaxed max-w-[200px]">
            {description}
          </p>
        )}
        {features && features.length > 0 && (
          <div className="text-[10px] font-mono flex flex-col items-start w-full mt-2 space-y-1 pl-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
            {features.map((feature, i) => {
              if (feature.endsWith(':')) {
                return <div key={i} className={`mt-3 font-bold mb-1 opacity-90 ${textColors[color as keyof typeof textColors]}`}>{feature}</div>
              }
              return (
                <div key={i} className="flex items-start gap-2 text-left text-slate-300 opacity-80">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-[#106011] shadow-[0_0_4px_rgba(16,96,17,0.85)]"></span> 
                  {feature}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div className={`mt-auto text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${textColors[color as keyof typeof textColors]}`}>
        Initialize Sequence →
      </div>
    </Link>
  )
}
