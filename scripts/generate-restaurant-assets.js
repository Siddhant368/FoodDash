const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'public', 'images', 'restaurants', 'logos');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const logos = [
  {
    slug: 'foodhub-royal-kitchen',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg_royal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B132B"/>
      <stop offset="100%" stop-color="#1C2541"/>
    </linearGradient>
    <linearGradient id="gold_royal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg_royal)" stroke="#F59E0B" stroke-width="4"/>
  <path d="M60 90 L75 55 L100 75 L125 55 L140 90 Z" fill="url(#gold_royal)"/>
  <circle cx="75" cy="50" r="4" fill="#FFF"/>
  <circle cx="100" cy="46" r="5" fill="#FFF"/>
  <circle cx="125" cy="50" r="4" fill="#FFF"/>
  <path d="M65 115 A35 25 0 0 1 135 115 Z" fill="none" stroke="url(#gold_royal)" stroke-width="4"/>
  <circle cx="100" cy="88" r="4" fill="url(#gold_royal)"/>
  <line x1="55" y1="120" x2="145" y2="120" stroke="url(#gold_royal)" stroke-width="4" stroke-linecap="round"/>
  <text x="100" y="155" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" letter-spacing="2">ROYAL KITCHEN</text>
  <text x="100" y="175" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="9" font-weight="700" fill="#FDE047" letter-spacing="3">FINE DINING</text>
</svg>`
  },
  {
    slug: 'udaipur-spice-house',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg_spice" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C2D12"/>
      <stop offset="100%" stop-color="#451A03"/>
    </linearGradient>
    <linearGradient id="grad_spice" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDBA74"/>
      <stop offset="100%" stop-color="#EA580C"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg_spice)" stroke="#F97316" stroke-width="4"/>
  <path d="M60 90 C60 120 140 120 140 90 Z" fill="url(#grad_spice)"/>
  <rect x="55" y="85" width="90" height="8" rx="4" fill="#FFEDD5"/>
  <line x1="125" y1="55" x2="95" y2="95" stroke="#FDE047" stroke-width="10" stroke-linecap="round"/>
  <circle cx="100" cy="60" r="3" fill="#FDE047"/>
  <circle cx="75" cy="65" r="2.5" fill="#FDE047"/>
  <circle cx="130" cy="70" r="2.5" fill="#FDE047"/>
  <rect x="75" y="116" width="50" height="6" rx="3" fill="#FFEDD5"/>
  <text x="100" y="155" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" letter-spacing="2">SPICE HOUSE</text>
  <text x="100" y="175" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="9" font-weight="700" fill="#FDBA74" letter-spacing="3">AUTHENTIC TASTE</text>
</svg>`
  },
  {
    slug: 'rajasthan-rasoi',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg_rasoi" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#881337"/>
      <stop offset="100%" stop-color="#4C0519"/>
    </linearGradient>
    <linearGradient id="gold_rasoi" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#EAB308"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg_rasoi)" stroke="#EAB308" stroke-width="4"/>
  <circle cx="100" cy="85" r="42" fill="none" stroke="url(#gold_rasoi)" stroke-width="4" stroke-dasharray="6 3"/>
  <circle cx="100" cy="85" r="34" fill="#4C0519" stroke="url(#gold_rasoi)" stroke-width="2"/>
  <circle cx="88" cy="72" r="8" fill="url(#gold_rasoi)"/>
  <circle cx="112" cy="72" r="8" fill="url(#gold_rasoi)"/>
  <circle cx="84" cy="94" r="8" fill="url(#gold_rasoi)"/>
  <circle cx="116" cy="94" r="8" fill="url(#gold_rasoi)"/>
  <circle cx="100" cy="86" r="9" fill="#FFF"/>
  <text x="100" y="155" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" letter-spacing="2">RAJASTHAN RASOI</text>
  <text x="100" y="175" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="9" font-weight="700" fill="#FDE047" letter-spacing="3">SHAHI THALI</text>
</svg>`
  },
  {
    slug: 'the-tandoor-story',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg_tandoor" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181B"/>
      <stop offset="100%" stop-color="#09090B"/>
    </linearGradient>
    <linearGradient id="fire_tandoor" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#EF4444"/>
      <stop offset="60%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#FDE047"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg_tandoor)" stroke="#EA580C" stroke-width="4"/>
  <path d="M100 45 C115 65 130 80 120 105 C110 115 90 115 80 105 C70 80 85 65 100 45 Z" fill="url(#fire_tandoor)"/>
  <path d="M100 70 C108 80 115 90 110 102 C104 108 96 108 90 102 C85 90 92 80 100 70 Z" fill="#FDE047"/>
  <line x1="65" y1="120" x2="135" y2="120" stroke="#E4E4E7" stroke-width="4" stroke-linecap="round"/>
  <circle cx="80" cy="120" r="5" fill="#EF4444"/>
  <circle cx="100" cy="120" r="5" fill="#F97316"/>
  <circle cx="120" cy="120" r="5" fill="#EF4444"/>
  <text x="100" y="155" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" letter-spacing="2">TANDOOR STORY</text>
  <text x="100" y="175" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="9" font-weight="700" fill="#F97316" letter-spacing="3">LIVE CHARCOAL</text>
</svg>`
  },
  {
    slug: 'urban-bites',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg_urban" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111111"/>
      <stop offset="100%" stop-color="#1F2937"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg_urban)" stroke="#FFE13C" stroke-width="4"/>
  <path d="M65 75 C65 52 135 52 135 75 Z" fill="#FFE13C"/>
  <line x1="60" y1="83" x2="140" y2="83" stroke="#22C55E" stroke-width="5" stroke-linecap="round"/>
  <line x1="63" y1="93" x2="137" y2="93" stroke="#EF4444" stroke-width="6" stroke-linecap="round"/>
  <path d="M65 102 C65 114 135 114 135 102 Z" fill="#FFE13C"/>
  <circle cx="88" cy="64" r="2" fill="#111111"/>
  <circle cx="100" cy="58" r="2" fill="#111111"/>
  <circle cx="112" cy="64" r="2" fill="#111111"/>
  <text x="100" y="155" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="15" font-weight="900" fill="#FFE13C" letter-spacing="2">URBAN BITES</text>
  <text x="100" y="175" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="9" font-weight="700" fill="#FFFFFF" letter-spacing="3">BURGERS &amp; FUSION</text>
</svg>`
  },
  {
    slug: 'the-punjabi-table',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg_punjabi" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#92400E"/>
      <stop offset="100%" stop-color="#78350F"/>
    </linearGradient>
    <linearGradient id="gold_punjabi" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg_punjabi)" stroke="#F59E0B" stroke-width="4"/>
  <path d="M70 75 C60 115 140 115 130 75 Z" fill="url(#gold_punjabi)"/>
  <ellipse cx="100" cy="75" rx="30" ry="7" fill="#FEF08A"/>
  <rect x="65" y="72" width="70" height="5" rx="2.5" fill="#FFF"/>
  <circle cx="100" cy="73" r="5" fill="#FFF"/>
  <path d="M50 115 Q45 80 60 60" stroke="#FDE047" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M150 115 Q155 80 140 60" stroke="#FDE047" stroke-width="3" fill="none" stroke-linecap="round"/>
  <text x="100" y="155" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" letter-spacing="2">PUNJABI TABLE</text>
  <text x="100" y="175" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="9" font-weight="700" fill="#FDE047" letter-spacing="3">DESI DHABA TASTE</text>
</svg>`
  },
  {
    slug: 'south-indian-junction',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg_south" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#065F46"/>
      <stop offset="100%" stop-color="#064E3B"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg_south)" stroke="#10B981" stroke-width="4"/>
  <path d="M50 115 Q100 128 150 115 C130 90 70 90 50 115 Z" fill="#047857"/>
  <rect x="55" y="75" width="90" height="18" rx="9" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
  <circle cx="75" cy="105" r="8" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1.5"/>
  <circle cx="100" cy="108" r="9" fill="#EF4444" stroke="#B91C1C" stroke-width="1.5"/>
  <circle cx="125" cy="105" r="8" fill="#F59E0B" stroke="#D97706" stroke-width="1.5"/>
  <path d="M95 55 Q98 63 93 70" stroke="#A7F3D0" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M105 52 Q108 60 103 68" stroke="#A7F3D0" stroke-width="2" fill="none" stroke-linecap="round"/>
  <text x="100" y="155" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" letter-spacing="2">SOUTH JUNCTION</text>
  <text x="100" y="175" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="9" font-weight="700" fill="#6EE7B7" letter-spacing="3">DOSA &amp; IDLI</text>
</svg>`
  },
  {
    slug: 'desi-zaika',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg_zaika" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#991B1B"/>
      <stop offset="100%" stop-color="#7F1D1D"/>
    </linearGradient>
    <linearGradient id="flame_zaika" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#FDE047"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg_zaika)" stroke="#EF4444" stroke-width="4"/>
  <path d="M55 85 C60 120 140 120 145 85 Z" fill="#450A0A" stroke="#EF4444" stroke-width="3"/>
  <circle cx="48" cy="85" r="5" fill="none" stroke="#EF4444" stroke-width="3"/>
  <circle cx="152" cy="85" r="5" fill="none" stroke="#EF4444" stroke-width="3"/>
  <path d="M85 80 C85 65 95 60 90 48 C105 60 100 75 100 80" fill="url(#flame_zaika)"/>
  <path d="M105 82 C105 70 115 65 110 55 C122 66 118 78 118 82" fill="url(#flame_zaika)"/>
  <text x="100" y="155" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" letter-spacing="2">DESI ZAIKA</text>
  <text x="100" y="175" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="9" font-weight="700" fill="#FCA5A5" letter-spacing="3">SPICY FLAVORS</text>
</svg>`
  },
  {
    slug: 'the-biryani-house',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg_biryani" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#312E81"/>
    </linearGradient>
    <linearGradient id="pot_biryani" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg_biryani)" stroke="#F59E0B" stroke-width="4"/>
  <path d="M65 80 C55 125 145 125 135 80 Z" fill="url(#pot_biryani)"/>
  <path d="M60 80 C60 70 140 70 140 80 Z" fill="#FEF08A" stroke="#D97706" stroke-width="2"/>
  <circle cx="100" cy="65" r="4" fill="url(#pot_biryani)"/>
  <path d="M88 45 Q93 55 86 63" stroke="#FDE047" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M100 40 Q105 50 98 60" stroke="#FDE047" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M112 45 Q117 55 110 63" stroke="#FDE047" stroke-width="2" fill="none" stroke-linecap="round"/>
  <text x="100" y="155" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" letter-spacing="2">BIRYANI HOUSE</text>
  <text x="100" y="175" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="9" font-weight="700" fill="#FDE047" letter-spacing="3">DUM SPECIALS</text>
</svg>`
  },
  {
    slug: 'green-leaf-cafe',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg_leaf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064E3B"/>
      <stop offset="100%" stop-color="#022C22"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg_leaf)" stroke="#34D399" stroke-width="4"/>
  <path d="M100 45 C65 65 65 115 100 115 C135 115 135 65 100 45 Z" fill="#10B981" stroke="#34D399" stroke-width="2"/>
  <path d="M100 45 L100 115" stroke="#064E3B" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M100 70 Q85 65 80 62" stroke="#064E3B" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M100 85 Q115 80 120 77" stroke="#064E3B" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="100" cy="124" r="6" fill="none" stroke="#34D399" stroke-width="1.5"/>
  <circle cx="100" cy="124" r="3" fill="#34D399"/>
  <text x="100" y="155" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" letter-spacing="2">GREEN LEAF</text>
  <text x="100" y="175" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="9" font-weight="700" fill="#6EE7B7" letter-spacing="3">100% PURE VEG</text>
</svg>`
  },
  {
    slug: 'jaipur-food-corner',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg_corner" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9F1239"/>
      <stop offset="100%" stop-color="#881337"/>
    </linearGradient>
    <linearGradient id="gold_corner" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg_corner)" stroke="#F59E0B" stroke-width="4"/>
  <path d="M65 110 L65 75 Q100 45 135 75 L135 110 Z" fill="#4C0519" stroke="url(#gold_corner)" stroke-width="2"/>
  <polygon points="100,65 125,102 75,102" fill="url(#gold_corner)" stroke="#B45309" stroke-width="2"/>
  <text x="100" y="155" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" letter-spacing="2">JAIPUR CORNER</text>
  <text x="100" y="175" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="9" font-weight="700" fill="#FDE047" letter-spacing="3">STREET SPECIALS</text>
</svg>`
  },
  {
    slug: 'the-curry-bowl',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg_curry" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C2D12"/>
      <stop offset="100%" stop-color="#3B1408"/>
    </linearGradient>
    <linearGradient id="curry_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#C2410C"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg_curry)" stroke="#FB923C" stroke-width="4"/>
  <path d="M55 85 C55 125 145 125 145 85 Z" fill="url(#curry_grad)" stroke="#FED7AA" stroke-width="3"/>
  <ellipse cx="100" cy="85" rx="45" ry="10" fill="#EA580C" stroke="#FED7AA" stroke-width="2"/>
  <path d="M85 85 Q100 90 115 85" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="100" cy="83" r="3" fill="#22C55E"/>
  <path d="M92 50 Q96 60 90 70" stroke="#FDBA74" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M108 48 Q112 58 106 68" stroke="#FDBA74" stroke-width="2" fill="none" stroke-linecap="round"/>
  <text x="100" y="155" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" letter-spacing="2">THE CURRY BOWL</text>
  <text x="100" y="175" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="9" font-weight="700" fill="#FDBA74" letter-spacing="3">RICH GRAVIES</text>
</svg>`
  },
  {
    slug: 'street-food-station',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg_station" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C2410C"/>
      <stop offset="100%" stop-color="#9A3412"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg_station)" stroke="#FDE047" stroke-width="4"/>
  <circle cx="100" cy="85" r="26" fill="#FBBF24" stroke="#D97706" stroke-width="3"/>
  <ellipse cx="100" cy="78" rx="14" ry="8" fill="#15803D" stroke="#FDE047" stroke-width="1.5"/>
  <circle cx="96" cy="76" r="2" fill="#EF4444"/>
  <circle cx="104" cy="78" r="2" fill="#FDE047"/>
  <circle cx="100" cy="80" r="1.5" fill="#EF4444"/>
  <circle cx="75" cy="65" r="3.5" fill="#22C55E"/>
  <circle cx="125" cy="65" r="3.5" fill="#22C55E"/>
  <text x="100" y="155" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" letter-spacing="2">FOOD STATION</text>
  <text x="100" y="175" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="9" font-weight="700" fill="#FDE047" letter-spacing="3">CHAAT &amp; PURI</text>
</svg>`
  },
  {
    slug: 'taste-of-india',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg_taste" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F766E"/>
      <stop offset="100%" stop-color="#134E4A"/>
    </linearGradient>
    <linearGradient id="gold_taste" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg_taste)" stroke="#F59E0B" stroke-width="4"/>
  <circle cx="100" cy="85" r="36" fill="none" stroke="url(#gold_taste)" stroke-width="3" stroke-dasharray="8 4"/>
  <circle cx="100" cy="85" r="26" fill="#115E59" stroke="url(#gold_taste)" stroke-width="2"/>
  <line x1="88" y1="73" x2="112" y2="97" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
  <line x1="112" y1="73" x2="88" y2="97" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
  <circle cx="100" cy="85" r="4" fill="url(#gold_taste)"/>
  <text x="100" y="155" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" letter-spacing="2">TASTE OF INDIA</text>
  <text x="100" y="175" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="9" font-weight="700" fill="#FDE047" letter-spacing="3">PAN-INDIAN FLAVORS</text>
</svg>`
  },
  {
    slug: 'lake-city-kitchen',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg_lake" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0C4A6E"/>
      <stop offset="100%" stop-color="#082F49"/>
    </linearGradient>
    <linearGradient id="gold_lake" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#EAB308"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg_lake)" stroke="#38BDF8" stroke-width="4"/>
  <path d="M65 92 A35 25 0 0 1 135 92 Z" fill="none" stroke="url(#gold_lake)" stroke-width="3.5"/>
  <circle cx="100" cy="67" r="4" fill="url(#gold_lake)"/>
  <line x1="58" y1="95" x2="142" y2="95" stroke="url(#gold_lake)" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M60 108 Q75 103 90 108 T120 108 T140 108" stroke="#7DD3FC" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M68 118 Q83 113 98 118 T128 118" stroke="#38BDF8" stroke-width="2" fill="none" stroke-linecap="round"/>
  <text x="100" y="155" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" letter-spacing="2">LAKE CITY</text>
  <text x="100" y="175" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="9" font-weight="700" fill="#7DD3FC" letter-spacing="3">LAKESIDE DINING</text>
</svg>`
  }
];

logos.forEach(l => {
  const filePath = path.join(dir, l.slug + '.svg');
  fs.writeFileSync(filePath, l.svg.trim());
  console.log('Saved logo:', l.slug);
});

console.log('All 15 logos created successfully!');
