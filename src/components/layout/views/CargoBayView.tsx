import { useState } from 'react';
import { Package, ShieldCheck, Plus, Minus, FilePlus, RefreshCw } from 'lucide-react';

export function CargoBayView() {
  const [cargo, setCargo] = useState([
    { id: 'CRG-A01', name: 'Premium Supply Bundle', category: 'Tactical', qty: 15, location: 'Nueva Ecija Depot Area A', security: 'Level 4' },
    { id: 'CRG-B04', name: 'Secured Rations Pack', category: 'Rations', qty: 42, location: 'Nueva Ecija West S1', security: 'Level 2' },
    { id: 'CRG-C09', name: 'Emergency Transceiver Unit', category: 'Hardware', qty: 6, location: 'Cabanatuan Terminal B', security: 'Level 5' },
    { id: 'CRG-D12', name: 'Encrypted Drop Locator Tag', category: 'GPS Tracker', qty: 29, location: 'Gapan Tactical Base', security: 'Level 4' },
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Tactical');
  const [newItemQty, setNewItemQty] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);

  const handleQtyAdjust = (id: string, dir: 'inc' | 'dec', name: string) => {
    setCargo(prev => prev.map(c => {
      if (c.id === id) {
        const nextQty = dir === 'inc' ? c.qty + 1 : Math.max(0, c.qty - 1);
        setLogs(prevLogs => [`[${new Date().toLocaleTimeString()}] UPDATE: ${name} qty modified to ${nextQty} units.`, ...prevLogs]);
        return { ...c, qty: nextQty };
      }
      return c;
    }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newID = `CRG-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(100 + Math.random() * 900)}`;
    const fresh = {
      id: newID,
      name: newItemName,
      category: newItemCategory,
      qty: newItemQty,
      location: 'Nueva Ecija Central Vault',
      security: 'Level 4'
    };

    setCargo(prev => [...prev, fresh]);
    setLogs(prevLogs => [`[${new Date().toLocaleTimeString()}] REGISTRATION SUCCESS: ${newItemName} added with ID ${newID}`, ...prevLogs]);
    setNewItemName('');
    setNewItemQty(1);
  };

  return (
    <div className="p-6 text-[#106011] space-y-8 select-none relative custom-scrollbar overflow-y-auto h-[calc(100vh-80px)]">
      
      {/* Header telemetry info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#106011]/40 pb-6 relative z-10">
        <div>
          <span className="text-[9px] font-mono tracking-[0.25em] bg-[#106011]/15 px-2.5 py-1 rounded border border-[#106011]/30 uppercase font-black">
            Secured Depot Log
          </span>
          <h2 className="text-2xl font-display font-black tracking-[0.15em] uppercase text-white drop-shadow-[0_0_12px_rgba(16,96,17,0.85)] mt-2">
            Dropped System Depots
          </h2>
        </div>
        
        <div className="p-2.5 bg-black/80 border-2 border-[#106011] rounded shadow-[0_0_12px_rgba(16,96,17,0.3)] flex items-center gap-2 text-slate-300 font-mono text-[10px] uppercase font-bold">
          <Package className="w-4 h-4 text-[#106011]" />
          <span>Dropped {cargo.length} system records</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
        
        {/* Left Side: Register Cargo */}
        <div className="bg-black/95 p-6 rounded-2xl border-2 border-[#106011] shadow-[0_0_20px_rgba(16,96,17,0.3)] relative overflow-hidden h-fit">
          {/* Tactical HUD corners */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#106011] rounded-tl-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#106011] rounded-tr-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#106011] rounded-bl-xl drop-shadow-[0_0_8px_#106011]"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#106011] rounded-br-xl drop-shadow-[0_0_8px_#106011]"></div>
          
          <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none"></div>

          <div className="flex items-center gap-2 border-b border-[#106011]/30 pb-3 mb-6 relative z-10">
            <FilePlus className="w-4.5 h-4.5 text-[#106011] drop-shadow-[0_0_5px_rgba(16,96,17,0.8)] animate-pulse" />
            <span className="text-white font-display font-bold tracking-[0.16em] text-xs">Register New Product stock</span>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 relative z-10 text-slate-300 font-mono text-xs uppercase tracking-wide">
            <div className="space-y-1.5 select-text">
              <label className="text-[#106011] font-black">Product Name or "codename"</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="E.G. GPS MARKER BEACON..."
                className="w-full h-10 border-2 border-[#106011] bg-black text-[#106011] placeholder-[#106011]/45 px-3 rounded-lg focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#106011] font-black">Category Type</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="w-full h-10 border-2 border-[#106011] bg-black text-[#106011] px-3 rounded-lg focus:outline-none"
              >
                <option value="Tactical">Tactical Crate</option>
                <option value="Rations">Emergency Rations</option>
                <option value="Hardware">Hardware / Comms</option>
                <option value="GPS Tracker">GPS Trackers / Tags</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[#106011] font-black">Register Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewItemQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded border-2 border-[#106011] bg-black hover:bg-[#106011]/20 flex items-center justify-center text-[#106011] font-bold cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-white font-black text-sm px-4 select-none w-12 text-center">{newItemQty}</span>
                <button
                  type="button"
                  onClick={() => setNewItemQty(q => q + 1)}
                  className="w-10 h-10 rounded border-2 border-[#106011] bg-black hover:bg-[#106011]/20 flex items-center justify-center text-[#106011] font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 border-2 border-[#106011] rounded-xl flex items-center justify-center gap-2 font-mono text-xs font-black uppercase tracking-widest bg-black text-[#106011] hover:bg-[#106011]/20 transition-all shadow-[0_0_15px_rgba(16,96,17,0.3)] hover:shadow-[0_0_22px_rgba(16,96,17,0.6)] cursor-pointer mt-4"
            >
              <span>Add Stock Item</span>
            </button>
          </form>

        </div>

        {/* Right Side: Cargo Ledger Table & Logs */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Inventory Table */}
          <div className="bg-black/95 p-6 rounded-2xl border-2 border-[#106011] shadow-[0_0_20px_rgba(16,96,17,0.3)] relative overflow-hidden">
            {/* Tactical HUD corners */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#106011] rounded-tl-xl drop-shadow-[0_0_8px_#106011]"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#106011] rounded-tr-xl drop-shadow-[0_0_8px_#106011]"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#106011] rounded-bl-xl drop-shadow-[0_0_8px_#106011]"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#106011] rounded-br-xl drop-shadow-[0_0_8px_#106011]"></div>
            
            <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none"></div>

            <div className="border-b border-[#106011]/30 pb-3 mb-4 flex justify-between items-center relative z-10">
              <span className="tracking-[0.16em] border border-[#106f0a] h-[36px] bg-[#020302] italic font-bold no-underline text-[20px] leading-[17px] text-left font-['Times_New_Roman'] text-[#03ad29] flex items-center px-2">Nueva Ecija Drop Registry</span>
            </div>

            <div className="overflow-x-auto custom-scrollbar relative z-10 pb-2">
              <table className="w-full text-left font-mono text-xs uppercase text-slate-300">
                <thead>
                  <tr className="border-b border-[#106011]/20 text-white font-black text-[9px] tracking-wider">
                    <th className="pb-3 pl-2">CARGO ID</th>
                    <th className="pb-3">ITEM DESCRIPTION</th>
                    <th className="pb-3 text-center">QUANTITY ADJUST</th>
                    <th className="pb-3 text-right">SEC Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#106011]/15">
                  {cargo.map((c) => (
                    <tr key={c.id} className="hover:bg-[#106011]/10 transition-colors">
                      <td className="py-3 pl-2 font-bold text-white">{c.id}</td>
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{c.name}</span>
                          <span className="text-[9.5px] text-slate-400">{c.location}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleQtyAdjust(c.id, 'dec', c.name)}
                            className="w-7 h-7 rounded border border-[#106011]/60 hover:bg-[#106011]/20 hover:border-[#106011] text-[#106011] flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-white font-black w-8 text-center">{c.qty}</span>
                          <button
                            onClick={() => handleQtyAdjust(c.id, 'inc', c.name)}
                            className="w-7 h-7 rounded border border-[#106011]/60 hover:bg-[#106011]/20 hover:border-[#106011] text-[#106011] flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <span className="px-1.5 py-0.5 bg-[#106011]/15 border border-[#106011] rounded text-[9.5px] font-black">{c.security}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Logs Ledger */}
          <div className="bg-black/95 p-6 rounded-2xl border-2 border-[#106011] shadow-[0_0_15px_rgba(16,96,17,0.25)] relative overflow-hidden h-44 flex flex-col">
            <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 border-b border-[#106011]/30 pb-2.5 mb-3">
              <RefreshCw className="w-4 h-4 text-[#106011] drop-shadow-[0_0_4px_#106011]" />
              <span className="text-white font-display font-bold tracking-[0.16em] text-[10px]">INVENTORY TRACKING LEDGER</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[9px] text-[#106011] flex flex-col gap-1 pr-2">
              {logs.length === 0 ? (
                <span className="text-slate-400/50 font-medium">Ledger clear. Adjust values or register devices to generate telemetry.</span>
              ) : (
                logs.map((l, index) => (
                  <span key={index} className={index === 0 ? "text-green-400 font-bold" : "text-slate-400"}>
                    {l}
                  </span>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
