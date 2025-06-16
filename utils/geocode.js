export async function reverseGeocode(lat, lon) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'HiFybeApp/1.0 (contacto@hifybe.com)'
          }
        }
      );
      const json = await res.json();
      return (
        json.address?.city ||
        json.address?.town ||
        json.address?.village ||
        json.address?.county ||
        'Desconocida'
      );
    } catch (err) {
      console.warn('[reverseGeocode] Error:', err.message);
      return 'Desconocida';
    }
  }
  