import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

interface Hospital {
  name: string;
  address: string;
}

const HospitalFinder: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.google) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        findNearbyHospitals(latitude, longitude);
      });
    } else {
      setError("Google Maps API not loaded");
    }
  }, []);

  function findNearbyHospitals(lat: number, lng: number, radius: number = 2000) {
    const service = new window.google.maps.places.PlacesService(document.createElement("div"));

    service.nearbySearch(
      {
        location: { lat, lng },
        radius,
        type: ["hospital"],
      },
      (results: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
          setHospitals(
            results.map((r: any) => ({
              name: r.name,
              address: r.vicinity,
            }))
          );
          setError(null);
        } else {
          if (radius < 10000) {
            console.log(`No hospitals in ${radius}m. Retrying...`);
            findNearbyHospitals(lat, lng, radius + 3000);
          } else {
            setError("🚨 No hospitals found within 10 km. Please call 108 for emergency services.");
          }
        }
      }
    );
  }

  return (
    <div>
      <h2>Nearby Hospitals</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {hospitals.map((h, i) => (
          <li key={i}>
            <b>{h.name}</b> - {h.address}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HospitalFinder;
