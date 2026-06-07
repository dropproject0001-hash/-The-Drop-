import { GlobalModals } from '@/components/ui/GlobalModals';
import { DropMap } from '@/components/map/DropMap';

export default function App() {
  return (
    <div className="min-h-screen bg-card text-slate-900 dark:text-slate-100 flex flex-col font-sans p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1 text-primary">DropPin Ops</h1>
        <p className="text-muted text-sm max-w-sm">
          Mamburao Live Tracking Unit - Offline Ready
        </p>
      </header>
      
      <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col">
        <DropMap height="min(75vh, 800px)" />
      </main>
      
      {/* Global Contexts */}
      <GlobalModals />
    </div>
  );
}
