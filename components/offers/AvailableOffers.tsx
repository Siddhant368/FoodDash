"use client";

import { useState, useEffect } from "react";
import OfferCard from "@/components/offers/OfferCard";
import { Loader2 } from "lucide-react";

export default function AvailableOffers({ restaurantId }: { restaurantId: string }) {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch(`/api/restaurants/${restaurantId}/offers`);
        const json = await res.json();
        if (json.success) {
          setOffers(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch offers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [restaurantId]);

  if (loading) {
    return <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-gray-400" size={24} /></div>;
  }

  if (offers.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-black mb-6 uppercase">Available Offers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {offers.map(offer => (
          <OfferCard key={offer._id} offer={offer} />
        ))}
      </div>
    </div>
  );
}
