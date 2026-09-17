import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import ProfileClient from "./ProfileClient";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export default async function ProfilePage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect("/login");
  }

  // Ensure they are a CUSTOMER
  if (sessionUser.role !== "CUSTOMER") {
    // Depending on logic, either redirect or show an error.
    // For now we allow access but only load customer data.
  }

  // Fetch complete user data
  await connectDB();
  const userData = await User.findById(sessionUser.id).lean();

  if (!userData) {
    redirect("/login");
  }

  const plainUser = {
    _id: userData._id.toString(),
    name: userData.name,
    email: userData.email,
    phone: userData.phone || "",
    role: userData.role,
  };

  return (
    <ProfileClient user={plainUser} />
  );
}