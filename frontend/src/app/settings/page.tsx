'use client';

import React, { useState, useEffect } from 'react';
import { User, Paintbrush, Save, Edit2, Upload, Building } from 'lucide-react';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { ApeAvatar } from '../../components/Sidebar';

export default function SettingsPage() {
  const { setToastMessage, darkMode, setDarkMode, userName, setUserName, userEmail, setUserEmail, userAvatar, setUserAvatar, schoolName, setSchoolName, schoolLocation, setSchoolLocation, schoolAvatar, setSchoolAvatar } = useAssignmentStore();

  const [isEditing, setIsEditing] = useState(false);

  // Temporary state for edits
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | null>(null);

  const [editSchoolName, setEditSchoolName] = useState('');
  const [editSchoolLocation, setEditSchoolLocation] = useState('');
  const [editSchoolAvatar, setEditSchoolAvatar] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const schoolFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    const nameParts = userName.split(' ');
    setEditFirstName(nameParts[0] || '');
    setEditLastName(nameParts.slice(1).join(' ') || '');
    setEditEmail(userEmail);
    setEditAvatar(userAvatar);
    
    setEditSchoolName(schoolName);
    setEditSchoolLocation(schoolLocation);
    setEditSchoolAvatar(schoolAvatar);
    
    setIsEditing(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 800 * 1024) {
        setToastMessage("Image is too large. Max size 800KB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSchoolAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 800 * 1024) {
        setToastMessage("Image is too large. Max size 800KB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditSchoolAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setUserName(`${editFirstName} ${editLastName}`.trim());
    setUserEmail(editEmail);
    setUserAvatar(editAvatar);
    
    setSchoolName(editSchoolName);
    setSchoolLocation(editSchoolLocation);
    setSchoolAvatar(editSchoolAvatar);
    
    setIsEditing(false);
    setToastMessage("Settings saved successfully.");
  };

  return (
    <div className="flex-1 pb-8 w-full flex flex-col font-sans animate-fadeIn">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 ml-[9px]">
        <div>
          <h1 className="text-3xl font-black font-outfit text-brand-dark dark:text-white tracking-tight leading-none transition-colors">
            <span className="text-[#E05058]">My</span> Settings
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm font-semibold transition-colors">Manage your account preferences, notifications, and security settings.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Content Area - Single Page */}
        <div className="flex-1 bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm transition-colors">
          <div className="space-y-12">
            
            {/* Account Profile Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black font-outfit text-brand-dark dark:text-white flex items-center gap-2 transition-colors">
                  <User className="w-5 h-5 text-[#E05058]" /> Account Profile
                </h3>
                {!isEditing && (
                  <button 
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-full transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 transition-colors">
                  {isEditing ? (
                    editAvatar ? <img src={editAvatar} alt="Avatar" className="w-full h-full object-cover" /> : <ApeAvatar className="w-full h-full" />
                  ) : (
                    userAvatar ? <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" /> : <ApeAvatar className="w-full h-full" />
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                        accept="image/png, image/jpeg, image/gif" 
                        className="hidden" 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-200 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" /> Change Avatar
                      </button>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 transition-colors">JPG, GIF or PNG. Max size of 800K</p>
                    </>
                  ) : (
                    <div>
                      <h4 className="text-xl font-black text-brand-dark dark:text-white transition-colors">{userName}</h4>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">{userEmail}</p>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">First Name</label>
                    <input 
                      type="text" 
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#E05058] dark:focus:border-[#E05058] transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Last Name</label>
                    <input 
                      type="text" 
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#E05058] dark:focus:border-[#E05058] transition-colors" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Email Address</label>
                    <input 
                      type="email" 
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#E05058] dark:focus:border-[#E05058] transition-colors" 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-slate-100 dark:bg-slate-800 transition-colors"></div>

            {/* School Profile Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-black font-outfit text-brand-dark dark:text-white flex items-center gap-2 transition-colors">
                <Building className="w-5 h-5 text-[#E05058]" /> School Profile
              </h3>
              
              <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 transition-colors">
                  {isEditing ? (
                    editSchoolAvatar ? <img src={editSchoolAvatar} alt="School Avatar" className="w-full h-full object-cover" /> : <ApeAvatar className="w-full h-full" />
                  ) : (
                    schoolAvatar ? <img src={schoolAvatar} alt="School Avatar" className="w-full h-full object-cover" /> : <ApeAvatar className="w-full h-full" />
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <>
                      <input 
                        type="file" 
                        ref={schoolFileInputRef} 
                        onChange={handleSchoolAvatarChange} 
                        accept="image/png, image/jpeg, image/gif" 
                        className="hidden" 
                      />
                      <button 
                        onClick={() => schoolFileInputRef.current?.click()}
                        className="px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-200 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" /> Change Avatar
                      </button>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 transition-colors">JPG, GIF or PNG. Max size of 800K</p>
                    </>
                  ) : (
                    <div>
                      <h4 className="text-xl font-black text-brand-dark dark:text-white transition-colors">{schoolName}</h4>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">{schoolLocation}</p>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">School Name</label>
                    <input 
                      type="text" 
                      value={editSchoolName}
                      onChange={(e) => setEditSchoolName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#E05058] dark:focus:border-[#E05058] transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Location</label>
                    <input 
                      type="text" 
                      value={editSchoolLocation}
                      onChange={(e) => setEditSchoolLocation(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#E05058] dark:focus:border-[#E05058] transition-colors" 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-slate-100 dark:bg-slate-800 transition-colors"></div>

            {/* Preferences Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-black font-outfit text-brand-dark dark:text-white flex items-center gap-2 transition-colors">
                <Paintbrush className="w-5 h-5 text-[#E05058]" /> Preferences
              </h3>
              <div className="space-y-4">
                <div 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-colors ${darkMode ? 'border-slate-700 dark:border-slate-600 bg-slate-50 dark:bg-slate-800' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-brand-dark dark:text-white transition-colors">Dark Mode</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 transition-colors">Toggle dark mode appearance for the dashboard.</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-all ${darkMode ? 'left-6' : 'left-0.5'}`}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {isEditing && (
            <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end sticky bottom-0 bg-white/90 dark:bg-[#111111]/90 backdrop-blur-sm pb-2 animate-fadeIn transition-colors">
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-[11px] rounded-full uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-[#1A1A1A] dark:bg-white dark:text-black hover:bg-black dark:hover:bg-slate-200 text-white font-extrabold text-[11px] rounded-full uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
