import { connectDB } from "@/lib/db";
import Offer from "@/models/Offer";
import moment from "moment-timezone";
import OfferCard from "@/components/offers/OfferCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function GlobalOffersPage() {
  await connectDB();

  const now = moment().tz("Asia/Kolkata");
  const currentTime = now.format("HH:mm");

  const filter = {
    isActive: true,
    startDate: { $lte: now.toDate() },
    endDate: { $gte: now.toDate() },
  };

  const offers = await Offer.find(filter)
    .populate("restaurantId", "name")
    .sort({ createdAt: -1 })
    .lean();

  const validOffers = offers.filter((offer) => {
    if (offer.usageLimit && offer.usedCount >= offer.usageLimit) return false;
    if (offer.startTime && offer.endTime) {
      if (currentTime < offer.startTime || currentTime > offer.endTime) return false;
    }
    return true;
  });

  // Group offers by restaurant
  const groupedOffers = validOffers.reduce((acc: any, offer: any) => {
    const rId = offer.restaurantId._id.toString();
    if (!acc[rId]) {
      acc[rId] = {
        restaurantName: offer.restaurantId.name,
        restaurantId: rId,
        offers: []
      };
    }
    acc[rId].offers.push(offer);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] pb-24">
      <div className="bg-[#151515] text-white pt-12 pb-16 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4 mb-6">
          <Link href="/" className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-4xl font-black tracking-tight">Available Offers</h1>
        </div>
        <p className="max-w-6xl mx-auto text-gray-400 font-medium px-14">
          Discover the best discounts from your favorite restaurants.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        {Object.keys(groupedOffers).length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm mt-8">
            <h3 className="text-xl font-bold text-[#111111] mb-2">No offers available right now.</h3>
            <p className="text-gray-500 mb-6">Check back later for exciting new discounts!</p>
            <Link href="/restaurants" className="bg-[#111111] text-white px-6 py-3 rounded-full font-bold">
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-12 mt-8">
            {Object.values(groupedOffers).map((group: any) => (
              <div key={group.restaurantId}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black uppercase text-[#111111]">
                    {group.restaurantName}
                  </h2>
                  <Link href={`/restaurants/${group.restaurantId}`} className="text-sm font-bold text-gray-500 hover:text-[#111111] transition-colors">
                    Visit Restaurant &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.offers.map((offer: any) => {
                    const serializedOffer = {
                      ...offer,
                      _id: offer._id.toString()
                    };
                    return <OfferCard key={offer._id.toString()} offer={serializedOffer} />
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
