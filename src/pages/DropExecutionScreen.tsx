import { useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import QRCode from "qrcode";
import { useLiveLocations } from "../hooks/realtime/useLiveLocations";
import { useLiveDrops } from "../hooks/realtime/useLiveDrops";
import DropConfirmationModal from "../components/DropConfirmationModal";

export default function DropExecutionScreen({ dropId }: { dropId: string }) {
  const [qrCode, setQrCode] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { locations } = useLiveLocations(dropId);
  const { executeDrop } = useLiveDrops();

  const latestLocation = locations[dropId]?.[locations[dropId].length - 1];

  const generateQR = async () => {
    const data = {
      dropId,
      timestamp: new Date().toISOString(),
      location: latestLocation,
    };
    const qr = await QRCode.toDataURL(JSON.stringify(data));
    setQrCode(qr);
  };

  const handleExecuteDrop = async () => {
    setIsExecuting(true);
    try {
      await executeDrop(dropId); // This now does optimistic update internally
      setShowConfirmModal(false);
      alert("Drop marked as executed. Awaiting client confirmation.");
    } catch (error) {
      console.error("Failed to execute drop");
      alert("Failed to execute drop.");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Execute Drop #{dropId}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden h-[420px]">
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <button
              onClick={generateQR}
              className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl mb-4"
            >
              Generate Secure QR Code
            </button>

            {qrCode && (
              <div className="flex justify-center">
                <img
                  src={qrCode}
                  alt="Drop QR"
                  className="w-48 h-48 bg-white p-2"
                />
              </div>
            )}
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isExecuting}
            className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-2xl font-semibold text-lg disabled:bg-zinc-700 transition"
          >
            {isExecuting ? "Executing..." : "CONFIRM DROP  EXECUTION"}
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
