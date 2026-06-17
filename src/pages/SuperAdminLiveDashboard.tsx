import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useLiveDrops } from '../hooks/realtime/useLiveDrops';
import { useLiveLocations, type LiveLocation } from '../hooks/realtime/useLiveLocations';
import { MapContainer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { CachedTileLayer } from '@/components/map/CachedTileLayer';
import L from 'leaflet';
import type { Drop, Profile } from '../types/domain';
import { useToast } from '@/components/ui/ToastContainer';
import { supabase } from '@/lib/supabase';
import { 
  Radio, 
  Activity, 
  MapPin, 
  Trash2, 
  Edit3, 
  Cpu, 
  Layers, 
  Wifi, 
  Compass, 
  Send, 
  Crosshair, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Clock, 
  Search, 
  Filter, 
  Copy,
  ChevronRight,
  Monitor,
  Terminal,
  Shield,
  User,
  X,
  Navigation
} from 'lucide-react';

// Leaflet default icon fix (same as DropMap)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// MapFocus component to programmatically fly to centered coordinates
function MapFocus({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

// Custom drop pin markers
const createDropIcon = (status: string, title: string) => L.divIcon({
  className: 'custom-drop-icon outline-none border-none border-0',
  html: `
    <div class="relative group cursor-pointer flex items-center justify-center w-10 h-10 -mt-5 -ml-5">
      <div class="text-3xl filter hover:scale-125 transition-transform drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] ${status === 'active' ? 'animate-bounce' : ''}">
        ${status === 'active' ? '📍' : status === 'claimed' ? '📦' : '❌'}
      </div>
      <div class="absolute -bottom-1 w-4 h-1 bg-black/60 blur-[2px] rounded-[100%]"></div>
      
      <!-- Label hover tooltip -->
      <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 bg-black/90 text-[8px] font-mono font-black text-[#0ad111] border border-[#106011] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest z-50">
        ${title} (${status})
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Custom live agent tracker icon
const createAgentIcon = (username: string) => L.divIcon({
  className: 'custom-agent-icon outline-none border-none border-0',
  html: `
    <div class="relative flex items-center justify-center w-12 h-12 -mt-6 -ml-6 group">
      <div class="absolute inset-0 bg-red-600/30 rounded-full animate-ping"></div>
      <div class="relative w-8 h-8 rounded-full border-2 border-red-500 bg-black flex items-center justify-center text-white text-[12px] font-mono font-black shadow-[0_0_12px_rgba(239,68,68,0.8)]">
        🕵️
      </div>
      <div class="absolute -bottom-5 bg-black/95 px-1.5 py-0.5 border border-red-900 rounded text-[7px] font-mono text-red-400 uppercase tracking-widest truncate max-w-[80px] pointer-events-none">
        ${username}
      </div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

const NUEVA_ECIJA_CENTER: [number, number] = [15.4865, 120.9734];

export default function SuperAdminLiveDashboard() {
  const { showToast } = useToast();
  
  // Realtime hook data
  const { drops, error: dropsError, loading: dropsLoading, refresh: refreshDrops, updateDropStatus } = useLiveDrops();
  const { locations, getLatestForUser, allLocations, error: locationsError, status: locStatus, refresh: refreshLocations } = useLiveLocations();
  
  // Profile mapper state
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);

  // Filter & selections
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'claimed' | 'expired'>('all');
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  
  // Map manipulation values
  const [mapCenter, setMapCenter] = useState<[number, number]>(NUEVA_ECIJA_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite' | 'tactical'>('tactical');
  const [orientationMode, setOrientationMode] = useState<'none' | 'portrait' | 'landscape'>('none');
  
  // Search state for floating panel
  const [searchQuery, setSearchQuery] = useState('');
  const [showPanel, setShowPanel] = useState(true);
  
  // Create drop modal
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDropTitle, setNewDropTitle] = useState('');
  const [newDropLat, setNewDropLat] = useState('');
  const [newDropLng, setNewDropLng] = useState('');
  const [newDropAssignee, setNewDropAssignee] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Edit fields for selected drop
  const [editTitle, setEditTitle] = useState('');
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');
  const [editStatus, setEditStatus] = useState<Drop['status']>('active');
  const [editAssignee, setEditAssignee] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Simulation controls
  const [simUserId, setSimUserId] = useState('');
  const [simLat, setSimLat] = useState('15.4865');
  const [simLng, setSimLng] = useState('120.9734');
  const [simLoading, setSimLoading] = useState(false);

  // Terminal logging & autoscroll
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [termLogs, setTermLogs] = useState<{ id: string; time: string; msg: string; type: 'info' | 'ping' | 'success' | 'warn' }[]>([]);

  // Push new lines into the scrolling console log
  const pushLog = useCallback((msg: string, type: 'info' | 'ping' | 'success' | 'warn' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setTermLogs(prev => [...prev.slice(-49), { id: Math.random().toString(), time, msg, type }]);
  }, []);

  // Fetch profiles helper
  const fetchProfiles = useCallback(async () => {
    try {
      setProfilesLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true });
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setProfilesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
    pushLog("Central SatCom uplink initialized.", "success");
    pushLog("Listening for secure WebSocket location broadcasts...", "info");
  }, [fetchProfiles, pushLog]);

  // Log incoming locations change
  useEffect(() => {
    if (allLocations.length > 0) {
      const topPing = allLocations[0];
      const agentProfile = profiles.find(p => p.id === topPing.user_id);
      const alias = agentProfile?.alias || agentProfile?.username || topPing.user_id.slice(0, 8);
      pushLog(`GPS_PING: ${alias} lat=${topPing.lat.toFixed(5)} lng=${topPing.lng.toFixed(5)} acc=±${Math.round(topPing.accuracy || 0)}m`, "ping");
    }
  }, [allLocations, profiles, pushLog]);

  // Profiles mapping tools
  const getProfileName = useCallback((userId: string | null) => {
    if (!userId) return 'Unassigned';
    const found = profiles.find(p => p.id === userId);
    if (!found) return `@${userId.slice(0, 8)}`;
    return `@${found.username || found.alias || found.role}`;
  }, [profiles]);

  // Sync edits when selected drop changes
  useEffect(() => {
    if (selectedDrop) {
      setEditTitle(selectedDrop.title || '');
      setEditLat(selectedDrop.lat.toString());
      setEditLng(selectedDrop.lng.toString());
      setEditStatus(selectedDrop.status);
      setEditAssignee(selectedDrop.assigned_to || '');
    }
  }, [selectedDrop]);

  // Auto-scroll terminal logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [termLogs]);

  // Filter drops list
  const filteredDrops = useMemo(() => {
    return drops.filter(d => {
      const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            getProfileName(d.assigned_to).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drops, searchTerm, statusFilter, getProfileName]);

  // Live agents mapper
  const liveAgents = useMemo(() => 
    Object.keys(locations).map(uid => ({
      userId: uid,
      latest: getLatestForUser(uid),
      profile: profiles.find(p => p.id === uid)
    })).filter(a => a.latest),
  [locations, getLatestForUser, profiles]);

  // Map filtered variants (MUST be after liveAgents)
  const mapFilteredDrops = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return drops.filter(d => 
      d.title.toLowerCase().includes(q) || 
      d.id.toLowerCase().includes(q)
    );
  }, [drops, searchQuery]);

  const mapFilteredLiveAgents = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return liveAgents.filter(a => {
      const aliasName = a.profile?.username || a.profile?.alias || `AGENT_${a.userId.slice(0, 5)}`;
      return aliasName.toLowerCase().includes(q) || a.userId.toLowerCase().includes(q);
    });
  }, [liveAgents, searchQuery]);

  // Trails mapper

  const userTrails = useMemo(() => {
    const trails: Record<string, [number, number][]> = {};
    Object.entries(locations).forEach(([userId, locs]) => {
      trails[userId] = locs
        .slice(0, 10)
        .map(l => [l.lat, l.lng] as [number, number])
        .reverse();
    });
    return trails;
  }, [locations]);

  // Focus map coordinates on element
  const handleFocusOnMap = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setMapZoom(16);
    pushLog(`Visual frame locked on coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`, "info");
  };

  // Create Drop PIN
  const handleCreateDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDropTitle.trim() || !newDropLat || !newDropLng) {
      showToast('All primary coordinates and parameters required.', { type: 'error' });
      return;
    }

    setCreateLoading(true);
    try {
      const latVal = parseFloat(newDropLat);
      const lngVal = parseFloat(newDropLng);
      
      const { data, error } = await supabase
        .from('drops')
        .insert({
          title: newDropTitle.trim(),
          lat: latVal,
          lng: lngVal,
          assigned_to: newDropAssignee || null,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      showToast(`Drop initialized: ${data.title}`, { type: 'success' });
      pushLog(`NEW_DROP: "${data.title}" deployed of id=${data.id.slice(0, 8)}`, "success");
      
      // Cleanup
      setNewDropTitle('');
      setNewDropLat('');
      setNewDropLng('');
      setNewDropAssignee('');
      setShowCreateForm(false);
      
      // Select newly made pin
      setSelectedDrop(data);
      handleFocusOnMap(latVal, lngVal);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error occurred initializing drop', { type: 'error' });
    } finally {
      setCreateLoading(false);
    }
  };

  // Update Drop State (inline modify)
  const handleUpdateDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrop) return;

    setUpdateLoading(true);
    try {
      const latVal = parseFloat(editLat);
      const lngVal = parseFloat(editLng);

      const { data, error } = await supabase
        .from('drops')
        .update({
          title: editTitle.trim(),
          lat: latVal,
          lng: lngVal,
          status: editStatus,
          assigned_to: editAssignee || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedDrop.id)
        .select()
        .single();

      if (error) throw error;

      showToast('Drop metadata pins updated', { type: 'success' });
      pushLog(`UPDATE_DROP: "${data.title}" updated successfully. Status="${data.status}"`, "info");
      
      // Update selected
      setSelectedDrop(data);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error updating drop pins', { type: 'error' });
    } finally {
      setUpdateLoading(false);
    }
  };

  // Delete Drop (Burn Pin)
  const handleDeleteDrop = async () => {
    if (!selectedDrop) return;
    if (!window.confirm(`Warning: Completely delete drop "${selectedDrop.title}" from servers? This is an irreversible admin purge.`)) {
      return;
    }

    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('drops')
        .delete()
        .eq('id', selectedDrop.id);

      if (error) throw error;

      showToast('Drop purged successfully', { type: 'success' });
      pushLog(`BURN_PAYLOAD: Drop "${selectedDrop.title}" completely offline-purged.`, "warn");
      setSelectedDrop(null);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Purge action rejected.', { type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Geolocation grab for creator
  const getCoordinatesFromBrowser = (target: 'create' | 'edit') => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported', { type: 'error' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (target === 'create') {
          setNewDropLat(pos.coords.latitude.toString());
          setNewDropLng(pos.coords.longitude.toString());
        } else {
          setEditLat(pos.coords.latitude.toString());
          setEditLng(pos.coords.longitude.toString());
        }
        showToast('Telemetry loaded from physical GPS sensor', { type: 'success' });
      },
      () => {
        showToast('Unable to secure location feed', { type: 'error' });
      }
    );
  };

  // Simulating Live GPS Broadcaster
  const handleSimulateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simUserId) {
      showToast('Select an agent node to bind signal broadcast representation', { type: 'error' });
      return;
    }

    setSimLoading(true);
    try {
      const latVal = parseFloat(simLat);
      const lngVal = parseFloat(simLng);

      const { error } = await supabase
        .from('locations')
        .insert({
          user_id: simUserId,
          lat: latVal,
          lng: lngVal,
          accuracy: 8,
          heading: Math.floor(Math.random() * 360),
          speed: 6.5,
          altitude: 120,
          recorded_at: new Date().toISOString()
        });

      if (error) throw error;

      showToast('Telemetry injection broadcast complete', { type: 'success' });
      pushLog(`SIG_INJECT: Simulated ping generated successfully for user_id=${simUserId.slice(0, 8)}`, "success");
      
      // Update map focus smoothly
      setMapCenter([latVal, lngVal]);
      setMapZoom(15);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed telemetry injection', { type: 'error' });
    } finally {
      setSimLoading(false);
    }
  };

  // Get agent status tags
  const getAgentList = () => {
    return profiles.filter(p => ['dropper', 'admin', 'super_admin'].includes(p.role || ''));
  };

  return (
    <div className="p-6 text-white min-h-screen bg-black select-none gap-6 flex flex-col relative overflow-hidden">
      
      {/* Decorative Technical Grid Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 96, 17, 0.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 96, 17, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Header telemetry blocks */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#106011]/40 pb-5 z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-emerald-500 animate-pulse drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
            <h1 className="text-3xl font-black font-display tracking-[0.16em] text-[#0ad111] uppercase drop-shadow-[0_0_12px_rgba(10,209,17,0.5)]">
              GODS EYE OPERATIONS CENTER
            </h1>
          </div>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest pl-7">
            Root Terminal • Real-Time Satellite Drone Tracking &amp; Drop Control Grid
          </p>
        </div>
        
        {/* Connection status pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-black/80 border border-[#106011]/50 px-4 py-2 rounded-xl flex items-center gap-2.5 shadow-[inset_0_0_10px_rgba(16,96,17,0.15)] font-mono text-[10px]">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[#0ad111] uppercase tracking-wider font-bold">
              SYS_LINK: {locStatus.mode === 'realtime' ? 'REALTIME_WEBSOCKET' : 'FALLBACK_POLLING'}
            </span>
          </div>

          <button 
            onClick={() => {
              refreshDrops();
              refreshLocations();
              fetchProfiles();
              pushLog("Force central database re-sync triggered.", "info");
              showToast('HQ Data feeds synchronized.', { type: 'success' });
            }}
            className="flex items-center gap-2 bg-[#106011]/15 hover:bg-[#106011]/30 border border-[#106011]/60 px-3 py-2 rounded-xl transition font-mono text-[10px] uppercase font-bold tracking-wider"
          >
            <RefreshCw size={12} className="text-[#0ad111]" /> Sync HQ
          </button>

          <button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-[#0ad111] hover:bg-[#0ad111]/85 text-black font-mono font-black text-[10px] px-4 py-2 rounded-xl transition uppercase tracking-wider"
          >
            <Plus size={14} className="stroke-[3]" /> Deploy Pin
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 z-10 flex-1 min-h-[80vh]">
        
        {/* Map column (Satelite UAV HUD view) */}
        <div className="xl:col-span-6 flex flex-col gap-4">
          <div className="bg-zinc-950 border border-[#106011]/50 shadow-[0_0_15px_rgba(16,96,17,0.2)] rounded-2xl overflow-hidden relative flex-1 min-h-[420px] flex flex-col">
            
            {/* HUD Overlay graphics */}
            <div className="absolute top-4 left-4 z-[400] hidden sm:flex items-center gap-2">
              <div className="bg-black/90 border border-[#106011] px-3 py-1.5 rounded-lg text-[9px] font-mono text-[#106011] font-bold uppercase tracking-[0.2em] flex items-center gap-2 shadow-[0_0_10px_rgba(16,96,17,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                LIVE_SAT_UAV FEED (Nueva Ecija)
              </div>
              <div className="bg-black/90 border border-[#106011]/80 px-3 py-1.5 rounded-lg text-[9px] font-mono text-[#0ad111] font-bold uppercase tracking-[0.2em] shadow-[0_0_10px_rgba(16,96,17,0.2)]">
                GRID: {drops.length} DETECTED
              </div>
            </div>

            {/* Tactical Floating Panel (Search & Map Style) */}
            <div className="absolute top-4 right-4 z-[1000] w-[90%] sm:w-[320px] max-w-full flex flex-col gap-2 pointer-events-auto">
              <div className="bg-slate-950/95 backdrop-blur-md border border-[#106011]/80 p-2 sm:p-2.5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                
                {/* Visual Scanner Bar */}
                <div className="h-0.5 bg-gradient-to-r from-transparent via-[#0ad111] to-transparent animate-pulse mb-2 opacity-50" />
                
                {/* Search Input */}
                <div className="flex items-center gap-2 bg-black/50 border border-[#106011]/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 mb-2 focus-within:border-[#0ad111] transition-colors">
                  <Search className="w-3.5 h-3.5 text-[#0ad111]" />
                  <input
                    type="text"
                    placeholder="SEARCH TARGET OR AGENT..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-[#0ad111] font-mono text-[9px] sm:text-[10px] uppercase w-full placeholder:text-[#106011]/70"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-[#106011]/70 hover:text-[#0ad111]">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <Navigation className="w-3.5 h-3.5 text-[#106011]/50 ml-1 hidden sm:block" />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex bg-[#106011]/10 rounded-lg p-1 w-full sm:flex-1 border border-[#106011]/30">
                    {(['street', 'satellite', 'tactical'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setMapStyle(style)}
                        className={`flex-1 sm:flex-initial px-2 py-1 rounded-lg font-mono text-[9px] font-bold tracking-widest transition-all duration-300 text-center uppercase whitespace-nowrap ${
                          mapStyle === style
                            ? 'bg-[#106011] text-black shadow-[0_0_10px_rgba(16,96,17,0.5)] font-black'
                            : 'text-[#106011]/70 hover:text-[#0ad111] hover:bg-[#106011]/15'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                  
                  {/* Orientation Toggles */}
                  <div className="flex bg-[#106011]/10 rounded-lg p-1 w-full border border-[#106011]/30">
                    {(['none', 'portrait', 'landscape'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setOrientationMode(mode)}
                        className={`flex-1 px-2 py-1 rounded-lg font-mono text-[8px] font-bold tracking-widest transition-all duration-300 uppercase ${
                          orientationMode === mode
                            ? 'bg-[#0ad111] text-black'
                            : 'text-[#106011]/70 hover:text-[#0ad111] hover:bg-[#106011]/15'
                        }`}
                      >
                        {mode.slice(0, 1).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search dropdown results */}
              {searchQuery && (
                <div className="w-full bg-slate-950/95 backdrop-blur-md border border-[#106011]/80 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.8)] mt-1">
                  <div className="max-h-[180px] overflow-y-auto divide-y divide-[#106011]/20 font-mono text-[10px] custom-scrollbar bg-slate-950">
                    {/* Visual Scanner Bar */}
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-[#0ad111] to-transparent animate-pulse" />

                    {mapFilteredDrops.length === 0 && mapFilteredLiveAgents.length === 0 ? (
                      <div className="p-3 text-slate-500 text-center uppercase tracking-widest text-[9px]">
                        NO_TARGETS_ACQUIRED
                      </div>
                    ) : (
                      <>
                        {/* Drops list */}
                        {mapFilteredDrops.map((drop) => (
                          <button
                            key={drop.id}
                            onClick={() => {
                              setMapCenter([drop.lat, drop.lng]);
                              setMapZoom(18);
                              setSelectedDrop(drop);
                              setSearchQuery('');
                            }}
                            className="w-full text-left p-3 hover:bg-[#106011]/20 transition-colors flex items-start gap-3 group"
                          >
                            <MapPin className="w-4 h-4 text-[#0ad111] shrink-0 mt-0.5 group-hover:animate-bounce" />
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-bold truncate tracking-widest text-[10px] uppercase">
                                {drop.title}
                              </div>
                              <div className="text-[#106011] text-[8px] truncate mt-0.5">
                                [DROP] {drop.id}
                              </div>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded leading-none ${
                                drop.status === 'active' ? 'bg-emerald-950/40 text-emerald-500 border border-emerald-900/50' :
                                drop.status === 'claimed' ? 'bg-blue-950/40 text-blue-500 border border-blue-900/50' : 'bg-red-950/40 text-red-500 border border-red-900/50'
                              }`}>{drop.status}</span>
                          </button>
                        ))}
                        
                        {/* Agents List */}
                        {mapFilteredLiveAgents.map((agent) => {
                          if (!agent.latest) return null;
                          const aliasName = agent.profile?.username || agent.profile?.alias || `AGENT_${agent.userId.slice(0, 5)}`;
                          return (
                            <button
                              key={agent.userId}
                              onClick={() => {
                                setMapCenter([agent.latest!.lat, agent.latest!.lng]);
                                setMapZoom(18);
                                setSearchQuery('');
                              }}
                              className="w-full text-left p-3 hover:bg-[#106011]/20 transition-colors flex items-start gap-3 group"
                            >
                              <User className="w-4 h-4 text-red-500 shrink-0 mt-0.5 group-hover:animate-ping" />
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-bold truncate tracking-widest text-[10px] uppercase">
                                  {aliasName}
                                </div>
                                <div className="text-[#106011] text-[8px] truncate mt-0.5">
                                  [AGENT] {agent.userId}
                                </div>
                              </div>
                              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-red-900/50 bg-red-950/40 text-red-500 leading-none">
                                ONLINE
                              </span>
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Simulated crosshair decor */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/[0.03] pointer-events-none z-[399]" />
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/[0.03] pointer-events-none z-[399]" />

            <div className="flex-1 w-full h-full relative">
              <MapContainer center={mapCenter} zoom={mapZoom} className="h-full w-full">
                <CachedTileLayer 
                  url={
                    mapStyle === 'tactical' 
                      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                      : mapStyle === 'satellite'
                        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  } 
                  maxZoom={19}
                />
                
                <MapFocus center={mapCenter} zoom={mapZoom} />

                {/* Drops pins layers */}
                {drops.map(drop => {
                  const isSelected = selectedDrop?.id === drop.id;
                  return (
                    <Marker 
                      key={drop.id} 
                      position={[drop.lat, drop.lng]} 
                      icon={createDropIcon(drop.status, drop.title)}
                      eventHandlers={{
                        click: () => {
                          setSelectedDrop(drop);
                          pushLog(`Map selection changed to drop: "${drop.title}"`, "info");
                        }
                      }}
                    >
                      <Popup className="drop-map-popup">
                        <div className="font-mono text-[11px] text-black w-[200px]">
                          <div className="font-bold border-b border-zinc-200 pb-1.5 mb-2 uppercase tracking-wide flex justify-between items-center text-xs">
                            <span className="truncate max-w-[120px]">{drop.title}</span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded leading-none ${
                              drop.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                              drop.status === 'claimed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                            }`}>{drop.status}</span>
                          </div>
                          <div className="space-y-1">
                            <div><strong>LAT/LNG:</strong> {drop.lat.toFixed(5)}, {drop.lng.toFixed(5)}</div>
                            <div><strong>ASSIGNEE:</strong> {getProfileName(drop.assigned_to)}</div>
                            <div className="text-[9px] text-zinc-500 pt-1.5 border-t border-dashed mt-1.5 uppercase">
                              SETUP: {new Date(drop.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Live Agents Tracking Layers */}
                {liveAgents.map(({ userId, latest, profile }) => {
                  if (!latest) return null;
                  const trail = userTrails[userId] || [];
                  const aliasName = profile?.username || profile?.alias || `AGENT_${userId.slice(0, 5)}`;
                  
                  return (
                    <React.Fragment key={userId}>
                      {trail.length > 1 && (
                        <Polyline positions={trail} color="#ef4444" weight={2} opacity={0.5} dashArray="5, 5" />
                      )}
                      <Marker 
                        position={[latest.lat, latest.lng]} 
                        icon={createAgentIcon(aliasName)}
                      >
                        <Popup>
                          <div className="font-mono text-[11px] text-black space-y-1">
                            <strong className="text-red-600 uppercase tracking-widest text-[9px] block">🕵️ AGENT COMPINS TRANSMITTING</strong>
                            <div><strong>ALIAS:</strong> @{aliasName}</div>
                            <div><strong>ID:</strong> {userId.slice(0,8)}...</div>
                            <div><strong>PRECISION:</strong> ±{Math.round(latest.accuracy || 0)}m</div>
                            <div><strong>UPLINK_TIME:</strong> {new Date(latest.recorded_at).toLocaleTimeString()}</div>
                          </div>
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          {/* Incoming GPS Data scrolling stream */}
          <div className="bg-zinc-950 border border-[#106011]/30 p-4 rounded-2xl flex flex-col gap-2 relative">
            <div className="flex justify-between items-center border-b border-[#106011]/20 pb-1.5">
              <span className="font-mono text-[9px] text-[#106011] uppercase tracking-[0.25em] flex items-center gap-1.5 font-bold">
                <Terminal className="w-3.5 h-3.5" /> SECURE_GPS_SAT TELEMETRY STREAM
              </span>
              <button 
                onClick={() => setTermLogs([])}
                className="text-[8px] font-mono hover:text-[#0ad111] uppercase tracking-wider text-zinc-500 transition-colors"
              >
                Clear Screen
              </button>
            </div>
            
            {/* Console Screen */}
            <div className="h-28 bg-[#040804] border border-[#106011]/25 p-3 rounded-lg overflow-y-auto font-mono text-[10px] text-[#106011]/90 flex flex-col gap-1 custom-scrollbar">
              {termLogs.length === 0 ? (
                <div className="text-zinc-600 text-center py-6 animate-pulse select-none">SYSTEM IDLE. AWAITING INCOMING GPS COMPINS TRANSMISSIONS...</div>
              ) : (
                termLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-zinc-500 shrink-0">[{log.time}]</span>
                    <span className={`
                      ${log.type === 'success' ? 'text-emerald-400 font-semibold' : ''}
                      ${log.type === 'warn' ? 'text-red-500 font-semibold' : ''}
                      ${log.type === 'ping' ? 'text-cyan-400 font-bold' : ''}
                      ${log.type === 'info' ? 'text-zinc-300' : ''}
                    `}>
                      {log.msg}
                    </span>
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>

        {/* Master central console column (Manage items list) */}
        <div className="xl:col-span-3 flex flex-col gap-4 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 overflow-hidden max-h-[780px]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-semibold text-[#106011] font-display uppercase tracking-widest text-xs flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#106011]" /> ALL ACTIVE GRID PINS
              </h3>
              <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest">{filteredDrops.length} Found</span>
            </div>

            {/* Map selection quick info */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text"
                placeholder="Search drop ID, product..."
                className="w-full bg-black border border-zinc-800 focus:border-[#106011] transition-all rounded-xl pl-9 pr-4 py-2 text-xs font-mono outline-none text-white placeholder-zinc-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter tags tabs */}
            <div className="flex gap-1 overflow-x-auto text-[9px] font-mono uppercase tracking-wider pb-1 shrink-0 custom-scrollbar">
              {(['all', 'active', 'claimed', 'expired'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-2 py-1 rounded transition-all border ${
                    statusFilter === tab 
                      ? 'bg-[#106011]/25 border-[#106011] text-[#0ad111] font-bold shadow-[0_0_8px_rgba(16,96,17,0.3)]' 
                      : 'border-zinc-800 text-zinc-400 hover:text-white bg-transparent'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Drops cards list scroll */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {dropsLoading ? (
              <div className="text-center py-10 font-mono text-zinc-600 text-[10px] animate-pulse">DOWNLINKING CENTRAL RECORDS...</div>
            ) : filteredDrops.length === 0 ? (
              <div className="text-center py-10 font-mono text-zinc-500 text-[10px] border border-dashed border-zinc-800 rounded-xl">
                No telemetry pins align with filters
              </div>
            ) : (
              filteredDrops.map(drop => {
                const isSelected = selectedDrop?.id === drop.id;
                return (
                  <div 
                    key={drop.id} 
                    onClick={() => {
                      setSelectedDrop(drop);
                      handleFocusOnMap(drop.lat, drop.lng);
                    }}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none relative ${
                      isSelected 
                        ? 'bg-[#091509] border-[#106011] shadow-[0_0_12px_rgba(16,96,17,0.25)]' 
                        : 'bg-black/40 border-zinc-850 hover:border-zinc-700 hover:bg-zinc-950/40'
                    }`}
                  >
                    {/* Status accent point */}
                    <span className={`absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full ${
                      drop.status === 'active' ? 'bg-[#0ad111] animate-pulse shadow-[0_0_6px_#0ad111]' :
                      drop.status === 'claimed' ? 'bg-cyan-400' : 'bg-red-500'
                    }`} />

                    <div className="font-mono text-white text-xs font-black truncate uppercase mb-1">{drop.title}</div>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest truncate mb-2.5">PIN: {drop.id.slice(0, 8)}...</div>
                    
                    <div className="flex flex-col gap-1 border-t border-zinc-900 pt-2 font-mono text-[9px] text-zinc-400">
                      <div className="flex justify-between">
                        <span>COORDINATES:</span>
                        <span className="text-zinc-300 font-bold">{drop.lat.toFixed(5)}, {drop.lng.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ASSIGNEE:</span>
                        <span className="text-[#0ad111] font-bold">{getProfileName(drop.assigned_to)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Console Edit Actions details (Manage active drop pins centrally) */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          
          {/* Main Edit console card */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
            <div className="border-b border-zinc-800 pb-2.5">
              <h3 className="font-semibold text-white font-display uppercase tracking-widest text-xs flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-500" /> INSTANT PIN CONSOLE
              </h3>
              <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Edit selected grid node directly</p>
            </div>

            {selectedDrop ? (
              <form onSubmit={handleUpdateDrop} className="flex flex-col gap-3.5">
                <div className="p-3 bg-zinc-950 border-2 border-dashed border-[#106011]/30 rounded-xl space-y-1 font-mono text-[9.5px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">ID RECORD:</span>
                    <span className="text-[#0ad111] font-bold select-all">{selectedDrop.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">INITIALIZED:</span>
                    <span className="text-zinc-400">{new Date(selectedDrop.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 tracking-wider">Product Name</span>
                  <input 
                    type="text"
                    required
                    className="bg-black border border-zinc-800 focus:border-[#106011] transition-all rounded-xl p-2.5 text-xs font-mono outline-none text-white uppercase placeholder-zinc-600"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono uppercase text-zinc-400 tracking-wider">Latitude</span>
                    <input 
                      type="number"
                      step="any"
                      required
                      className="bg-black border border-zinc-800 focus:border-[#106011] transition-all rounded-xl p-2.5 text-xs font-mono outline-none text-white placeholder-zinc-600"
                      value={editLat}
                      onChange={e => setEditLat(e.target.value)}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono uppercase text-zinc-400 tracking-wider">Longitude</span>
                    <input 
                      type="number"
                      step="any"
                      required
                      className="bg-black border border-zinc-800 focus:border-[#106011] transition-all rounded-xl p-2.5 text-xs font-mono outline-none text-white placeholder-zinc-600"
                      value={editLng}
                      onChange={e => setEditLng(e.target.value)}
                    />
                  </label>
                </div>

                <div className="text-right">
                  <button 
                    type="button"
                    onClick={() => getCoordinatesFromBrowser('edit')}
                    className="text-[9px] font-mono text-[#0ad111] hover:text-white border border-[#106011]/30 hover:border-[#106011] px-2 py-1 rounded bg-black/45 transition-colors uppercase tracking-widest inline-flex items-center gap-1"
                  >
                    <Crosshair size={10} /> Use My GPS
                  </button>
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 tracking-wider">Assign Operation node</span>
                  <select
                    className="bg-black border border-zinc-800 focus:border-[#106011] rounded-xl p-2.5 text-xs font-mono outline-none text-white uppercase"
                    value={editAssignee}
                    onChange={e => setEditAssignee(e.target.value)}
                  >
                    <option value="">-- UNASSIGNED FIELD --</option>
                    {getAgentList().map(p => (
                      <option key={p.id} value={p.id}>
                        @{p.username || p.alias || p.role} ({p.role})
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 tracking-wider mb-1">Telemetry Status</span>
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[9px] uppercase tracking-wider text-center">
                    {(['active', 'claimed', 'expired'] as const).map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setEditStatus(status)}
                        className={`py-2 rounded-lg border-2 transition-all ${
                          editStatus === status
                            ? status === 'active' ? 'bg-emerald-950/40 border-[#0ad111] text-[#0ad111] font-bold' :
                              status === 'claimed' ? 'bg-blue-950/40 border-cyan-400 text-cyan-400 font-bold' :
                              'bg-red-950/40 border-red-500 text-red-500 font-bold'
                            : 'bg-transparent border-zinc-850 hover:border-zinc-700 text-zinc-400'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submits */}
                <div className="flex gap-2.5 mt-2 pt-2 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={handleDeleteDrop}
                    disabled={deleteLoading}
                    className="bg-red-950/30 hover:bg-red-900/40 border-2 border-red-950 text-red-500 hover:text-red-400 font-mono font-bold text-[10px] uppercase tracking-widest px-3.5 py-3 rounded-xl transition flex items-center justify-center placeholder-zinc-600 disabled:opacity-55"
                    title="Burn Drop Payload"
                  >
                    <Trash2 size={13} />
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="flex-1 bg-[#106011] hover:bg-green-700 text-black font-mono font-black text-[10px] uppercase tracking-[0.16em] py-3 rounded-xl transition disabled:opacity-55"
                  >
                    {updateLoading ? 'Saving Telemetries...' : 'Update Grid Pins'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-zinc-600 font-mono text-[10px] text-center py-20 border border-dashed border-zinc-800 rounded-2xl select-none">
                <span className="block mb-2">No active drops selected.</span>
                Choose an item from the map or listing to change its state.
              </div>
            )}
          </div>

          {/* Location simulator injector panel */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
            <div className="border-b border-zinc-800 pb-2.5">
              <h3 className="font-semibold text-white font-display uppercase tracking-widest text-xs flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" /> COORDINATES SIMULATOR
              </h3>
              <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Inject agent telemetry signal blocks</p>
            </div>

            <form onSubmit={handleSimulateBroadcast} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[9px] font-mono uppercase text-zinc-400 tracking-wider">Target Dropper Node</span>
                <select
                  required
                  className="bg-black border border-zinc-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs font-mono outline-none text-white uppercase"
                  value={simUserId}
                  onChange={e => {
                    setSimUserId(e.target.value);
                    const latest = getLatestForUser(e.target.value);
                    if (latest) {
                      setSimLat(latest.lat.toString());
                      setSimLng(latest.lng.toString());
                      pushLog(`Sim coords loaded from live telemetry records of user_id=${e.target.value.slice(0, 8)}`, "info");
                    }
                  }}
                >
                  <option value="">-- SELECT CLIENT / DROPPER --</option>
                  {getAgentList().map(p => (
                    <option key={p.id} value={p.id}>
                      🕵️ @{p.username || p.alias || p.role} ({p.role})
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 tracking-wider">Sim Latitude</span>
                  <input 
                    type="number"
                    step="any"
                    required
                    className="bg-black border border-zinc-800 focus:border-cyan-500 transition-all rounded-xl p-2.5 text-xs font-mono outline-none text-white placeholder-zinc-600"
                    value={simLat}
                    onChange={e => setSimLat(e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 tracking-wider">Sim Longitude</span>
                  <input 
                    type="number"
                    step="any"
                    required
                    className="bg-black border border-zinc-800 focus:border-cyan-500 transition-all rounded-xl p-2.5 text-xs font-mono outline-none text-white placeholder-zinc-600"
                    value={simLng}
                    onChange={e => setSimLng(e.target.value)}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 text-[9px] font-mono">
                <button
                  type="button"
                  onClick={() => {
                    const latNoise = 15.48 + (Math.random() - 0.5) * 0.05;
                    const lngNoise = 120.97 + (Math.random() - 0.5) * 0.05;
                    setSimLat(latNoise.toFixed(5));
                    setSimLng(lngNoise.toFixed(5));
                    showToast('Coordinates randomized around center sector', { type: 'success' });
                  }}
                  className="hover:text-cyan-400 text-zinc-500 transition-colors uppercase tracking-widest inline-flex items-center gap-1 border border-zinc-800 rounded px-2 py-1"
                >
                  Randomize Map
                </button>
              </div>

              <button
                type="submit"
                disabled={simLoading}
                className="bg-cyan-950/40 hover:bg-cyan-900/40 border-2 border-cyan-800 text-cyan-400 font-mono font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl transition flex items-center justify-center gap-2 placeholder-zinc-600 disabled:opacity-55"
              >
                <Send size={12} /> {simLoading ? 'Transmitting Signal...' : 'Inject Signal Ping'}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Floating Create Drop Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="relative bg-zinc-950 border-2 border-[#106011] rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(16,96,17,0.35)] flex flex-col gap-4">
            
            <div className="flex justify-between items-center border-b border-[#106011]/30 pb-3">
              <h3 className="text-[#0ad111] font-display font-black tracking-widest uppercase text-sm flex items-center gap-2">
                <MapPin className="animate-bounce text-[#0ad111]" size={16} /> Deploy New DropZone Pin
              </h3>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="text-zinc-500 hover:text-white font-mono text-xs"
              >
                CLOSE
              </button>
            </div>

            <form onSubmit={handleCreateDrop} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-[9px] font-mono uppercase text-zinc-400 tracking-wider">Product / Location Name</span>
                <input 
                  type="text" 
                  required 
                  className="bg-black border border-zinc-800 focus:border-[#106011] rounded-xl p-3 text-xs font-mono text-white outline-none capitalize placeholder-zinc-600"
                  placeholder="e.g. Gold Payload Sector B"
                  value={newDropTitle}
                  onChange={e => setNewDropTitle(e.target.value)}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 tracking-wider">Latitude</span>
                  <input 
                    type="number" 
                    step="any"
                    required 
                    className="bg-black border border-zinc-800 focus:border-[#106011] rounded-xl p-3 text-xs font-mono text-white outline-none placeholder-zinc-600"
                    placeholder="15.4865"
                    value={newDropLat}
                    onChange={e => setNewDropLat(e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 tracking-wider">Longitude</span>
                  <input 
                    type="number" 
                    step="any" 
                    required 
                    className="bg-black border border-zinc-800 focus:border-[#106011] rounded-xl p-3 text-xs font-mono text-white outline-none placeholder-zinc-600"
                    placeholder="120.9734"
                    value={newDropLng}
                    onChange={e => setNewDropLng(e.target.value)}
                  />
                </label>
              </div>

              <div className="text-right">
                <button 
                  type="button" 
                  onClick={() => getCoordinatesFromBrowser('create')}
                  className="text-[9px] font-mono text-[#0ad111] hover:text-white border border-[#106011]/30 hover:border-[#106011] px-2.5 py-1 rounded bg-black/45 transition-colors uppercase tracking-widest inline-flex items-center gap-1"
                >
                  <Crosshair size={10} /> Gather GPS
                </button>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-[9px] font-mono uppercase text-zinc-400 tracking-wider">Assign Operation Dropper</span>
                <select 
                  className="bg-black border border-zinc-800 focus:border-[#106011] rounded-xl p-3 text-xs font-mono text-white outline-none uppercase"
                  value={newDropAssignee}
                  onChange={e => setNewDropAssignee(e.target.value)}
                >
                  <option value="">-- CRITICAL UNASSIGNED --</option>
                  {getAgentList().map(p => (
                    <option key={p.id} value={p.id}>
                      🕵️ @{p.username || p.alias || p.role} ({p.role})
                    </option>
                  ))}
                </select>
              </label>

              <button 
                type="submit" 
                disabled={createLoading}
                className="bg-[#106011] hover:bg-green-700 text-black font-mono font-black tracking-widest uppercase py-3.5 rounded-xl transition text-xs mt-2 disabled:opacity-55"
              >
                {createLoading ? 'Deploying Satellite Pins...' : 'Deploy Satellite Pin'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
