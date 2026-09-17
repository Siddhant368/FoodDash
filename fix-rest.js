const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'app', 'restaurants', 'page.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Navbar
const headerRegex = /<header className="sticky top-0 z-50.*?<\/header>/s;
const newHeader = `{/* Header */}
        <header className="px-4 py-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between relative z-20">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE13C] text-[#111111]">
                <span className="text-2xl font-black">F</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-[#FFE13C]">FOODDASH</h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
            <Link href="/" className="hover:text-[#FFE13C] transition-colors">Home</Link>
            <Link href="/restaurants" className="text-[#FFE13C]">Explore</Link>
            <Link href="/#offers" className="hover:text-[#FFE13C] transition-colors">Offers</Link>
            <Link href="/help" className="hover:text-[#FFE13C] transition-colors">Help</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/restaurants" className="hidden sm:flex items-center gap-2 bg-[#222222] px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#333333] transition-colors">
              <MapPin size={16} className="text-[#FFE13C]" />
              <span>Set Location</span>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>

            {user ? (
              <>
                <Link href="/profile" className="bg-[#222222] hover:bg-[#333333] text-white p-3 rounded-full transition-colors flex items-center justify-center">
                  <User size={20} />
                </Link>
                <Link href="/cart" className="bg-[#FFE13C] text-[#111111] px-5 py-3 rounded-full hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#FFE13C]/20">
                  <ShoppingCart size={20} />
                  <span>{cartItemCount}</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="bg-[#222222] text-[#FFFDF0] p-3 rounded-full hover:bg-[#333333] transition-colors flex items-center justify-center">
                  <User size={20} />
                </Link>
                <Link href="/cart" className="bg-[#FFE13C] text-[#111111] px-5 py-3 rounded-full hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#FFE13C]/20">
                  <ShoppingCart size={20} />
                  <span>0</span>
                </Link>
              </>
            )}
          </div>
        </header>`;
content = content.replace(headerRegex, newHeader);

// 2. Main Background wrapper
content = content.replace(
  /<div className="min-h-screen bg-\[\#FAFAF8\] text-\[\#111111\]">/,
  `<div className="min-h-screen bg-[#FFFDF0] text-[#111111] font-sans">`
);

// 3. Hero Wrapper
content = content.replace(
  /{\/\* HERO SECTION \*\/}\s*<div className="bg-\[\#151515\] text-white rounded-b-\[40px\] lg:rounded-b-\[64px\] overflow-hidden relative shadow-lg">/,
  `{/* HERO SECTION */}
      <div className="bg-[#111111] text-[#FFFDF0] pt-4 pb-24 rounded-b-[48px] relative overflow-hidden">`
);

// 4. Imports missing icons
if (!content.includes('ChevronRight')) {
  content = content.replace('XCircle, Search, Menu }', 'XCircle, Search, Menu, ChevronRight }');
}
if (!content.includes('Truck')) {
  content = content.replace('XCircle, Search, Menu, ChevronRight }', 'XCircle, Search, Menu, ChevronRight, Truck }');
}

// 5. Card design
content = content.replace(/className="group cursor-pointer rounded-\[24px\] overflow-hidden bg-white border border-gray-100 hover:shadow-xl hover:shadow-black\/5 transition-all flex flex-col relative pb-5"/g,
  `className="group cursor-pointer rounded-[32px] overflow-hidden bg-white border border-gray-100 hover:shadow-xl hover:shadow-black/5 transition-all flex flex-col"`
);
content = content.replace(/<div className="relative h-56 w-full overflow-hidden">/g,
  `<div className="relative h-48 w-full overflow-hidden p-2">`
);
content = content.replace(/className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/g,
  `className="w-full h-full object-cover rounded-[24px] group-hover:scale-105 transition-transform duration-500"`
);
content = content.replace(/{?\/\* Overlapping Logo \*\/}?[\s\S]*?<\/div>\s*<\/div>/, ''); // removes overlapping logo
content = content.replace(/<div className="px-5 pt-3 flex-1 flex flex-col">/g,
  `<div className="p-6 pt-4 flex-1 flex flex-col">`
);
content = content.replace(/<div className="flex items-center gap-3 text-xs font-bold text-\[\#111111\] mb-5">[\s\S]*?<\/div>\s*<\/div>/,
  `<div className="flex items-center gap-4 text-xs font-bold text-[#111111] mb-6">
                      <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                        <Clock size={14} className="text-gray-400" />
                        25–35 min
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                        <Truck size={14} className="text-gray-400" />
                        ₹40 delivery
                      </div>
                    </div>`
);
content = content.replace(/<button className="w-full bg-\[\#FAFAF8\] text-\[\#111111\] border border-gray-200 group-hover:bg-\[\#FFE13C\] group-hover:border-\[\#FFE13C\] py-3 rounded-xl font-black text-sm transition-colors">/g,
  `<button className="mt-auto w-full bg-[#FFE13C] hover:bg-yellow-400 text-[#111111] font-black py-3.5 rounded-2xl transition-colors shadow-sm">`
);

// 6. Footer Replacement (Home page style)
const footerRegex = /<\/div>\s*<\/div>\s*<\/main>\s*<\/div>/;
const footerHTML = `</div>\n        </div>\n      </main>\n      
      {/* Footer */}
      <footer className="bg-[#111111] text-white pt-20 pb-8 px-4 lg:px-8 mt-12 rounded-t-[48px]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE13C] text-[#111111]">
                <span className="text-2xl font-black">F</span>
              </div>
              <h2 className="text-2xl font-black text-[#FFE13C]">FOODDASH</h2>
            </div>
            <p className="text-gray-400 font-medium mb-8 max-w-sm leading-relaxed">
              Find the best food in your city. Fresh, fast, and exactly what you're craving right now.
            </p>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-[#222222] flex items-center justify-center hover:bg-[#FFE13C] hover:text-[#111111] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </button>
              <button className="w-10 h-10 rounded-full bg-[#222222] flex items-center justify-center hover:bg-[#FFE13C] hover:text-[#111111] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </button>
              <button className="w-10 h-10 rounded-full bg-[#222222] flex items-center justify-center hover:bg-[#FFE13C] hover:text-[#111111] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-black text-lg mb-6">Links</h3>
            <ul className="space-y-4 font-semibold text-gray-400">
              <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Company</a></li>
              <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-lg mb-6">Legal</h3>
            <ul className="space-y-4 font-semibold text-gray-400">
              <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#FFE13C] transition-colors">Refund Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-lg mb-6">Download App</h3>
            <div className="space-y-3">
              <button className="w-full bg-[#222222] hover:bg-[#333333] border border-gray-800 px-4 py-3 rounded-2xl font-bold transition-colors flex items-center gap-3">
                <div className="text-left">
                  <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Download on the</div>
                  <div className="text-sm">App Store</div>
                </div>
              </button>
              <button className="w-full bg-[#222222] hover:bg-[#333333] border border-gray-800 px-4 py-3 rounded-2xl font-bold transition-colors flex items-center gap-3">
                <div className="text-left">
                  <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">GET IT ON</div>
                  <div className="text-sm">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-semibold text-sm text-gray-500">
          <p>Copyright © 2026 FOODDASH. All rights reserved.</p>
          <div className="flex gap-6">
            <button className="hover:text-[#FFE13C] transition-colors">English (US)</button>
            <button className="hover:text-[#FFE13C] transition-colors">India</button>
          </div>
        </div>
      </footer>
    </div>`;

content = content.replace(footerRegex, footerHTML);

fs.writeFileSync(file, content, 'utf8');
console.log('Update Complete');
