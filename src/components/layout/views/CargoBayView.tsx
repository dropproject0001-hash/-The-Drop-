import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import { useToast } from '@/components/ui/ToastContainer';
import { encryptNote, decryptNote } from '@/lib/crypto';
import { 
  Package, MapPin, Lock, Unlock, QrCode, Search, Filter, Plus, Eye,
  ChevronUp, Image, Video, Play, CornerDownRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Domain Types
interface Drop {
  id: string;
  title: string;
  lat: number;
  lng: number;
  status: 'active' | 'claimed' | 'expired';
  notes_encrypted: string | null;
  photo_url: string | null;
  video_url: string | null;
  created_at: string;
}

export default function CargoBayView() {
  const { profile } = useAuthStore();
  const { showToast } = useToast();
  
  // Local state for UI
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  const [decryptedNotes, setDecryptedNotes] = useState<Record<string, string>>({});
  
  // Create Drop Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const activeCount = drops.filter(d => d.status === 'active').length;
  const claimedCount = drops.filter(d => d.status === 'claimed').length;

  useEffect(() => {
    fetchDrops();
    
    // Real-time subscription
    const channel = supabase
      .channel('cargo-bay-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drops' }, () => {
        fetchDrops();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDrops = async () => {
    try {
      const { data, error } = await supabase
        .from('drops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrops(data || []);
    } catch (err: any) {
      console.error('Error fetching cargo:', err);
      showToast('Failed to sync cargo manifest', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    try {
      // Fetch current location for drop creation
      const pos = await new Promise<GeolocationPosition>((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true });
      });

      const encryptedNotesBody = formNotes.trim() ? await encryptNote(formNotes.trim()) : null;

      const { error } = await supabase.from('drops').insert({
        title: formTitle.trim(),
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        notes_encrypted: encryptedNotesBody,
        created_by: profile?.id,
        status: 'active'
      });

      if (error) throw error;

      showToast('New drop registered in manifest', { type: 'success' });
      setFormTitle('');
      setFormNotes('');
      setShowCreateForm(false);
      fetchDrops();
    } catch (err: any) {
      console.error('Drop creation failed:', err);
      showToast(err.message || 'Transmission failed', { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Decrypt particular notes
  const toggleNotesDecryption = async (dropId: string, encrypted: string | null) => {
    if (!encrypted) return;
    if (decryptedNotes[dropId]) {
      // already decrypted, collapse it
      const updated = { ...decryptedNotes };
      delete updated[dropId];
      setDecryptedNotes(updated);
    } else {
      const dec = await decryptNote(encrypted);
      setDecryptedNotes({ ...decryptedNotes, [dropId]: dec });
    }
  };

  const filteredDrops = drops.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-6 text-[#106011] space-y-6 select-none relative custom-scrollbar overflow-y-auto h-[calc(100vh-80px)]">
      
      {/* HUD Telemetry Top Header Banner */}
      <div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#106011]/40 p-4 pb-6 shrink-0 z-10 relative overflow-hidden rounded-2xl"
        style={{ backgroundImage: `url('/coverphoto002.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] z-[-1]" />
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,96,17,0.2)]">
            <Package className="w-6 h-6 text-[#106011]" />
          </div>
          <div>
            <h1 className="text-xl font-black font-mono tracking-tighter text-white uppercase">Cargo Bay Alpha</h1>
            <p className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase">Secure Logistics & Asset Registry</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/50 p-2 rounded-xl border border-[#106011]/20">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black">Live Inventory</span>
            <div className="flex gap-4">
              <span className="text-xs font-mono font-black text-white">{activeCount} <span className="text-zinc-500">ACTIVE</span></span>
              <span className="text-xs font-mono font-black text-white">{claimedCount} <span className="text-zinc-500">SECURED</span></span>
            </div>
          </div>
          <div className="w-px h-8 bg-[#106011]/20" />
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-[#106011] hover:bg-[#0ad111] text-black px-4 py-2 rounded-lg font-mono font-black text-[11px] uppercase tracking-tighter transition shadow-[0_0_20px_rgba(16,96,17,0.3)]"
          >
            <Plus size={16} /> New Manifest
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-center bg-zinc-950/40 p-4 rounded-2xl border border-[#106011]/15">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="SEARCH MANIFEST REGISTRY..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/60 border border-[#106011]/20 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#106011]/50 transition uppercase"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="text-zinc-500 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/60 border border-[#106011]/20 rounded-xl py-2 px-4 text-xs font-mono text-white focus:outline-none focus:border-[#106011]/50 transition uppercase appearance-none cursor-pointer"
            >
              <option value="all">ALL STATUS</option>
              <option value="active">ACTIVE OPS</option>
              <option value="claimed">CLAIMED/SECURED</option>
              <option value="expired">EXPIRED/MISSING</option>
            </select>
          </div>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-950 border-2 border-[#106011] rounded-3xl p-6 shadow-[0_0_50px_rgba(16,96,17,0.3)] font-mono">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#106011]/10 border border-[#106011]/30 flex items-center justify-center">
                    <Plus className="text-[#106011] w-4 h-4" />
                  </div>
                  <h2 className="text-white text-sm font-black uppercase tracking-widest">New Mission Manifest</h2>
                </div>
                <button onClick={() => setShowCreateForm(false)} className="text-zinc-500 hover:text-white transition">
                  <ChevronUp />
                </button>
              </div>

              <form onSubmit={handleCreateDrop} className="space-y-4">
                <div>
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1.5">Asset Identifier</label>
                  <input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="E.G. DROP-OMEGA-01"
                    className="w-full bg-black border border-[#106011]/20 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-[#106011] transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1.5">Tactical Intel (Encrypted)</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="ENTER SECURE NOTES FOR FIELD AGENT..."
                    className="w-full bg-black border border-[#106011]/20 rounded-xl py-3 px-4 text-xs text-white h-24 focus:outline-none focus:border-[#106011] transition resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 border border-zinc-800 hover:border-zinc-700 text-zinc-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formTitle.trim()}
                    className="flex-1 bg-[#106011] hover:bg-[#0ad111] text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'TRANSMITTING...' : 'Deploy Asset'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-[#106011]/20 border-t-[#106011] rounded-full animate-spin" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Syncing Encrypted Uplink...</span>
            </div>
          ) : (
            <div className="min-h-[400px]">
              {filteredDrops.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-950/20 rounded-3xl border border-dashed border-[#106011]/10">
                  <Package className="w-12 h-12 text-zinc-800 mb-4" />
                  <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">No Cargo Detected in Current Sector</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredDrops.map((drop) => {
                    const isNotesDecrypted = !!decryptedNotes[drop.id];
                    return (
                      <div 
                        key={drop.id} 
                        className="bg-black/40 border border-[#106011]/15 rounded-2xl p-5 hover:border-[#106011]/40 transition duration-300 group relative overflow-hidden flex flex-col gap-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                              drop.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-500/10 border-zinc-500/20'
                            }`}>
                              <Package className={`w-5 h-5 ${drop.status === 'active' ? 'text-emerald-500' : 'text-zinc-500'}`} />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-white font-mono uppercase tracking-tighter group-hover:text-[#0ad111] transition">{drop.title}</h3>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-zinc-500 uppercase">Sector 7-G</span>
                                <span className="text-[14px] text-zinc-800">•</span>
                                <span className="text-[9px] font-mono text-zinc-500 uppercase">{drop.id.slice(0, 8)}</span>
                              </div>
                            </div>
                          </div>

                          <span className={`px-3 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-widest border ${
                            drop.status === 'active' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                              : drop.status === 'claimed' ? 'border-blue-500/20 bg-blue-500/20 text-blue-400'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                          }`}>
                            {drop.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 border-t border-[#106011]/15 pt-3 select-text">
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
          )}
        </div>
      </div>

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
