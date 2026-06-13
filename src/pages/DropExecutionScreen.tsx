import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import QRCode from "qrcode";
import { useLiveLocations } from "../hooks/realtime/useLiveLocations";
import { useLiveDrops } from "../hooks/realtime/useLiveDrops";
import { useToast } from "@/components/ui/ToastContainer";
import { useProfile } from "../hooks/useProfile";
import DropConfirmationModal from "../components/DropConfirmationModal";

export default function DropExecutionScreen({ dropId }: { dropId: string }) {
  const { showToast } = useToast();
  const [qrCode, setQrCode] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { locations } = useLiveLocations({});
  const { updateDropStatus } = useLiveDrops();
  const { profile } = useProfile();

  // FIX HIGH-5: Resolve the current user's location if they are a dropper
  const latestLocation = useMemo(() => {
    if (!profile?.id) return null;
    const userLocations = locations[profile.id];
    return userLocations && userLocations.length > 0 ? userLocations[0] : null;
  }, [locations, profile?.id]);

  const generateQR = async () => {
    const data = {
      dropId,
      timestamp: new Date().toISOString(),
      location: latestLocation,
    };
    try {
      const qr = await QRCode.toDataURL(JSON.stringify(data));
      setQrCode(qr);
      showToast("Secure QR Code generated with current telemetry.", { type: 'success' });
    } catch (err) {
      showToast("Failed to generate QR code.", { type: 'error' });
    }
  };

  const handleExecuteDrop = async () => {
    setIsExecuting(true);
    try {
      await updateDropStatus(dropId, 'claimed'); // This now does optimistic update internally
      setShowConfirmModal(false);
      showToast("Drop marked as executed. Awaiting client confirmation.", { type: 'success' });
    } catch (error) {
      console.error("Failed to execute drop");
      showToast("Failed to execute drop.", { type: 'error' });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6 tracking-widest uppercase font-mono">Execute Drop <span className="text-blue-500">#{dropId.slice(0, 8)}</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <div className="bg-zinc-900 border border-blue-500/20 rounded-2xl overflow-hidden h-[420px] shadow-[0_0_15px_rgba(59,130,246,0.1)]">
          <MapContainer
            center={
              latestLocation
                ? [latestLocation.lat, latestLocation.lng]
                : [14.5995, 120.9842]
            }
            zoom={15}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {latestLocation && (
              <Marker position={[latestLocation.lat, latestLocation.lng]} />
            )}
          </MapContainer>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-blue-500/20 rounded-2xl p-6">
            <button
              onClick={generateQR}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl mb-4 font-mono font-bold tracking-widest transition-all"
            >
              GENERATE SECURE QR
            </button>

            {qrCode && (
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-3 rounded-xl">
                  <img
                    src={qrCode}
                    alt="Drop QR"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-[10px] font-mono text-blue-400 uppercase tracking-widest animate-pulse">
                  Telemetry encoded in payload
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isExecuting}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-bold text-lg disabled:bg-zinc-700 transition-all font-mono tracking-widest"
          >
            {isExecuting ? "EXECUTING..." : "CONFIRM EXECUTION"}
          </button>
        </div>
      </div>

      {showConfirmModal && (
        <DropConfirmationModal
          dropId={dropId}
          onConfirm={handleExecuteDrop}
          onClose={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
}
