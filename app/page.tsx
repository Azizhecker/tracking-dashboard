'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MapComponent = dynamic(() => import('../components/MapComponent'), { 
  ssr: false,
  loading: () => <p>Memuat Peta...</p>
});

export default function Dashboard() {
  // STATE BARU: Menyimpan daftar lokasi (Format: { "HP Utama": [lat, lng], "HP Kedua": [lat, lng] })
  const [devices, setDevices] = useState<Record<string, [number, number]>>({});

  useEffect(() => {
    const fetchInitialLocation = async () => {
      // Ambil 100 data terakhir
      const { data } = await supabase
        .from('device_locations')
        .select('*')
        .order('updated_at', { ascending: true }) 
        .limit(100);
      
      if (data) {
        const latestDevices: Record<string, [number, number]> = {};
        // Memasukkan ke daftar. Karena ascending, data terbaru akan menimpa data lama untuk HP yang sama.
        data.forEach(item => {
          latestDevices[item.device_name] = [item.latitude, item.longitude];
        });
        setDevices(latestDevices);
      }
    };

    fetchInitialLocation();

    // Dengarkan perubahan Real-time
    const subscription = supabase
      .channel('public:device_locations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'device_locations' }, (payload) => {
        setDevices(prevDevices => ({
          ...prevDevices, // Pertahankan posisi HP lain
          [payload.new.device_name]: [payload.new.latitude, payload.new.longitude] // Update posisi HP yang baru bergerak
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
        Dashboard Monitoring Multi-HP
      </h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Total Perangkat Aktif: <strong>{Object.keys(devices).length}</strong>
      </p>
      
      {Object.keys(devices).length === 0 ? (
        <div style={{ padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
          <p>Belum ada data HP yang masuk...</p>
        </div>
      ) : (
        <div style={{ height: '70vh', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid #ddd' }}>
          <MapComponent devices={devices} />
        </div>
      )}
    </div>
  );
}