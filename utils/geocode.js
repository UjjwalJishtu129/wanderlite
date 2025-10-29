// utils/geocode.js
// Simple Mapbox forward geocoder using native fetch (Node 18+).
// Turns a "location" string into { type: 'Point', coordinates: [lng, lat] }

const BASE = "https://api.mapbox.com/geocoding/v5/mapbox.places";

async function forwardGeocode(place) {
  const token = process.env.MAPBOX_TOKEN;
  if (!token || !place || !place.trim()) return null;

  const url = `${BASE}/${encodeURIComponent(place)}.json?access_token=${token}&limit=1`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data && data.features && data.features[0];
    if (!feature || !Array.isArray(feature.center)) return null;

    // Mapbox center is [lng, lat]
    const [lng, lat] = feature.center;
    return {
      type: "Point",
      coordinates: [Number(lng), Number(lat)],
    };
  } catch {
    return null;
  }
}

module.exports = { forwardGeocode };
