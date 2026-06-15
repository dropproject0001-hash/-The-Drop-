import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import { QRCodeSVG } from 'qrcode.react';
import { encryptNote, decryptNote } from '@/lib/crypto';
import { useToast } from '@/components/ui/ToastContainer';
import { 
  Package, ShieldCheck, Plus, Minus, FilePlus, RefreshCw, 
  Lock, Unlock, Image, Video, MapPin, Upload, QrCode, 
  Eye, CornerDownRight, CheckCircle2, AlertTriangle, Play 
} from 'lucide-react';

interface SystemCargo {
  id: string;
  name: string;
  category: string;
  qty: number;
  location: string;
  security: string;
}

interface DBDrop {
  id: string;
  title: string;
  lat: number;
  lng: number;
  assigned_to: string | null;
  status: 'active' | 'claimed' | 'expired';
  photo_url: string | null;
  video_url: string | null;
  notes_encrypted: string | null;
  created_at: string;
}

export function CargoBayView() {
  const { profile } = useAuthStore();
  const { showToast } = useToast();
  
  // View Modes: 'depot' (original system) vs 'locker' (covert evidence vault)
  const [viewMode, setViewMode] = useState<'depot' | 'locker'>('locker');
  
  // --- STATE FOR ORIGINAL DEPOT STOCKS ---
  const [cargo, setCargo] = useState<SystemCargo[]>([
    { id: 'CRG-A01', name: 'Premium Supply Bundle', category: 'Tactical', qty: 15, location: 'Nueva Ecija Depot Area A', security: 'Level 4' },
    { id: 'CRG-B04', name: 'Secured Rations Pack', category: 'Rations', qty: 42, location: 'Nueva Ecija West S1', security: 'Level 2' },
    { id: 'CRG-C09', name: 'Emergency Transceiver Unit', category: 'Hardware', qty: 6, location: 'Cabanatuan Terminal B', security: 'Level 5' },
    { id: 'CRG-D12', name: 'Encrypted Drop Locator Tag', category: 'GPS Tracker', qty: 29, location: 'Gapan Tactical Base', security: 'Level 4' },
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Tactical');
  const [newItemQty, setNewItemQty] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);

  // --- STATE FOR SECURE COVERT LOCKER (REAL EVIDENCE) ---
  const [dbDrops, setDbDrops] = useState<DBDrop[]>([]);
  const [loadingDrops, setLoadingDrops] = useState(false);
  const [selectedDrop, setSelectedDrop] = useState<DBDrop | null>(null);
  const [decryptedNotes, setDecryptedNotes] = useState<{ [key: string]: string }>({});
  
  // Create dropdown options
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formName, setFormName] = useState('');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [formPhoto, setFormPhoto] = useState<string | null>(null);
  const [formVideo, setFormVideo] = useState<string | null>(null);
  const [formNotes, setFormNotes] = useState('');

  // Fetch real drops assigned to dropper or any drop if admin
  const fetchCovertLockerDrops = async () => {
    if (!profile) return;
    setLoadingDrops(true);
    try {
      let query = supabase.from('drops').select('*');
      
      const isUserAdmin = profile.role === 'super_admin' || profile.role === 'admin';
      
      if (!isUserAdmin) {
        // Droppers only see their own assigned or created drops
        query = query.or(`assigned_to.eq.${profile.id},created_by.eq.${profile.id}`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setDbDrops((data || []) as DBDrop[]);
    } catch (err: any) {
      console.error('[CargoBay] Error fetching real drops:', err);
      showToast('Vault decryption failed', { type: 'error' });
    } finally {
      setLoadingDrops(false);
    }
  };

  useEffect(() => {
    fetchCovertLockerDrops();
  }, [profile?.id, profile?.role]);

  // Handle Photo File Select
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // File size filter (2MB Max)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Photo size must be under 2MB', { type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormPhoto(event.target?.result as string);
      showToast('Photo evidence staged', { type: 'success' });
    };
    reader.readAsDataURL(file);
  };

  // Handle Video File Select
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // File size filter (5MB Max for PWA performance)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Video size must be under 5MB', { type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormVideo(event.target?.result as string);
      showToast('Video evidence staged', { type: 'success' });
    };
    reader.readAsDataURL(file);
  };

  // GPS pin retrieval
  const handleGPSRetrieve = () => {
    if (!navigator.geolocation) {
      showToast('PWA GPS unavailable', { type: 'error' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormLat(pos.coords.latitude.toFixed(6));
        setFormLng(pos.coords.longitude.toFixed(6));
        showToast('Precision GPS acquired', { type: 'success' });
      },
      (err) => {
        showToast('GPS lock blocked by security policy', { type: 'error' });
      }
    );
  };

  // Create real Drop from Locker Form
  const handleCreateLockerDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formLat || !formLng || !profile) return;

    setUploadLoading(true);
    try {
      const latNum = parseFloat(formLat);
      const lngNum = parseFloat(formLng);
      
      const encryptedNotesBody = formNotes.trim() ? encryptNote(formNotes.trim()) : null;

      const newDropPayload = {
        title: formName.trim().toUpperCase(),
        lat: latNum,
        lng: lngNum,
        status: 'active' as const,
        photo_url: formPhoto,
        video_url: formVideo,
        notes_encrypted: encryptedNotesBody,
        assigned_to: profile.id,
        created_by: profile.id
      };

      const { data, error } = await supabase
        .from('drops')
        .insert(newDropPayload)
        .select()
        .single();

      if (error) throw error;

      showToast('Drop evidence uploaded successfully!', { type: 'success' });
      
      // Clear form
      setFormName('');
      setFormLat('');
      setFormLng('');
      setFormPhoto(null);
      setFormVideo(null);
      setFormNotes('');
      
      // Refetch
      fetchCovertLockerDrops();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Locker upload failed', { type: 'error' });
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle Qty Adjust for original system
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

  // Original registration system
  const handleOriginalRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newID = `CRG-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(100 + Math.random() * 900)}`;
    const fresh: SystemCargo = {
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

  // Decrypt particular notes
  const toggleNotesDecryption = (dropId: string, encrypted: string | null) => {
    if (!encrypted) return;
    if (decryptedNotes[dropId]) {
      // already decrypted, collapse it
      const updated = { ...decryptedNotes };
      delete updated[dropId];
      setDecryptedNotes(updated);
    } else {
      const dec = decryptNote(encrypted);
      setDecryptedNotes({ ...decryptedNotes, [dropId]: dec });
    }
  };

  return (
    <div className="p-4 md:p-6 text-[#106011] space-y-6 select-none relative custom-scrollbar overflow-y-auto h-[calc(100vh-80px)]">
      
      {/* HUD Telemetry Top Header Banner */}
      <div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#106011]/40 p-4 pb-6 shrink-0 z-10 relative overflow-hidden rounded-2xl"
        style={{ backgroundImage: `url('/coverphoto002.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/85 z-0 pointer-events-none" />
        
        <div className="relative z-10">
          <span className="text-[9px] font-mono tracking-[0.25em] bg-[#106011]/20 text-[#0ad111] px-2.5 py-1 rounded border border-[#106011]/40 uppercase font-black">
            STATION VAULT DEPOT
          </span>
          <h2 className="text-2xl font-display font-black tracking-[0.15em] uppercase text-white drop-shadow-[0_0_12px_rgba(16,96,17,0.85)] mt-2">
            LOCKER DRAWER
          </h2>
        </div>
        
        {/* Toggle Mode View Selector Buttons */}
        <div className="flex gap-2.5 relative z-10">
          <button
            onClick={() => setViewMode('locker')}
            className={`px-4 py-2 font-mono text-[10px] uppercase font-bold tracking-widest rounded-lg border-2 transition-all ${
              viewMode === 'locker' 
                ? 'border-[#0ad111] bg-[#106011]/25 text-white shadow-[0_0_12px_rgba(10,209,17,0.45)]' 
                : 'border-zinc-800 bg-black/85 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            🔒 Covert Locker
          </button>
          <button
            onClick={() => setViewMode('depot')}
            className={`px-4 py-2 font-mono text-[10px] uppercase font-bold tracking-widest rounded-lg border-2 transition-all ${
              viewMode === 'depot' 
                ? 'border-[#0ad111] bg-[#106011]/25 text-white shadow-[0_0_12px_rgba(10,209,17,0.45)]' 
                : 'border-zinc-800 bg-black/85 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            📦 Depot Stocks
          </button>
        </div>
      </div>

      {viewMode === 'depot' ? (
        // --- VIEW 1: ORIGINAL DEPOT LOGS ---
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
          {/* Left Side: Register Cargo */}
          <div className="bg-black/95 p-6 rounded-2xl border-2 border-[#106011] shadow-[0_0_20px_rgba(16,96,17,0.3)] relative overflow-hidden h-fit">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#106011] rounded-tl-xl drop-shadow-[0_0_8px_#106011]"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#106011] rounded-tr-xl drop-shadow-[0_0_8px_#106011]"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#106011] rounded-bl-xl drop-shadow-[0_0_8px_#106011]"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#106011] rounded-br-xl drop-shadow-[0_0_8px_#106011]"></div>
            <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none"></div>

            <div className="flex items-center gap-2 border-b border-[#106011]/30 pb-3 mb-6 relative z-10">
              <FilePlus className="w-4.5 h-4.5 text-[#106011] drop-shadow-[0_0_5px_rgba(16,96,17,0.8)] animate-pulse" />
              <span className="text-white font-display font-bold tracking-[0.16em] text-xs">Register Depot stock</span>
            </div>

            <form onSubmit={handleOriginalRegister} className="space-y-4 relative z-10 text-slate-300 font-mono text-xs uppercase tracking-wide">
              <div className="space-y-1.5 select-text">
                <label className="text-[#106011] font-black">Codename / item description</label>
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

          {/* Right Side: Depot ledger and logs table */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-black/95 p-6 rounded-2xl border-2 border-[#106011] shadow-[0_0_20px_rgba(16,96,17,0.3)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#106011] rounded-tl-xl drop-shadow-[0_0_8px_#106011]"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#106011] rounded-tr-xl drop-shadow-[0_0_8px_#106011]"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#106011] rounded-bl-xl drop-shadow-[0_0_8px_#106011]"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#106011] rounded-br-xl drop-shadow-[0_0_8px_#106011]"></div>
              <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none"></div>

              <div className="border-b border-[#106011]/30 pb-3 mb-4 relative z-10">
                <span className="text-white font-mono tracking-widest text-xs font-black uppercase">Depot Operations Registry</span>
              </div>

              <div className="overflow-x-auto custom-scrollbar relative z-10">
                <table className="w-full text-left font-mono text-xs uppercase text-slate-300">
                  <thead>
                    <tr className="border-b border-[#106011]/20 text-[#0ad111] font-black text-[9px] tracking-wider">
                      <th className="pb-3 pl-2">CARGO ID</th>
                      <th className="pb-3">ITEM DESCRIPTION</th>
                      <th className="pb-3 text-center">QUANTITY</th>
                      <th className="pb-3 text-right">SEC LEVEL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#106011]/15">
                    {cargo.map((c) => (
                      <tr key={c.id} className="hover:bg-[#106011]/10 transition-colors">
                        <td className="py-3 pl-2 font-bold text-white">{c.id}</td>
                        <td className="py-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-white">{c.name}</span>
                            <span className="text-[9.5px] text-zinc-400">{c.location}</span>
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

            {/* Logs info */}
            <div className="bg-black/95 p-5 rounded-2xl border-2 border-[#106011] relative overflow-hidden h-40">
              <div className="absolute inset-1 border border-dashed border-[#106011]/30 pointer-events-none rounded-xl"></div>
              <div className="flex items-center gap-2 border-b border-[#106011]/30 pb-2 mb-3 font-mono text-[10px] text-white">
                <RefreshCw className="w-4 h-4 text-[#106011]" />
                <span>LEDGER TELEMETRY</span>
              </div>
              <div className="overflow-y-auto custom-scrollbar h-20 font-mono text-[9px] text-[#106011] space-y-1">
                {logs.length === 0 ? (
                  <span className="text-zinc-500">Wait state. Adjust sliders or register codenames to capture logs.</span>
                ) : (
                  logs.map((l, idx) => (
                    <div key={idx} className={idx === 0 ? "text-green-400 font-bold" : "text-zinc-400"}>{l}</div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // --- VIEW 2: COVERT LOCKER (REAL DROP EVIDENCE / EXCLUSIVE DRAWER) ---
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          {/* Section A (Cols 1-5): Dropper upload entry / deposit form */}
          <div className="lg:col-span-5 bg-black/95 p-6 rounded-2xl border-2 border-[#106011] shadow-[0_0_25px_rgba(16,96,17,0.3)] relative overflow-hidden h-fit">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#106011] rounded-tl-xl drop-shadow-[0_0_8px_#106011]"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#106011] rounded-tr-xl drop-shadow-[0_0_8px_#106011]"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#106011] rounded-bl-xl drop-shadow-[0_0_8px_#106011]"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#106011] rounded-br-xl drop-shadow-[0_0_8px_#106011]"></div>
            <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none"></div>

            <div className="flex items-center gap-2.5 border-b border-[#106011]/30 pb-3 mb-5 relative z-10">
              <Upload className="w-5 h-5 text-[#0ad111] animate-pulse" />
              <span className="text-white font-display font-bold tracking-[0.16em] uppercase text-xs">Stage Drop Evidence</span>
            </div>

            <p className="text-[10px] font-mono leading-relaxed uppercase space-y-1 text-zinc-400 mb-5 border-b border-[#106011]/10 pb-3">
              📵 <span className="text-red-500 font-bold">OPERATIONAL DIRECTIVE:</span> ONLY exclusive for SuperAdmin/admin and Droppers. Store product QR tokens, GPS pins, and verification media files immediately upon drop completion.
            </p>

            <form onSubmit={handleCreateLockerDrop} className="space-y-4 relative z-10 text-slate-300 font-mono text-xs uppercase tracking-wide">
              {/* Product description / title */}
              <div className="space-y-1">
                <label className="text-[#106011] font-black">Coded Product Title / Identifier</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="E.G. GOLD COIN DEPOSIT ZONE..."
                  className="w-full h-11 border-2 border-[#106011]/80 hover:border-[#106011] bg-black text-[#106011] font-bold placeholder-[#106011]/45 px-3 rounded-xl focus:outline-none"
                />
              </div>

              {/* Coordinates block with custom GPS retrieval button */}
              <div className="grid grid-cols-2 gap-3.5 relative">
                <div className="space-y-1">
                  <label className="text-[#106011] font-black">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    placeholder="15.486500"
                    className="w-full h-11 border-2 border-[#106011]/80 bg-black text-[#106011] px-3 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#106011] font-black">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    placeholder="120.973400"
                    className="w-full h-11 border-2 border-[#106011]/80 bg-black text-[#106011] px-3 rounded-xl focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGPSRetrieve}
                  className="absolute right-2 -top-5 text-[8px] bg-[#106011]/30 hover:bg-[#106011] border border-[#106011] text-[#0ad111] hover:text-black font-black px-2 py-0.5 rounded transition duration-200"
                >
                  📡 GPS Acquire
                </button>
              </div>

              {/* Photo Upload Attachment Slot (Reads as base64) */}
              <div className="space-y-1 border border-dashed border-[#106011]/30 p-2.5 rounded-xl bg-[#106011]/5">
                <div className="flex justify-between items-center text-[#106011]">
                  <span className="font-black flex items-center gap-1.5"><Image className="w-3.5 h-3.5" /> High-Res Photo Attachment</span>
                  {formPhoto && <span className="text-green-500 font-black text-[9px] animate-pulse">📷 STAGED</span>}
                </div>
                <label className="flex flex-col items-center justify-center p-3.5 bg-black border border-[#106011]/50 hover:border-[#106011] rounded-xl cursor-pointer transition relative overflow-hidden group">
                  <span className="text-[10px] text-zinc-400 group-hover:text-white transition uppercase">Choose Photo / Capture Evidence</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                </label>
                {formPhoto && (
                  <div className="mt-2 text-center rounded border border-[#106011]/30 overflow-hidden max-h-[140px] bg-black">
                    <img src={formPhoto} alt="Evidence Preview" className="w-auto h-28 mx-auto object-contain" />
                  </div>
                )}
              </div>

              {/* Short Video Upload Slot */}
              <div className="space-y-1 border border-dashed border-[#106011]/30 p-2.5 rounded-xl bg-[#106011]/5">
                <div className="flex justify-between items-center text-[#106011]">
                  <span className="font-black flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Short Video Evidence</span>
                  {formVideo && <span className="text-green-500 font-black text-[9px] animate-pulse">📹 STAGED</span>}
                </div>
                <label className="flex flex-col items-center justify-center p-3.5 bg-black border border-[#106011]/50 hover:border-[#106011] rounded-xl cursor-pointer transition relative overflow-hidden group">
                  <span className="text-[10px] text-zinc-400 group-hover:text-white transition uppercase">Choose Clip / Capture Video</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoSelect}
                  />
                </label>
                {formVideo && (
                  <div className="mt-2 p-2 rounded bg-black border border-[#106011]/20 text-[9.5px] text-slate-300 flex items-center justify-center gap-2">
                    <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate max-w-[150px]">Clip staged (Ready for upload)</span>
                  </div>
                )}
              </div>

              {/* Secure Notes - encrypted via AES on insert */}
              <div className="space-y-1">
                <label className="text-[#106011] font-black tracking-widest flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-[#106011]" /> Encrypted field notes (Symmetric AES)</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="EXPLAIN PRECISE CORNER LOCATION OR PICKUP CODE..."
                  className="w-full text-[11px] bg-black border-2 border-[#106011]/80 hover:border-[#106011] text-[#106011] placeholder-[#106011]/45 p-3 rounded-xl focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full h-12 bg-[#0ad111] text-black hover:bg-emerald-500 flex items-center justify-center gap-2 font-mono text-xs font-black uppercase tracking-widest rounded-xl transition duration-300 shadow-[0_0_20px_rgba(10,209,17,0.3)] disabled:opacity-50 cursor-pointer mt-5"
              >
                <span>{uploadLoading ? 'UPLOADING...' : '🔒 DEPOSIT TO EXCLUSIVE VAULT'}</span>
              </button>
            </form>
          </div>

          {/* Section B (Cols 6-12): Covert Lockers / Real Drop Evidence Cards List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-black/95 p-6 rounded-2xl border-2 border-[#106011] shadow-[0_0_25px_rgba(16,96,17,0.3)] relative overflow-hidden h-[calc(100vh-270px)] overflow-y-auto custom-scrollbar">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#106011] rounded-tl-xl drop-shadow-[0_0_8px_#106011]"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#106011] rounded-tr-xl drop-shadow-[0_0_8px_#106011]"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#106011] rounded-bl-xl drop-shadow-[0_0_8px_#106011]"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#106011] rounded-br-xl drop-shadow-[0_0_8px_#106011]"></div>
              <div className="absolute inset-1 border border-dashed border-[#106011]/30 rounded-xl pointer-events-none"></div>

              <div className="border-b border-[#106011]/30 pb-4 mb-5 flex justify-between items-center relative z-10 select-text">
                <span className="text-white font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  📁 Covert Storage Ledger ({dbDrops.length} deposited payloads)
                </span>
                
                <button
                  onClick={fetchCovertLockerDrops}
                  disabled={loadingDrops}
                  className="text-[9px] bg-black/80 hover:bg-[#106011]/20 border border-[#106011] hover:border-[#0ad111] text-white px-3 py-1.5 rounded font-mono uppercase tracking-widest transition duration-300 disabled:opacity-40"
                >
                  {loadingDrops ? 'REFRESHING...' : 'REFRESH'}
                </button>
              </div>

              {loadingDrops && dbDrops.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#106011] font-mono text-xs uppercase tracking-widest animate-pulse">
                  Decrypting operational ledger streams...
                </div>
              ) : dbDrops.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                  <AlertTriangle className="w-10 h-10 text-yellow-500 opacity-60 animate-bounce" />
                  <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest leading-relaxed">
                    Operative locker is currently empty.<br/>Submit coordinate packages using the deposit terminal.
                  </p>
                </div>
              ) : (
                <div className="space-y-5 relative z-10 pb-4">
                  {dbDrops.map((drop) => {
                    const isNotesDecrypted = !!decryptedNotes[drop.id];
                    return (
                      <div 
                        key={drop.id} 
                        className="bg-black/95 p-4 rounded-xl border border-[#106011]/50 hover:border-[#106011] transition duration-300 space-y-3 relative overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                      >
                        {/* Upper Header strip */}
                        <div className="flex justify-between items-start select-text mb-1">
                          <div>
                            <div className="text-[9px] font-mono text-slate-500 font-bold">PAYLOAD ID: {drop.id.toUpperCase()}</div>
                            <h3 className="text-white font-sans font-black tracking-wide text-sm mt-0.5">{drop.title}</h3>
                          </div>
                          
                          <span className={`px-2.5 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-widest border font-black ${
                            drop.status === 'active' 
                              ? 'border-emerald-500 bg-emerald-950/20 text-[#0ad111] shadow-[0_0_8px_rgba(16,96,17,0.3)]' 
                              : drop.status === 'claimed'
                              ? 'border-blue-600 bg-blue-950/20 text-blue-400' 
                              : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                          }`}>
                            {drop.status}
                          </span>
                        </div>

                        {/* Middle details panel: GPS and attachments presence */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 border-t border-[#106011]/15 pt-3 select-text">
                          {/* Left Details: GPS coordinate stats */}
                          <div className="sm:col-span-8 flex flex-col gap-1.5 text-[10px] font-mono text-zinc-400">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#106011] shrink-0" />
                              <span>COORDS: <span className="text-[#0ad111] font-black">{drop.lat.toFixed(6)}, {drop.lng.toFixed(6)}</span></span>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <Image className="w-3.5 h-3.5 text-[#106011] shrink-0" />
                              <span>PHOTO EVIDENCE: {drop.photo_url ? <span className="text-green-500 font-extrabold">DEPOSITED ✔</span> : <span className="text-zinc-600">NONE</span>}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Video className="w-3.5 h-3.5 text-[#106011] shrink-0" />
                              <span>VIDEO EVIDENCE: {drop.video_url ? <span className="text-green-500 font-extrabold">DEPOSITED ✔</span> : <span className="text-zinc-600">NONE</span>}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-[#106011] shrink-0" />
                              <span>NOTES ENCRYPTION: SHA-256 AES CRTP</span>
                            </div>

                            <div className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mt-1">
                              TIMESTAMP: {new Date(drop.created_at).toLocaleString()}
                            </div>
                          </div>

                          {/* Right Details: Custom QR Code view block for secure operations */}
                          <div className="sm:col-span-4 flex flex-col items-center justify-center border-l sm:border-l border-dashed border-[#106011]/25 pl-0 sm:pl-3 pt-3 sm:pt-0">
                            <div className="bg-white p-1 rounded-md shrink-0 shadow-md">
                              <QRCodeSVG 
                                value={JSON.stringify({ dropId: drop.id, title: drop.title, token: drop.id })} 
                                size={70} 
                              />
                            </div>
                            <span className="text-[7.5px] font-mono font-black text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-1"><QrCode size={10} /> QR GENERATED</span>
                          </div>
                        </div>

                        {/* Evidence Media Preview Segment details if attachments exist */}
                        {(drop.photo_url || drop.video_url) && (
                          <div className="flex flex-wrap gap-4 border-t border-[#106011]/10 pt-3">
                            {drop.photo_url && (
                              <div className="flex-1 min-w-[120px] rounded border border-[#106011]/20 bg-black/90 p-1.5 relative group">
                                <span className="absolute top-1 left-2 text-[7px] font-mono font-black text-white bg-black/70 px-1 py-0.5 rounded tracking-widest">PHOTO EVIDENCE</span>
                                <img 
                                  src={drop.photo_url} 
                                  alt="Drop Evidence" 
                                  className="w-full h-24 object-contain rounded hover:scale-102 transition duration-200 cursor-zoom-in" 
                                  onClick={() => setSelectedDrop(drop)}
                                />
                              </div>
                            )}

                            {drop.video_url && (
                              <div className="flex-1 min-w-[120px] rounded border border-[#106011]/20 bg-black/90 p-1.5 relative flex flex-col justify-center items-center">
                                <span className="absolute top-1 left-2 text-[7px] font-mono font-black text-white bg-black/70 px-1 py-0.5 rounded tracking-widest">VIDEO CLINIC</span>
                                <div className="w-full h-24 flex flex-col justify-center items-center gap-1 cursor-pointer hover:bg-zinc-950/60 transition" onClick={() => setSelectedDrop(drop)}>
                                  <div className="w-10 h-10 rounded-full border-2 border-green-500 flex items-center justify-center bg-green-500/10">
                                    <Play className="w-4.5 h-4.5 text-green-500 fill-current ml-0.5" />
                                  </div>
                                  <span className="text-[8.5px] font-mono text-zinc-400 font-black uppercase tracking-widest">Stream Playback</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Expandable Encrypted field notes area */}
                        {drop.notes_encrypted && (
                          <div className="border-t border-[#106011]/10 pt-3 pb-1 select-text">
                            <div className="flex justify-between items-center text-[10px] uppercase font-mono font-black mb-1.5 text-zinc-400">
                              <span className="flex items-center gap-1">
                                {isNotesDecrypted ? <Unlock size={11} className="text-[#0ad111]" /> : <Lock size={11} className="text-red-500" />}
                                Operative Notes
                              </span>
                              <button
                                onClick={() => toggleNotesDecryption(drop.id, drop.notes_encrypted)}
                                className={`px-2 py-0.5 rounded text-[8px] bg-black border transition ${
                                  isNotesDecrypted 
                                    ? 'border-red-800 text-red-500 hover:bg-red-950/20' 
                                    : 'border-[#106011]/80 hover:border-[#106011] text-[#0ad111] hover:bg-[#106011]/10'
                                }`}
                              >
                                {isNotesDecrypted ? 'LOCK VAULT' : 'DECRYPT MESSAGE'}
                              </button>
                            </div>

                            {isNotesDecrypted ? (
                              <div className="p-2.5 rounded bg-[#106011]/5 border border-[#106011]/30 font-sans text-[11px] text-[#0ad111] leading-relaxed break-words shadow-inner">
                                <CornerDownRight className="w-3.5 h-3.5 text-[#106011] inline mr-1 -mt-1" />
                                {decryptedNotes[drop.id]}
                              </div>
                            ) : (
                              <div className="p-2.5 rounded bg-zinc-950/90 border border-zinc-800/80 font-mono text-[9px] text-[#106011]/60 leading-none tracking-wider select-none break-all">
                                {drop.notes_encrypted.slice(0, 80)}... [AES ENCRYPTED VAULT PAYLOAD]
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
        </div>
      )}

      {/* Media Inspection Lightbox Modal popup */}
      {selectedDrop && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="max-w-xl w-full bg-zinc-950 border-2 border-green-500 rounded-2xl p-6 relative overflow-hidden font-mono shadow-[0_0_50px_rgba(16,96,17,0.4)] text-[#106011]">
            <button 
              onClick={() => setSelectedDrop(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-lg bg-zinc-900 border border-zinc-800"
            >
              <Eye size={16} /> Close
            </button>
            <h3 className="text-white text-sm font-bold uppercase mb-4 tracking-widest">{selectedDrop.title} - Close Analysis</h3>
            
            <div className="rounded-xl border border-[#106011]/40 bg-black flex lg:h-[350px] items-center justify-center overflow-hidden">
              {selectedDrop.photo_url && !selectedDrop.video_url && (
                <img src={selectedDrop.photo_url} alt="Inspected Detail" className="w-full h-full object-contain" />
              )}
              {selectedDrop.video_url && (
                <video src={selectedDrop.video_url} controls className="w-full h-full object-contain bg-black" autoPlay />
              )}
              {!selectedDrop.photo_url && !selectedDrop.video_url && (
                <span className="text-zinc-600 text-xs">NO EVIDENCE DATA SOURCE REGISTERED</span>
              )}
            </div>

            <div className="text-[10px] text-zinc-400 space-y-1 mt-4 border-t border-[#106011]/15 pt-3 uppercase font-black">
              <div>TARGET ID: {selectedDrop.id}</div>
              <div>PRECISION SITE: {selectedDrop.lat}, {selectedDrop.lng}</div>
              <div>LOG TIME: {new Date(selectedDrop.created_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
