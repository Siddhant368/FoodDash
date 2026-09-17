"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

export default function SettingsClient({ restaurant }: { restaurant: any }) {
  const [logo, setLogo] = useState(restaurant.logo || "");
  const [coverImage, setCoverImage] = useState(restaurant.coverImage || "");
  
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [logoError, setLogoError] = useState("");
  const [coverError, setCoverError] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "cover") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "logo") {
      setLogoError("");
      setIsUploadingLogo(true);
    } else {
      setCoverError("");
      setIsUploadingCover(true);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/admin/restaurant/images", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to upload image");
      }

      if (type === "logo") {
        setLogo(data.path);
      } else {
        setCoverImage(data.path);
      }
    } catch (err: any) {
      if (type === "logo") setLogoError(err.message);
      else setCoverError(err.message);
    } finally {
      if (type === "logo") setIsUploadingLogo(false);
      else setIsUploadingCover(false);
      
      // Reset input so same file can be re-selected if needed
      e.target.value = "";
    }
  };

  const handleRemoveImage = async (type: "logo" | "cover") => {
    if (type === "logo") setIsUploadingLogo(true);
    else setIsUploadingCover(true);

    try {
      const res = await fetch(`/api/admin/restaurant/images?type=${type}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to remove image");
      }

      if (type === "logo") setLogo("");
      else setCoverImage("");

    } catch (err: any) {
      alert(err.message);
    } finally {
      if (type === "logo") setIsUploadingLogo(false);
      else setIsUploadingCover(false);
    }
  };

  const [formData, setFormData] = useState({
    name: restaurant.name || "",
    description: restaurant.description || "",
    phone: restaurant.phone || "",
    email: restaurant.email || "",
    street: restaurant.address?.street || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");

    try {
      const res = await fetch("/api/admin/restaurant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          phone: formData.phone,
          email: formData.email,
          address: { street: formData.street }
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      setSaveMessage("Saved successfully!");
    } catch (err: any) {
      setSaveMessage(err.message);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Images Section */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-[#111111] mb-6">Restaurant Profile</h2>
        
        <div className="space-y-8 max-w-xl">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Restaurant Banner</label>
            <div className="relative w-full aspect-[16/6] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden group">
              {coverImage ? (
                <>
                  <div className="relative w-full h-full">
                    <Image src={coverImage} alt="Cover" fill className="object-cover" unoptimized />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={() => coverInputRef.current?.click()}
                      disabled={isUploadingCover}
                      className="bg-white text-[#111111] px-4 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2"
                    >
                      <Upload size={16} /> Change Banner
                    </button>
                    <button 
                      onClick={() => handleRemoveImage("cover")}
                      disabled={isUploadingCover}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2"
                    >
                      <X size={16} /> Remove
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                  <Upload size={32} className="mb-2 opacity-50" />
                  <p className="font-medium text-sm">Upload Cover Image</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (Max 5MB)</p>
                  <button 
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploadingCover}
                    className="mt-4 bg-[#FFE13C] text-[#111111] px-6 py-2 rounded-xl font-bold text-sm transition-colors hover:bg-yellow-400"
                  >
                    Select Image
                  </button>
                </div>
              )}
              {isUploadingCover && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <Loader2 className="animate-spin text-[#111111]" size={32} />
                </div>
              )}
            </div>
            {coverError && <p className="text-red-500 text-sm font-semibold mt-2">{coverError}</p>}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" ref={coverInputRef} onChange={(e) => handleImageUpload(e, "cover")} />
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Restaurant Logo</label>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 overflow-hidden flex-shrink-0 group">
                {logo ? (
                  <>
                    <div className="relative w-full h-full bg-white">
                      <Image src={logo} alt="Logo" fill className="object-contain p-1" unoptimized />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <button onClick={() => logoInputRef.current?.click()} disabled={isUploadingLogo} className="text-white hover:text-[#FFE13C]">
                        <Upload size={20} />
                      </button>
                      <button onClick={() => handleRemoveImage("logo")} disabled={isUploadingLogo} className="text-white hover:text-red-400">
                        <X size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                    <span className="text-3xl font-black">?</span>
                  </div>
                )}
                {isUploadingLogo && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <Loader2 className="animate-spin text-[#111111]" size={24} />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                {!logo && (
                   <button 
                     onClick={() => logoInputRef.current?.click()}
                     disabled={isUploadingLogo}
                     className="bg-white border border-gray-200 text-[#111111] px-5 py-2.5 rounded-xl font-bold text-sm transition-colors hover:bg-gray-50 flex items-center gap-2"
                   >
                     <Upload size={16} /> Upload Logo
                   </button>
                )}
                <p className="text-xs text-gray-500 font-medium mt-2">Recommended: 256x256px JPG, PNG, WEBP (Max 5MB)</p>
                {logoError && <p className="text-red-500 text-sm font-semibold mt-1">{logoError}</p>}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" ref={logoInputRef} onChange={(e) => handleImageUpload(e, "logo")} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* General Information Section */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-[#111111] mb-6 flex justify-between items-center">
          General Information 
        </h2>
        <form onSubmit={handleSaveInfo} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Restaurant Name</label>
            <input name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full bg-[#FAFAF8] text-[#111111] border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FFE13C]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-[#FAFAF8] text-[#111111] border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FFE13C] min-h-[100px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
              <input name="phone" value={formData.phone} onChange={handleInputChange} type="text" className="w-full bg-[#FAFAF8] text-[#111111] border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FFE13C]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full bg-[#FAFAF8] text-[#111111] border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FFE13C]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
            <input name="street" value={formData.street} onChange={handleInputChange} type="text" className="w-full bg-[#FAFAF8] text-[#111111] border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FFE13C]" />
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <button disabled={isSaving} type="submit" className="bg-[#111111] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#FFE13C] hover:text-[#111111] transition-colors disabled:opacity-50 flex items-center gap-2">
              {isSaving && <Loader2 size={16} className="animate-spin" />} Save Changes
            </button>
            {saveMessage && (
              <span className={`text-sm font-bold ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
