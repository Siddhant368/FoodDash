"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { RefreshCcw } from "lucide-react";

// Fix Leaflet marker icons in Next.js
const driverIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "hue-rotate-[120deg]" // Make driver green/blue
});

const restaurantIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "hue-rotate-[240deg]" // Make restaurant red/orange
});

const homeIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Component to handle recenter map when button is clicked
function MapController({ driverLat, driverLng, shouldRecenter, setShouldRecenter }: any) {
  const map = useMap();
  useEffect(() => {
    if (shouldRecenter) {
      map.setView([driverLat, driverLng], 15);
      setShouldRecenter(false);
    }
  }, [driverLat, driverLng, shouldRecenter, map, setShouldRecenter]);
  return null;
}

// Calculate distance between two lat/lng pairs in meters using Haversine
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Decode OSRM polyline
function decodePolyline(str: string, precision = 5) {
  let index = 0, lat = 0, lng = 0;
  const coordinates: [number, number][] = [];
  const shift = Math.pow(10, precision);

  while (index < str.length) {
    let byte, shiftValue = 0, result = 0;
    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shiftValue;
      shiftValue += 5;
    } while (byte >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shiftValue = 0;
    result = 0;
    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shiftValue;
      shiftValue += 5;
    } while (byte >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    coordinates.push([lat / shift, lng / shift]);
  }
  return coordinates;
}

export default function LiveMap({
  driverLocation,
  customerLocation,
  restaurantLocation,
  onEtaUpdate
}: {
  driverLocation: any;
  customerLocation: any;
  restaurantLocation: any;
  onEtaUpdate: (eta: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [shouldRecenter, setShouldRecenter] = useState(true);
  
  // Track last coordinate we calculated route for to avoid spamming OSRM
  const lastRouteCalculationCoord = useRef<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!driverLocation?.latitude || !customerLocation?.latitude) return;

    const calculateRoute = async () => {
      // Don't calculate if we moved very little (e.g., less than 30 meters)
      if (lastRouteCalculationCoord.current) {
        const dist = getDistance(
          lastRouteCalculationCoord.current.lat, 
          lastRouteCalculationCoord.current.lng,
          driverLocation.latitude, 
          driverLocation.longitude
        );
        if (dist < 30) return;
      }

      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${driverLocation.longitude},${driverLocation.latitude};${customerLocation.longitude},${customerLocation.latitude}?overview=full`);
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
          const routeData = data.routes[0];
          
          if (routeData.geometry) {
            const decodedRoute = decodePolyline(routeData.geometry);
            setRoute(decodedRoute);
            lastRouteCalculationCoord.current = { lat: driverLocation.latitude, lng: driverLocation.longitude };
          }
          
          if (routeData.duration) {
            const mins = Math.ceil(routeData.duration / 60);
            onEtaUpdate(`${mins} min${mins !== 1 ? 's' : ''}`);
          }
        }
      } catch (err) {
        console.error("Error fetching route", err);
      }
    };

    calculateRoute();
  }, [driverLocation, customerLocation, onEtaUpdate]);

  if (!mounted) return <div className="h-64 bg-gray-100 rounded-[24px] animate-pulse flex items-center justify-center">Loading Map...</div>;

  return (
    <div className="relative h-[400px] w-full rounded-[24px] overflow-hidden border border-gray-100 shadow-sm z-0">
      <MapContainer
        center={[driverLocation.latitude, driverLocation.longitude]}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {restaurantLocation?.latitude && (
          <Marker position={[restaurantLocation.latitude, restaurantLocation.longitude]} icon={restaurantIcon}>
            <Popup>Restaurant</Popup>
          </Marker>
        )}
        
        {customerLocation?.latitude && (
          <Marker position={[customerLocation.latitude, customerLocation.longitude]} icon={homeIcon}>
            <Popup>Delivery Address</Popup>
          </Marker>
        )}

        <Marker position={[driverLocation.latitude, driverLocation.longitude]} icon={driverIcon}>
          <Popup>Delivery Partner</Popup>
        </Marker>
        
        {route.length > 0 && (
          <Polyline positions={route} color="#3b82f6" weight={5} opacity={0.8} />
        )}

        <MapController 
          driverLat={driverLocation.latitude} 
          driverLng={driverLocation.longitude} 
          shouldRecenter={shouldRecenter}
          setShouldRecenter={setShouldRecenter}
        />
      </MapContainer>
      
      <button 
        onClick={() => setShouldRecenter(true)}
        className="absolute bottom-4 right-4 z-[400] bg-white text-[#111111] p-3 rounded-full shadow-md border border-gray-100 hover:bg-gray-50 flex items-center justify-center"
        aria-label="Recenter Map"
      >
        <RefreshCcw size={20} />
      </button>
    </div>
  );
}
