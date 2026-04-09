import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';

const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// KITA UBAH PROPS-NYA MENJADI DAFTAR PERANGKAT (Kamus Data)
export default function MapComponent({ devices }: { devices: Record<string, [number, number]> }) {
  // Mencari titik tengah peta berdasarkan HP pertama yang terdeteksi
  const firstDeviceCoords = Object.values(devices)[0];
  const mapCenter = firstDeviceCoords || [-2.5489, 118.0149]; // Default: Tengah Indonesia

  return (
    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* MENGULANG DAN MENAMPILKAN PIN UNTUK SETIAP HP YANG ADA DI DATABASE */}
      {Object.entries(devices).map(([deviceName, coords]) => (
        <Marker key={deviceName} position={coords} icon={customMarkerIcon}>
          
          {/* --- BAGIAN BARU: Tooltip permanen agar nama muncul di atas icon --- */}
          <Tooltip 
            permanent 
            direction="top" 
            offset={[0, -40]} 
            opacity={0.9}
          >
            <span style={{ fontWeight: 'bold', color: '#1A237E' }}>{deviceName}</span>
          </Tooltip>

          <Popup>
            <strong>{deviceName}</strong> <br />
            Lat: {coords[0]} <br />
            Lng: {coords[1]}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}