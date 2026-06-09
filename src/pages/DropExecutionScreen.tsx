import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import QRCode from 'qrcode';
import DropConfirmationModal from '../components/DropConfirmationModal';

export default function DropExecutionScreen() {
  const [dropLocation, setDropLocation] = useState({ lat: 14.5995, lng: 120.9842 }); // Default Manila
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const generateQR = async () => {
    const dropData = {
      dropId: 'DROP-' + Date.now(),
      location: dropLocation,
      timestamp: new Date().toISOString(),
    };
    const qr = await QRCode.toDataURL(JSON.stringify(dropData));
    setQrCodeUrl(qr);
  };

  const handleConfirmDrop = () => {
    // TODO: Update drop status in Supabase
    alert('Drop marked as executed. Awaiting client confirmation.');
    setShowConfirmModal(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Execute Drop</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden h-[400px]">
          <MapContainer 
            center={[dropLocation.lat, dropLocation.lng]} 
            zoom={15} 
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[dropLocation.lat, dropLocation.lng]}>
              <Popup>Drop Location</Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Drop Details</h3>
            <button 
              onClick={generateQR}
              className="w-full bg-emerald-600 py-3 rounded-xl mb-4 hover:bg-emerald-700 transition"
            >
              Generate Secure QR Code
            </button>

            {qrCodeUrl && (
              <div className="flex justify-center">
                <img src={qrCodeUrl} alt="Drop QR Code" className="w-48 h-48 bg-white p-2 rounded" />
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowConfirmModal(true)}
            className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-2xl font-semibold text-lg transition"
          >
            CONFIRM DROP EXECUTION
          </button>
        </div>
      </div>

      {showConfirmModal && (
        <DropConfirmationModal 
          dropId="DROP-784392"
          onConfirm={handleConfirmDrop}
          onClose={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
}
