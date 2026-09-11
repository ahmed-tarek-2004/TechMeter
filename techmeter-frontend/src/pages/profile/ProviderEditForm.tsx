import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import { ProviderProfile } from '../../types';

interface ProviderEditFormProps {
  profile: ProviderProfile | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormState {
  userName: string;
  phoneNumber: string;
  country: string;
  bankAccount: string;
  brief: string;
  experienceYears: number;
}

const ProviderEditForm: React.FC<ProviderEditFormProps> = ({ profile, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    userName: profile?.providerName || '',
    phoneNumber: profile?.phoneNumber || '',
    country: profile?.country || '',
    bankAccount: profile?.bankAccount || '',
    brief: profile?.brief || '',
    experienceYears: profile?.experienceYears || 0,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(profile?.profileUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => profileService.updateProviderProfile(formData),
    onSuccess: (response) => {
      if (response.succeeded || response.statusCode === 200) {
        // Invalidate queries so all profile data & header reload
        queryClient.invalidateQueries({ queryKey: ['provider-profile'] });

        // Update local auth context state & localStorage immediately
        const newPhoto =
          response.data?.profileUrl ||
          response.data?.photoUrl ||
          response.data?.profileImage ||
          (selectedFile ? photoPreview : undefined);

        updateUser({
          userName: form.userName,
          phoneNumber: form.phoneNumber,
          ...(newPhoto ? { profileUrl: newPhoto } : {}),
        });

        toast.success(response.message || 'Profile updated successfully!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const msg =
          response.message ||
          (response.errors && response.errors.join(', ')) ||
          'Failed to update profile';
        toast.error(msg);
      }
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        error?.message ||
        'An error occurred while updating profile';
      toast.error(msg);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'experienceYears' ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('UserName', form.userName);
    formData.append('PhoneNumber', form.phoneNumber);
    formData.append('Country', form.country);
    formData.append('BankAccount', form.bankAccount);
    formData.append('Brief', form.brief);
    formData.append('ExperienceYears', String(form.experienceYears));
    if (selectedFile) {
      formData.append('ProfilePhoto', selectedFile);
      formData.append('ProfileImage', selectedFile);
    }
    mutation.mutate(formData);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Edit Instructor Profile
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Update your public instructor and payout information
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group rounded-3xl overflow-hidden w-24 h-24 border-2 border-indigo-200 dark:border-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-indigo-300 dark:text-indigo-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </button>
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
              Click to change photo
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* UserName */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Full Name / Instructor Name
            </label>
            <input
              type="text"
              name="userName"
              value={form.userName}
              onChange={handleChange}
              placeholder="e.g. Jane Smith"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
              required
            />
          </div>

          {/* PhoneNumber */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="e.g. +1 234 567 890"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Country */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="e.g. United States"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* BankAccount */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Bank Account / Payout IBAN
            </label>
            <input
              type="text"
              name="bankAccount"
              value={form.bankAccount}
              onChange={handleChange}
              placeholder="e.g. US1234567890123456"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* ExperienceYears */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Years of Experience
            </label>
            <input
              type="number"
              name="experienceYears"
              min={0}
              value={form.experienceYears}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Brief */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Instructor Bio / Brief
            </label>
            <textarea
              name="brief"
              rows={3}
              value={form.brief}
              onChange={handleChange}
              placeholder="Share a short bio about your expertise and teaching background..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-70"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProviderEditForm;
