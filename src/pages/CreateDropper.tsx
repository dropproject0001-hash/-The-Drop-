import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRole } from '../context/RoleContext';
import { useToast } from '@/components/ui/ToastContainer';
import { Shield, UserPlus, Phone, Lock, User, ArrowLeft, Terminal, Wand2, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateDropper() {
  const { isSuperAdmin } = useRole();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    phone: '',
    role: 'dropper' as 'dropper' | 'admin',
  });
  const [loading, setLoading] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-red-500 font-mono text-center gap-4">
        <Shield size={64} className="animate-pulse" />
        <h2 className="text-2xl font-black tracking-widest uppercase">Access Denied</h2>
        <p className="text-zinc-500 max-w-sm">
          SECURITY_ERROR: YOU DO NOT HAVE SUFFICIENT CLEARANCE TO ACCESS THE ACCOUNT INITIALIZATION TERMINAL.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 border border-red-900 text-red-800 hover:bg-red-950/20 transition rounded-xl font-bold tracking-widest uppercase text-xs"
        >
          Return to Deck
        </button>
      </div>
    );
  }

  const generatePassword = () => {
    // Generate a secure random password
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    let pass = '';
    for (let i = 0; i < array.length; i++) {
        pass += charset[array[i] % charset.length];
    }
    setForm({ ...form, password: pass });
    showToast('Secure password generated', { type: 'success' });
  };

  const handleCreate = async () => {
    const trimmedUsername = form.username.trim().toLowerCase().replace(/\s/g, '_');
    const checkedPassword = form.password;
    let checkedPhone = form.phone.trim();

    if (!trimmedUsername || !checkedPassword) {
      showToast('Username and Password are required', { type: 'error' });
      return;
    }

    if (checkedPassword.length < 6) {
      showToast('Password must be at least 6 characters long', { type: 'error' });
      return;
    }

    if (checkedPhone) {
      // Basic E.164 sanitization & validation
      checkedPhone = checkedPhone.replace(/[\s\-\(\)]/g, '');
      if (!checkedPhone.startsWith('+')) {
        if (/^\d{10,15}$/.test(checkedPhone)) {
          checkedPhone = '+' + checkedPhone;
        } else {
          showToast('Phone number must start with + followed by country code (e.g., +15551234567)', { type: 'error' });
          return;
        }
      } else {
        if (!/^\+\d{7,15}$/.test(checkedPhone)) {
          showToast('Invalid phone format: Use + followed by 7-15 digits only.', { type: 'error' });
          return;
        }
      }
    }

    setLoading(true);
    setDeploymentError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase.functions.invoke('create-dropper', {
        body: {
          username: trimmedUsername,
          password: checkedPassword,
          phone: checkedPhone || undefined,
          role: form.role,
        },
      });

      if (error) {
        // Enforce detailed messages if available inside library's error
        const details = (error as any)?.context?.message || error.message;
        throw new Error(details || error.message);
      }
      if (data?.error) throw new Error(data.error);

      showToast(`Account created successfully for @${trimmedUsername}`, { type: 'success' });
      setForm({ username: '', password: '', phone: '', role: 'dropper' });
    } catch (err: any) {
      console.error('[CreateUser] Detailed Error:', err);
      
      const errMsg = err?.message || String(err);
      
      // Check if it's a known Supabase Auth constraint exception
      if (errMsg.includes('already exists') || errMsg.includes('already registered')) {
        showToast(`Error: Operation rejected - Username or phone number already in use.`, { type: 'error' });
      } else {
        const isFetchOrDeployError = 
          errMsg.includes('Failed to send a request to the Edge Function') || 
          errMsg.includes('Edge Function') || 
          errMsg.includes('fetch') ||
          errMsg.includes('404');

        if (isFetchOrDeployError) {
          setDeploymentError(
            "EDGE_FUNCTION_NOT_DEPLOYED: The core 'create-dropper' Edge Function is missing or un-deployed on your current remote/sandbox Supabase instance."
          );
          showToast('Configuration missing: Edge Function not deployed', { type: 'error' });
        } else {
          showToast(`Registration Failed: ${errMsg}`, { type: 'error' });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-full p-4 md:p-8 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-black/95 rounded-2xl border-2 border-[#106011] shadow-[0_0_60px_rgba(16,96,17,0.25)] overflow-hidden relative select-none"
      >
        {/* Tactical HUD Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
             style={{ backgroundImage: 'radial-gradient(#106011 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {/* Scanning Line Animation */}
        <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[1px] bg-[#106011]/20 shadow-[0_0_8px_#106011] z-10 pointer-events-none"
        />

        {/* Tactical HUD Corner Brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#106011] rounded-tl-xl pointer-events-none z-30 drop-shadow-[0_0_8px_#106011]"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#106011] rounded-tr-xl pointer-events-none z-30 drop-shadow-[0_0_8px_#106011]"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#106011] rounded-bl-xl pointer-events-none z-30 drop-shadow-[0_0_8px_#106011]"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#106011] rounded-br-xl pointer-events-none z-30 drop-shadow-[0_0_8px_#106011]"></div>

        <div className="absolute inset-1 border border-dashed border-[#106011]/20 rounded-xl pointer-events-none z-20"></div>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-6 bg-[#106011]/10 border-b-2 border-[#106011]/50 relative z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-1.5 hover:bg-[#106011]/20 rounded border border-[#106011]/30 text-[#106011] transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex flex-col">
              <span className="text-[8px] font-mono tracking-[0.3em] text-[#106011] font-black uppercase opacity-70">Secured Node Terminal</span>
              <h2 className="text-white font-display font-black tracking-[0.15em] uppercase text-xl drop-shadow-[0_0_8px_rgba(16,96,17,0.7)]">
                Initialize Agent
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={form.role}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono font-black tracking-widest uppercase ${
                  form.role === 'dropper' 
                    ? 'border-[#106011]/50 bg-[#106011]/10 text-[#0ad111]' 
                    : 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                }`}
              >
                {form.role === 'dropper' ? <Terminal size={12} /> : <Shield size={12} />}
                {form.role}
              </motion.div>
            </AnimatePresence>
            <UserPlus className="w-6 h-6 text-[#106011] animate-pulse" />
          </div>
        </div>

        {/* Form Body */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-8 space-y-6 relative z-20"
        >
          
          <div className="space-y-4">
            {/* Role Selection HUD */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-2">
              <button
                onClick={() => setForm({ ...form, role: 'dropper' })}
                className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all group relative overflow-hidden ${
                  form.role === 'dropper' 
                    ? 'border-[#106011] bg-[#106011]/15 text-[#106011] shadow-[0_0_20px_rgba(16,96,17,0.4)]' 
                    : 'border-[#106011]/20 bg-black/40 text-zinc-600 hover:border-[#106011]/50'
                }`}
              >
                {form.role === 'dropper' && (
                  <motion.div layoutId="role-active" className="absolute top-2 right-2 text-[#0ad111]">
                    <CheckCircle2 size={12} />
                  </motion.div>
                )}
                <Terminal size={22} className={form.role === 'dropper' ? 'text-[#0ad111]' : 'group-hover:text-[#106011]'} />
                <div className="text-center">
                  <div className="font-mono text-[10px] font-black tracking-widest uppercase">Dropper Operative</div>
                  <div className="text-[8px] font-mono opacity-50 uppercase mt-1">Field Logistics</div>
                </div>
              </button>
              <button
                onClick={() => setForm({ ...form, role: 'admin' })}
                className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all group relative overflow-hidden ${
                  form.role === 'admin' 
                    ? 'border-blue-600 bg-blue-600/15 text-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                    : 'border-blue-600/20 bg-black/40 text-zinc-600 hover:border-blue-500/50'
                }`}
              >
                {form.role === 'admin' && (
                  <motion.div layoutId="role-active" className="absolute top-2 right-2 text-blue-400">
                    <CheckCircle2 size={12} />
                  </motion.div>
                )}
                <Shield size={22} className={form.role === 'admin' ? 'text-blue-400' : 'group-hover:text-blue-500'} />
                <div className="text-center">
                  <div className="font-mono text-[10px] font-black tracking-widest uppercase">Admin Controller</div>
                  <div className="text-[8px] font-mono opacity-50 uppercase mt-1">Node Command</div>
                </div>
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                {form.role === 'dropper' ? (
                  <Terminal size={14} className="text-[#106011]" />
                ) : (
                  <Shield size={14} className="text-blue-500/70" />
                )}
              </div>
              <input
                placeholder="UNIQUE_IDENTIFIER / USERNAME"
                autoComplete="off"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                className="w-full bg-black/80 border-2 border-[#106011]/30 focus:border-[#106011] outline-none rounded-xl pl-12 pr-4 py-4 text-sm font-mono text-white placeholder:text-zinc-700 tracking-widest transition-all uppercase"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[8px] text-[#106011]/40 uppercase tracking-tighter">Required</div>
            </motion.div>

            <motion.div variants={itemVariants} className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#106011]" />
              <input
                type="password"
                placeholder="SECURE_TEMPORARY_TOKEN"
                autoComplete="off"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-black/80 border-2 border-[#106011]/30 focus:border-[#106011] outline-none rounded-xl pl-12 pr-12 py-4 text-sm font-mono text-white placeholder:text-zinc-700 tracking-widest transition-all"
              />
              <button 
                type="button"
                onClick={generatePassword}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#106011] hover:text-[#0ad111] transition-colors p-1"
                title="Generate Secure Token"
              >
                <Wand2 size={16} />
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#106011]" />
              <input
                placeholder="CONTACT_UPLINK (OPTIONAL)"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-black/80 border-2 border-[#106011]/30 focus:border-[#106011] outline-none rounded-xl pl-12 pr-4 py-4 text-sm font-mono text-white placeholder:text-zinc-700 tracking-widest transition-all"
              />
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
             <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
             <p className="text-[9px] font-mono text-blue-400/80 leading-relaxed uppercase">
                {form.role === 'dropper' 
                  ? "Droppers have access to field telemetry, route encryption, and dropzone verification modules."
                  : "Admins possess command-level clearance over node configurations, agent registries, and global analytics."
                }
             </p>
          </motion.div>

          {deploymentError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 border-2 border-red-700/80 bg-red-950/20 rounded-xl space-y-3 font-mono text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 py-1 px-2.5 bg-red-700/20 text-red-500 text-[8px] font-black tracking-widest border-l border-b border-red-750/30 uppercase">
                CONFIG_MISSING
              </div>
              
              <h4 className="text-white text-xs font-black tracking-widest uppercase flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
                DEPLOYMENT REQUIRED
              </h4>
              <p className="text-[9.5px] text-zinc-400 leading-relaxed uppercase">
                The secure user-management backend resides on Supabase as Deno-powered Edge Functions. Your environment is fully configured, but this function payload has not been uploaded to your active project yet.
              </p>

              <div className="space-y-1.5 pt-1">
                <div className="text-[8px] text-[#106011] font-black uppercase tracking-wider">Execute this terminal instruction:</div>
                <div className="p-3 bg-black/90 border border-[#106011]/30 rounded-lg text-[10px] text-[#0ad111] select-all font-semibold overflow-x-auto break-all whitespace-pre-wrap">
                  supabase functions deploy create-dropper
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[8px] text-zinc-500 font-black uppercase tracking-wider">Or deploy all operational payloads:</div>
                <div className="p-3 bg-black/90 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 select-all font-semibold overflow-x-auto break-all whitespace-pre-wrap">
                  supabase functions deploy --all
                </div>
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="pt-2">
            <button
               onClick={handleCreate}
               disabled={loading}
               className={`w-full py-4 rounded-xl font-display font-black tracking-[0.2em] uppercase text-xs transition-all relative overflow-hidden flex items-center justify-center gap-3 shadow-lg ${
                 loading 
                   ? 'bg-zinc-800 text-zinc-500 cursor-wait' 
                   : form.role === 'dropper'
                     ? 'bg-[#106011] text-black hover:bg-[#0ad111] hover:shadow-[0_0_30px_rgba(16,96,17,0.6)] active:scale-95'
                     : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] active:scale-95'
               }`}
             >
              <UserPlus size={16} />
              {loading ? 'INITIALIZING...' : `COMMIT ${form.role.toUpperCase()} RECORD`}
              
              {/* Scanline effect on button */}
              {!loading && (
                <motion.div 
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-y-0 w-20 bg-white/10 skew-x-[30deg] pointer-events-none"
                />
              )}
            </button>
          </motion.div>

          <motion.p variants={itemVariants} className="text-[9px] font-mono text-zinc-600 text-center uppercase tracking-widest leading-relaxed">
            All account initializations are logged and audited. <br/>
            The operative will be registered with a temporary @droppinops.com dummy email.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}

