export interface Zone {
  id: string;
  name: { en: string; th: string };
  icon: string;
  lat: number;
  lng: number;
  radius: number; // meters
  popular?: boolean;
}

export const BANGKOK_ZONES: Zone[] = [
  // Popular areas
  { id: 'sukhumvit', name: { en: 'Sukhumvit', th: 'สุขุมวิท' }, icon: '🏙️', lat: 13.7315, lng: 100.5685, radius: 3000, popular: true },
  { id: 'silom', name: { en: 'Silom / Sathorn', th: 'สีลม / สาทร' }, icon: '🏢', lat: 13.7262, lng: 100.5235, radius: 2500, popular: true },
  { id: 'siam', name: { en: 'Siam / Ratchaprasong', th: 'สยาม / ราชประสงค์' }, icon: '🛍️', lat: 13.7462, lng: 100.5347, radius: 2000, popular: true },
  { id: 'chatuchak', name: { en: 'Chatuchak / Lat Phrao', th: 'จตุจักร / ลาดพร้าว' }, icon: '🌳', lat: 13.7999, lng: 100.5533, radius: 3000, popular: true },
  { id: 'bangkapi', name: { en: 'Bang Kapi / Ramkhamhaeng', th: 'บางกะปิ / รามคำแหง' }, icon: '🎓', lat: 13.7647, lng: 100.6447, radius: 3000, popular: true },
  { id: 'thonburi', name: { en: 'Thonburi / Pinklao', th: 'ธนบุรี / ปิ่นเกล้า' }, icon: '🌊', lat: 13.7614, lng: 100.4761, radius: 3000, popular: true },
  // Other areas
  { id: 'yaowarat', name: { en: 'Yaowarat / Chinatown', th: 'เยาวราช' }, icon: '🏮', lat: 13.7407, lng: 100.5096, radius: 2000 },
  { id: 'rattanakosin', name: { en: 'Rattanakosin / Old Town', th: 'รัตนโกสินทร์' }, icon: '🏛️', lat: 13.7516, lng: 100.4929, radius: 2500 },
  { id: 'dindaeng', name: { en: 'Din Daeng / Huai Khwang', th: 'ดินแดง / ห้วยขวาง' }, icon: '🏬', lat: 13.7704, lng: 100.5587, radius: 2500 },
  { id: 'bangna', name: { en: 'Bang Na / Bearing', th: 'บางนา / แบริ่ง' }, icon: '🛣️', lat: 13.6685, lng: 100.6048, radius: 3000 },
  { id: 'minburi', name: { en: 'Min Buri / Nong Chok', th: 'มีนบุรี / หนองจอก' }, icon: '🌾', lat: 13.8107, lng: 100.7295, radius: 4000 },
  { id: 'bangkhen', name: { en: 'Bang Khen / Don Mueang', th: 'บางเขน / ดอนเมือง' }, icon: '✈️', lat: 13.8929, lng: 100.5883, radius: 4000 },
  { id: 'taling-chan', name: { en: 'Taling Chan / Bang Khae', th: 'ตลิ่งชัน / บางแค' }, icon: '🌿', lat: 13.7737, lng: 100.4327, radius: 3500 },
  { id: 'prawet', name: { en: 'Prawet / Suan Luang', th: 'ประเวศ / สวนหลวง' }, icon: '🌲', lat: 13.7198, lng: 100.6621, radius: 3500 },
  { id: 'latkrabang', name: { en: 'Lat Krabang', th: 'ลาดกระบัง' }, icon: '🏭', lat: 13.7280, lng: 100.7475, radius: 4000 },
  { id: 'ramindra', name: { en: 'Ram Inthra / Khan Na Yao', th: 'รามอินทรา / คันนายาว' }, icon: '🛤️', lat: 13.8368, lng: 100.6707, radius: 3500 },
];

// Haversine distance in meters
export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestZone(lat: number, lng: number): Zone | null {
  let nearest: Zone | null = null;
  let minDist = Infinity;
  for (const z of BANGKOK_ZONES) {
    const d = distanceMeters(lat, lng, z.lat, z.lng);
    if (d < z.radius && d < minDist) {
      minDist = d;
      nearest = z;
    }
  }
  return nearest;
}
