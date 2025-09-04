import { loadGoogleMaps } from '../utils/loadGoogleMaps';

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function calculateDistanceMeters(pointA, pointB) {
  const earthRadiusMeters = 6371000;
  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);
  const deltaLat = lat2 - lat1;
  const deltaLng = toRadians(pointB.lng - pointA.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
}

function getPlaceDetails(service, placeId) {
  return new Promise((resolve) => {
    service.getDetails(
      {
        placeId,
        fields: [
          'formatted_phone_number',
          'international_phone_number',
          'formatted_address',
          'geometry',
          'name',
        ],
      },
      (place, status) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) {
          resolve(null);
          return;
        }
        resolve(place);
      }
    );
  });
}

export async function findNearestHospitals(latitude, longitude, limit = 3, initialRadius = 2000) {
  await loadGoogleMaps();

  const userLocation = { lat: latitude, lng: longitude };
  const service = new window.google.maps.places.PlacesService(document.createElement('div'));

  async function searchWithinRadius(radiusMeters) {
    return new Promise((resolve) => {
      service.nearbySearch(
        {
          location: userLocation,
          radius: radiusMeters,
          type: ['hospital'],
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
            resolve(results);
          } else {
            resolve([]);
          }
        }
      );
    });
  }

  // Expand the radius up to 10km until we get results
  let radius = initialRadius;
  let results = await searchWithinRadius(radius);
  while ((!results || results.length === 0) && radius < 10000) {
    radius += 3000;
    results = await searchWithinRadius(radius);
  }

  if (!results || results.length === 0) {
    return [];
  }

  const withDistance = results
    .map((r) => {
      const lat = r.geometry?.location?.lat?.();
      const lng = r.geometry?.location?.lng?.();
      if (typeof lat !== 'number' || typeof lng !== 'number') return null;
      const distanceMeters = calculateDistanceMeters(userLocation, { lat, lng });
      return {
        place_id: r.place_id,
        name: r.name,
        address: r.vicinity,
        location: { lat, lng },
        distanceMeters,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, Math.max(limit, 3) * 2); // shortlist a few to enrich with details

  const detailPromises = withDistance.map(async (entry) => {
    const details = await getPlaceDetails(service, entry.place_id);
    return {
      name: entry.name,
      address: details?.formatted_address || entry.address,
      phone: details?.international_phone_number || details?.formatted_phone_number || '',
      location: entry.location,
      distanceMeters: entry.distanceMeters,
    };
  });

  const enriched = await Promise.all(detailPromises);
  return enriched
    .filter(Boolean)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, limit);
}

