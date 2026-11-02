"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, Tag, ShoppingBag, ShoppingCart } from "lucide-react";

const HIDDEN_PREFIXES = [
  "/admin",
  "/super-admin",
  "/delivery",
  "/login",
  "/signup",
  "/forgot-password",
  "/checkout",
  "/api",
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState<number>(0);

  const fetchCartCount = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.cart?.items) {
        const total = data.cart.items.reduce(
          (sum: number, item: any) => sum + (item.quantity || 1),
          0
        );
        setCartCount(total);
      } else {
        setCartCount(0);
      }
    } catch {
      // Ignore unauthenticated or network failures
    }
  }, []);

  useEffect(() => {
    fetchCartCount();

    const handleUpdate = () => fetchCartCount();
    window.addEventListener("cart-updated", handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener("cart-updated", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, [fetchCartCount, pathname]);

  if (!pathname) return null;

  // Hide on admin, delivery, auth, and checkout routes
  const shouldHide = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (shouldHide) return null;

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Explore",
      href: "/restaurants",
      icon: UtensilsCrossed,
      isActive:
        pathname === "/restaurants" ||
        pathname.startsWith("/restaurants/") ||
        pathname.startsWith("/category"),
    },
    {
      label: "Offers",
      href: "/offers",
      icon: Tag,
      isActive: pathname.startsWith("/offers"),
    },
    {
      label: "Orders",
      href: "/orders",
      icon: ShoppingBag,
      isActive: pathname.startsWith("/orders"),
    },
    {
      label: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      isActive: pathname === "/cart",
      isCart: true,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111111]/95 backdrop-blur-xl border-t border-white/10 px-2 pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.4)]"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)" }}
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 relative transition-colors ${
                active ? "text-[#FFE13C]" : "text-gray-400 hover:text-white"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  size={20}
                  className={`transition-transform duration-150 ${active ? "scale-110" : ""}`}
                />
                {item.isCart && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#FFE13C] text-[#111111] text-[10px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center leading-none shadow-sm">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight ${active ? "font-black" : "font-semibold"}`}>
                {item.label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-[#FFE13C] -mt-0.5"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
