// ── Geolocation service for impossible travel detection ────────
// Uses ip-api.com free tier (no key needed, 45 req/min)

export interface GeoLocation {
  ip: string;
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  isp: string;
}

export async function getLocationFromIP(ip: string): Promise<GeoLocation | null> {
  try {
    // Return Chennai default for localhost / private IPs
    if (
      ip === '::1' ||
      ip === '127.0.0.1' ||
      ip.startsWith('192.168') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.')
    ) {
      return {
        ip,
        city: 'Chennai',
        country: 'India',
        countryCode: 'IN',
        lat: 13.0827,
        lng: 80.2707,
        isp: 'Local Network',
      };
    }

    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,city,country,countryCode,lat,lon,isp,query`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) return null;
    const data = await res.json() as any;
    if (data.status !== 'success') return null;

    return {
      ip: data.query,
      city: data.city || 'Unknown',
      country: data.country || 'Unknown',
      countryCode: data.countryCode || 'XX',
      lat: data.lat || 0,
      lng: data.lon || 0,
      isp: data.isp || 'Unknown',
    };
  } catch {
    return null;
  }
}

export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface TravelAnalysis {
  distanceKm: number;
  timeMinutes: number;
  speedKmph: number;
  isImpossible: boolean;
  isSuspicious: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
}

export function analyzeTravelSpeed(
  lastLat: number, lastLng: number, lastCity: string, lastCountry: string,
  newLat: number, newLng: number, newCity: string, newCountry: string,
  timeDifferenceMinutes: number
): TravelAnalysis {
  const distanceKm = calculateDistance(lastLat, lastLng, newLat, newLng);
  const timeHours = timeDifferenceMinutes / 60;
  const speedKmph = timeHours > 0 ? distanceKm / timeHours : 999999;
  const threshold = Number(process.env.IMPOSSIBLE_TRAVEL_THRESHOLD_KMPH) || 900;

  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let isImpossible = false;
  let isSuspicious = false;
  let reason = 'Normal login pattern';

  if (speedKmph > threshold) {
    isImpossible = true;
    isSuspicious = true;
    riskLevel = 'critical';
    reason = `Impossible travel: ${Math.round(distanceKm)}km in ${Math.round(timeDifferenceMinutes)} minutes (${Math.round(speedKmph)} km/h) from ${lastCity}, ${lastCountry} to ${newCity}, ${newCountry}`;
  } else if (lastCountry !== newCountry && timeDifferenceMinutes < 180) {
    isSuspicious = true;
    riskLevel = 'high';
    reason = `Different country login: ${lastCountry} → ${newCountry} within ${Math.round(timeDifferenceMinutes)} minutes`;
  } else if (distanceKm > 1000 && timeDifferenceMinutes < 60) {
    isSuspicious = true;
    riskLevel = 'high';
    reason = `Rapid location change: ${Math.round(distanceKm)}km in ${Math.round(timeDifferenceMinutes)} minutes`;
  } else if (distanceKm > 500 && timeDifferenceMinutes < 30) {
    isSuspicious = true;
    riskLevel = 'medium';
    reason = `Unusual location change: ${Math.round(distanceKm)}km in ${Math.round(timeDifferenceMinutes)} minutes`;
  }

  return { distanceKm, timeMinutes: timeDifferenceMinutes, speedKmph, isImpossible, isSuspicious, riskLevel, reason };
}
