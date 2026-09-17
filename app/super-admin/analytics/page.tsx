import { Metadata } from "next";
import AnalyticsClient from "./AnalyticsClient";

export const metadata: Metadata = {
  title: "Analytics | Super Admin",
  description: "Platform performance overview",
};

export default function AnalyticsPage() {
  return <AnalyticsClient />;
}
