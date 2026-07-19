import React, { useState, useEffect } from 'react';
import { X, Loader2, User, Camera } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';

export default function ProfileModal({ isOpen, onClose, settings, onSave }) {
  const { profile, setProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || 'Soham',
    avatarUrl: profile?.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3WQYrL0OBvTT4Fo3BEaCpmF5Tt1Pt7K4OCGo2plIQR9qFsCXAi147bLovUbowOl-LLUxPfO0FHax6pQizInmSK5qSNJwC9YiddweDrZJaNIr2TWRsoQHZjxNCp6cBRu5AZf38_d-jN9uBDPLjlnERAFw2Wplx7bvEreShKgalY_4fBPDhE1vnVV9iIfXu-KgvJJh1PCT_hypK94WzfJk8AL2RdA0me3W0lcciwINKxiXwBnLrZ5bCOU_gMaNfO0oN9Fb-pbybBw',
    affirmation: "You're making solid progress this week.",
  });

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        name: profile?.name || 'Soham',
        avatarUrl: profile?.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3WQYrL0OBvTT4Fo3BEaCpmF5Tt1Pt7K4OCGo2plIQR9qFsCXAi147bLovUbowOl-LLUxPfO0FHax6pQizInmSK5qSNJwC9YiddweDrZJaNIr2TWRsoQHZjxNCp6cBRu5AZf38_d-jN9uBDPLjlnERAFw2Wplx7bvEreShKgalY_4fBPDhE1vnVV9iIfXu-KgvJJh1PCT_hypK94WzfJk8AL2RdA0me3W0lcciwINKxiXwBnLrZ5bCOU_gMaNfO0oN9Fb-pbybBw',
        affirmation: settings.affirmation || prev.affirmation,
      }));
    }
  }, [settings, profile]);

  if (!isOpen) return null;

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    
    // Check file size (e.g. limit to 1.5MB to make sure local storage doesn't exceed 5MB quota)
    if (file.size > 1.5 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 1.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        avatarUrl: e.target.result // Base64 data URL
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      setProfile({ name: formData.name, avatarUrl: formData.avatarUrl });
      await onSave(null, { affirmation: formData.affirmation });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isBase64 = formData.avatarUrl?.startsWith('data:image/');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <h2 className="font-display text-xl text-on-surface font-semibold">Your Profile</h2>
          <button onClick={onClose} className="p-2 rounded-full text-secondary hover:bg-surface-container-high transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          
          <div className="flex flex-col items-center justify-center mb-2 gap-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="avatar-file-input" 
              onChange={handleFileChange}
            />
            <label 
              htmlFor="avatar-file-input"
              className={`relative cursor-pointer group w-28 h-28 rounded-full flex items-center justify-center border-4 border-surface shadow-sm overflow-hidden transition-all ${isDragging ? 'ring-4 ring-primary border-transparent scale-105' : 'hover:scale-102 hover:shadow-md'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface-container-high text-secondary">
                  <User className="w-10 h-10" />
                </div>
              )}
              {/* Overlay on Hover/Drag */}
              <div className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-[10px] font-label uppercase transition-opacity duration-200 ${isDragging ? 'opacity-100 bg-primary/70' : 'opacity-0 group-hover:opacity-100'}`}>
                <Camera className="w-5 h-5 mb-1" />
                <span>{isDragging ? 'Drop here' : 'Drop or Click'}</span>
              </div>
            </label>
            <p className="font-body text-[11px] text-secondary">Supports drag & drop or clicking (Max 1.5MB)</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] text-secondary uppercase">Display Name</label>
            <input 
              required
              autoFocus
              type="text" 
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] text-secondary uppercase">Avatar Image Source</label>
            <input 
              type="text" 
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary text-ellipsis"
              value={isBase64 ? "Local Custom Image (Uploaded)" : formData.avatarUrl}
              onChange={e => setFormData({...formData, avatarUrl: e.target.value})}
              disabled={isBase64}
              placeholder="https://example.com/photo.jpg"
            />
            {isBase64 && (
              <button 
                type="button"
                className="text-left font-label text-[10px] text-primary hover:underline self-start"
                onClick={() => setFormData({...formData, avatarUrl: ''})}
              >
                Clear uploaded photo and use URL/Default instead
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] text-secondary uppercase">Motivation Phrase</label>
            <input 
              type="text" 
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
              value={formData.affirmation}
              onChange={e => setFormData({...formData, affirmation: e.target.value})}
              placeholder="e.g. You're making solid progress this week!"
            />
          </div>

          <div className="mt-2 pt-4 border-t border-outline-variant flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 font-label text-[13px] text-secondary hover:bg-surface-container rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-primary text-on-primary font-label text-[13px] rounded-lg shadow-sm hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
