import { Link } from 'react-router-dom';
import { Shield, Radio, Target } from 'lucide-react';

export function RoleSelector() {
  return (
    <div className="relative flex flex-col items-center justify-start min-h-[calc(100vh-80px)] gap-12 py-12 px-6 text-center overflow-y-auto custom-scrollbar">
      {/* Background Cover Photo */}
      <div 
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none mix-blend-luminosity bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/CoverpPhoto.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[--bg-primary]/30 via-[--bg-primary]/80 to-[--bg-primary] pointer-events-none" />

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-center flex-col md:flex-row gap-6 mb-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <img src="/CoverpPhoto.png" alt="Cover" className="max-w-[280px] md:max-w-[400px] w-full rounded-xl border border-[--border-subtle] shadow-[0_0_20px_rgba(34,197,94,0.2)]" />
            <h1 className="text-xl lg:text-3xl tracking-[0.2em] text-[--accent-primary] drop-shadow-[0_0_15px_rgba(34,197,94,0.5)] uppercase font-display font-bold text-center">
               Occidental Mindoro Mamburao
            </h1>
          </div>
        </div>
        <div className="text-[--text-secondary] font-mono text-left max-w-xl mx-auto text-xs opacity-80 bg-black/40 p-6 rounded-xl border border-[--accent-primary]/20 shadow-[0_0_15px_rgba(34,197,94,0.1)] tracking-widest max-h-[250px] overflow-y-auto custom-scrollbar">
          <div className="pt-2">
            <p className="mb-4 text-[--accent-primary] drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] font-bold uppercase text-[11px] text-center tracking-[0.2em]">Map System Features Active</p>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2 list-none text-[9px] uppercase text-slate-300">
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Realtime map rendering</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> GPS tracking</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Live moving markers</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Product pin markers</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> User markers</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Marker modal popups</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Route navigation</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> GPS pathway indicators</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Marker clustering</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Zoom controls</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Fullscreen mode</li>
            </ul>

            <p className="mt-8 mb-4 text-[--accent-primary] drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] font-bold uppercase text-[11px] text-center tracking-[0.2em]">Chat System</p>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2 list-none text-[9px] uppercase text-slate-300">
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> WebSocket realtime chat</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> User online status</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Typing indicator</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Seen messages</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Image/video sending</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Chat notifications</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Chat history</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Mobile optimized chat UI</li>
            </ul>

            <p className="mt-8 mb-4 text-[--accent-primary] drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] font-bold uppercase text-[11px] text-center tracking-[0.2em]">PWA Features</p>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2 list-none text-[9px] uppercase text-slate-300">
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Installable on Android</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Offline support</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Cached maps</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Push notifications</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Background sync</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Fast loading</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> App manifest</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Service worker</li>
            </ul>

            <p className="mt-8 mb-4 text-[--accent-primary] drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] font-bold uppercase text-[11px] text-center tracking-[0.2em]">Bonus Features</p>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2 list-none text-[9px] uppercase text-slate-300 relative pb-2">
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> AI analytics dashboard</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Geofencing alerts</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Heatmaps</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Realtime alerts</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Auto-expiring product pins</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Voice notes in chat</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Multi-language support</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[--accent-primary] shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span> Admin statistics dashboard</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full relative z-10">
         <RoleCard 
           to="/super-admin" 
           icon={<Shield className="w-12 h-12 text-red-500 group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all" />} 
           title="Super Admin / Owner" 
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
           icon={<Radio className="w-12 h-12 text-blue-500 group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all" />} 
           title="Admin / Dropper" 
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
           icon={<Target className="w-12 h-12 text-[--accent-primary] group-hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] transition-all" />} 
           title="Buyer / Client" 
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
    red: "border-red-500/20 hover:border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.2)]",
    blue: "border-blue-500/20 hover:border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]",
    green: "border-[--accent-primary]/20 hover:border-[--accent-primary]/60 shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]",
  }
  
  const textColors = {
    red: "text-red-500",
    blue: "text-blue-500",
    green: "text-[--accent-primary]",
  }

  return (
    <Link to={to} className={`group flex flex-col items-center gap-6 p-8 rounded-2xl glass-card transition-all duration-500 border ${borderColors[color as keyof typeof borderColors]} hover:-translate-y-2`}>
      <div className={`p-4 rounded-full bg-black/40 border border-white/5`}>
        {icon}
      </div>
      <div className="flex flex-col gap-3 items-center w-full">
        <h2 className={`font-display font-bold uppercase tracking-widest text-lg text-center ${textColors[color as keyof typeof textColors]}`}>
          {title}
        </h2>
        <div className={`h-px w-12 bg-current opacity-30 ${textColors[color as keyof typeof textColors]}`} />
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
                  <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${color === 'red' ? 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.8)]' : color === 'blue' ? 'bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.8)]' : 'bg-[--accent-primary] shadow-[0_0_4px_rgba(34,197,94,0.8)]'}`}></span> 
                  {feature}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div className={`mt-auto text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity ${textColors[color as keyof typeof textColors]}`}>
        Initialize Sequence →
      </div>
    </Link>
  )
}
