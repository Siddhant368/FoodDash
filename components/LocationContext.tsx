"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type LocationData = {
  latitude: number;
  longitude: number;
};

interface LocationContextType {
  location: LocationData | null;
  setLocation: (loc: LocationData | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  detectLocation: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<LocationData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("foodhub_location");
      if (saved) {
        setLocationState(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse saved location", e);
    }
  }, []);

  const setLocation = (loc: LocationData | null) => {
    setLocationState(loc);
    if (loc) {
      localStorage.setItem("foodhub_location", JSON.stringify(loc));
    } else {
      localStorage.removeItem("foodhub_location");
    }
  };

  const detectLocation = async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Your browser does not support location detection.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLoading(false);
        setIsModalOpen(false); // Close modal on success
      },
      (geoError) => {
        let errorMsg = "Unable to detect your location. Please try again.";
        if (geoError.code === geoError.PERMISSION_DENIED) {
          errorMsg = "Location permission was denied. Please allow location access from your browser settings.";
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          errorMsg = "Unable to detect your location. Please try again.";
        } else if (geoError.code === geoError.TIMEOUT) {
          errorMsg = "Location detection timed out. Please try again.";
        }
        setError(errorMsg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        isModalOpen,
        setIsModalOpen,
        detectLocation,
        loading,
        error,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
