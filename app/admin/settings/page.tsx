import { Settings } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "RESTAURANT_ADMIN" || !user.restaurantId) {
    redirect("/login");
  }

  await connectDB();
  const restaurant = await Restaurant.findOne({ _id: user.restaurantId }).lean();
  
  if (!restaurant) {
    return <div>Restaurant not found</div>;
  }

  // Serialize to pass to client
  const serializedRestaurant = {
    ...restaurant,
    _id: restaurant._id.toString(),
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#111111] tracking-tight">Store Settings</h1>
        <p className="text-gray-500 font-medium mt-1">Manage your restaurant details and preferences.</p>
      </div>
      
      <SettingsClient restaurant={serializedRestaurant} />
    </div>
  );
}
