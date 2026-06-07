import { GlobalModals } from '@/components/ui/GlobalModals';

export default function App() {
  return (
    <div className="min-h-screen bg-card text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center font-sans space-y-4">
      <h1 className="text-4xl font-bold tracking-tight mb-2 text-primary">DropPin Ops</h1>
      <p className="text-muted text-sm mt-8 max-w-sm text-center">
        Foundation v1.0 Booted! Modals and Guards are ready to govern the interface.
      </p>
      
      {/* Global Contexts */}
      <GlobalModals />
    </div>
  );
}
