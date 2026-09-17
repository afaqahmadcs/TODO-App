"use client";

import React, { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { authService, AuthUserProfile, SocialLinks } from "@/services/authService";
import { analyticsService } from "@/services/analyticsService";
import { DashboardTelemetry } from "@/types/analytics";

export default function ProfilePage() {
  const [profile, setProfile] = useState<AuthUserProfile | null>(null);
  const [telemetry, setTelemetry] = useState<DashboardTelemetry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    username: string;
    bio: string;
    location: string;
    timezone: string;
    website: string;
    socialLinks: SocialLinks;
  }>({
    name: "",
    username: "",
    bio: "",
    location: "",
    timezone: "Asia/Karachi",
    website: "",
    socialLinks: {},
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial profile and analytics telemetry
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const user = await authService.getProfile();
      if (isMounted && user) {
        setProfile(user);
        setEditForm({
          name: user.name,
          username: user.username || "",
          bio: user.bio || "",
          location: user.location || "",
          timezone: user.timezone || "Asia/Karachi",
          website: user.website || "",
          socialLinks: user.socialLinks || {},
        });
      }

      try {
        const tele = await analyticsService.getDashboardTelemetry();
        if (isMounted) {
          setTelemetry(tele);
        }
      } catch (err) {
        console.warn("Failed to load telemetry on profile page", err);
      }
    }

    loadData();

    // Subscribe to profile changes across any component
    const unsubProfile = authService.onProfileChange((updated) => {
      if (isMounted) {
        setProfile(updated);
        setEditForm({
          name: updated.name,
          username: updated.username || "",
          bio: updated.bio || "",
          location: updated.location || "",
          timezone: updated.timezone || "Asia/Karachi",
          website: updated.website || "",
          socialLinks: updated.socialLinks || {},
        });
      }
    });

    return () => {
      isMounted = false;
      unsubProfile();
    };
  }, []);

  // Handle avatar upload via file picker
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error & set loading
    setUploadError(null);
    setIsUploading(true);

    try {
      await authService.uploadAvatar(file);
      setSaveSuccess("Profile photo updated successfully!");
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload avatar";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle avatar removal
  const handleRemoveAvatar = async () => {
    if (!confirm("Are you sure you want to reset your profile picture?")) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      await authService.removeAvatar();
      setSaveSuccess("Profile picture reset to default.");
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove avatar";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // Save profile edits
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    try {
      const res = await authService.updateProfile({
        name: editForm.name.trim(),
        username: editForm.username.trim(),
        bio: editForm.bio.trim(),
        location: editForm.location.trim(),
        timezone: editForm.timezone,
        website: editForm.website.trim(),
        socialLinks: editForm.socialLinks,
      });
      if (res.profile) {
        setProfile(res.profile);
      }
      setIsEditing(false);
      setSaveSuccess("Profile updated successfully!");
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save profile changes";
      setUploadError(msg);
    }
  };

  const socials = profile?.socialLinks || {};
  const activeSocials = Object.entries(socials).filter(
    (entry): entry is [string, string] => Boolean(entry[1] && entry[1].trim().length > 0)
  );

  return (
    <div className="min-h-screen bg-surface px-4 sm:px-6 lg:px-8 py-8 text-on-surface">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Feedback alerts */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between animate-in fade-in-50">
            <div className="flex items-center gap-2.5">
              <Icon name="check_circle" size={18} className="text-emerald-400 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
            <button
              onClick={() => setSaveSuccess(null)}
              className="text-emerald-400 hover:text-emerald-300"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )}

        {uploadError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center justify-between animate-in fade-in-50">
            <div className="flex items-center gap-2.5">
              <Icon name="error" size={18} className="text-rose-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="text-rose-400 hover:text-rose-300"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )}

        {/* 1. Profile Hero Header */}
        <section className="relative overflow-hidden rounded-2xl bg-surface-container-low border border-outline-variant/20 p-6 sm:p-8 shadow-xl">
          {/* Subtle ambient gradient mesh */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Profile Avatar with Photo Controls */}
              <div className="relative group shrink-0">
                <div className="relative rounded-2xl overflow-hidden ring-4 ring-primary-container/30 shadow-2xl">
                  <Avatar
                    size="lg"
                    src={profile?.avatarUrl || "/assets/avatar.png"}
                    alt={profile?.name || "User Avatar"}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-surface/80 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Upload & Remove Quick Triggers */}
                <div className="mt-3 flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/20 flex items-center gap-1.5 transition-colors"
                    title="Upload JPG, PNG, or WebP (max 5MB)"
                  >
                    <Icon name="upload" size={13} />
                    <span>Change</span>
                  </button>
                  {profile?.avatarUrl && profile.avatarUrl !== "/assets/avatar.png" && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={isUploading}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center gap-1 transition-colors"
                      title="Reset to default avatar"
                    >
                      <Icon name="delete" size={13} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Identity & Metadata */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold font-headline text-on-surface tracking-tight">
                    {profile?.name || "Afaq Ahmad"}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary text-xs font-mono font-semibold border border-primary-container/30">
                    Pro Creator
                  </span>
                </div>

                <p className="text-sm font-mono text-outline font-medium">
                  @{profile?.username || "afaqahmad"}
                </p>

                <p className="text-sm text-on-surface-variant max-w-xl leading-relaxed">
                  {profile?.bio || "Social media strategist, video editor & fullstack software engineer building digital products."}
                </p>

                {/* Meta details (Location, Website, Timezone) */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-outline pt-1">
                  {profile?.location && (
                    <div className="flex items-center gap-1.5">
                      <Icon name="location_on" size={14} className="text-outline" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Icon name="schedule" size={14} className="text-outline" />
                    <span>{profile?.timezone || "Asia/Karachi"}</span>
                  </div>
                  {profile?.website && (
                    <a
                      href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <Icon name="globe" size={14} />
                      <span className="truncate max-w-[200px]">{profile.website.replace(/^https?:\/\//, "")}</span>
                    </a>
                  )}
                </div>

                {/* Social icons pills (only if populated) */}
                {activeSocials.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {activeSocials.map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url.startsWith("http") ? url : `https://${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/15 flex items-center gap-1.5 text-xs transition-colors"
                        title={platform}
                      >
                        <Icon name={platform} size={14} />
                        <span className="capitalize">{platform}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Profile Action */}
            <div className="shrink-0">
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
                icon="edit"
                className="w-full sm:w-auto"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </section>

        {/* 2. Profile Statistics Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/15 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-outline">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Tasks Completed</span>
              <Icon name="check_circle" size={18} className="text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">
              {telemetry?.completedTasks ?? 14}
            </div>
            <div className="text-xs text-on-surface-variant flex items-center gap-1">
              <span className="text-emerald-400 font-medium">All-time record</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/15 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-outline">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Current Streak</span>
              <Icon name="local_fire_department" size={18} className="text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">
              {telemetry?.productivityMetrics?.currentStreak ?? 12} <span className="text-sm font-sans text-outline font-normal">days</span>
            </div>
            <div className="text-xs text-on-surface-variant flex items-center gap-1">
              <span className="text-amber-400 font-medium">Active daily run</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/15 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-outline">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Productivity Score</span>
              <Icon name="insights" size={18} className="text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">
              {telemetry?.productivityScore ?? 88}<span className="text-base font-normal text-outline">/100</span>
            </div>
            <div className="text-xs text-on-surface-variant flex items-center gap-1">
              <span className="text-cyan-400 font-medium">Optimal flow</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/15 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-outline">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Focus Time</span>
              <Icon name="timer" size={18} className="text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">
              {telemetry?.productivityMetrics?.focusTimeFormatted || "14h 30m"}
            </div>
            <div className="text-xs text-on-surface-variant flex items-center gap-1">
              <span className="text-purple-400 font-medium">Tracked focus telemetry</span>
            </div>
          </div>
        </section>

        {/* 3. Personal Information & Socials Dual Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/15 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Icon name="person" size={18} className="text-primary" />
                Personal Information
              </h2>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-outline uppercase font-mono tracking-wider">Full Name</span>
                <p className="font-semibold text-on-surface mt-0.5">{profile?.name || "Afaq Ahmad"}</p>
              </div>

              <div>
                <span className="text-xs text-outline uppercase font-mono tracking-wider">Username</span>
                <p className="font-mono text-on-surface mt-0.5">@{profile?.username || "afaqahmad"}</p>
              </div>

              <div>
                <span className="text-xs text-outline uppercase font-mono tracking-wider">Email Address</span>
                <p className="font-mono text-on-surface mt-0.5">{profile?.email || "afaqahmadcs@gmail.com"}</p>
              </div>

              <div>
                <span className="text-xs text-outline uppercase font-mono tracking-wider">Bio</span>
                <p className="text-on-surface-variant mt-0.5 leading-relaxed">
                  {profile?.bio || "Social media strategist, video editor & fullstack software engineer building digital products."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-xs text-outline uppercase font-mono tracking-wider">Location</span>
                  <p className="text-on-surface mt-0.5">{profile?.location || "Peshawar, Pakistan"}</p>
                </div>
                <div>
                  <span className="text-xs text-outline uppercase font-mono tracking-wider">Timezone</span>
                  <p className="font-mono text-on-surface mt-0.5">{profile?.timezone || "Asia/Karachi"}</p>
                </div>
              </div>

              <div>
                <span className="text-xs text-outline uppercase font-mono tracking-wider">Personal Website</span>
                <p className="mt-0.5 truncate">
                  {profile?.website ? (
                    <a
                      href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono text-xs flex items-center gap-1"
                    >
                      <span>{profile.website}</span>
                      <Icon name="open_in_new" size={12} />
                    </a>
                  ) : (
                    <span className="text-outline italic text-xs">Not configured</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/15 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Icon name="share" size={18} className="text-cyan-400" />
                Social Profiles
              </h2>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <span>Manage</span>
              </button>
            </div>

            <div className="space-y-3">
              {[
                { key: "youtube", label: "YouTube", icon: "youtube", placeholder: "https://youtube.com/@AfaqAhmad" },
                { key: "instagram", label: "Instagram", icon: "instagram", placeholder: "https://instagram.com/afaqahmad" },
                { key: "tiktok", label: "TikTok", icon: "tiktok", placeholder: "https://tiktok.com/@afaqahmad" },
                { key: "facebook", label: "Facebook", icon: "facebook", placeholder: "https://facebook.com/afaqahmad" },
                { key: "x", label: "X (Twitter)", icon: "x", placeholder: "https://x.com/afaqahmad" },
                { key: "linkedin", label: "LinkedIn", icon: "linkedin", placeholder: "https://linkedin.com/in/afaqahmad" },
                { key: "github", label: "GitHub", icon: "github", placeholder: "https://github.com/afaqahmadcs" },
              ].map(({ key, label, icon, placeholder }) => {
                const url = socials[key as keyof SocialLinks];
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container border border-outline-variant/10 hover:border-outline-variant/25 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="p-1.5 rounded-md bg-surface-container-high text-on-surface-variant group-hover:text-on-surface flex items-center justify-center shrink-0">
                        <Icon name={icon} size={16} />
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-on-surface block leading-tight">
                          {label}
                        </span>
                        <span className="text-[11px] font-mono text-outline truncate block max-w-[240px]">
                          {url || placeholder}
                        </span>
                      </div>
                    </div>

                    {url ? (
                      <a
                        href={url.startsWith("http") ? url : `https://${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-primary-container/20 text-primary hover:bg-primary-container/30 transition-colors flex items-center gap-1 shrink-0"
                      >
                        <span>Visit</span>
                        <Icon name="open_in_new" size={11} />
                      </a>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-outline hover:text-on-surface px-2 py-1 shrink-0"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Preferences & Account Dual Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preferences */}
          <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/15 space-y-4">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2 pb-3 border-b border-outline-variant/15">
              <Icon name="tune" size={18} className="text-amber-400" />
              Workspace Preferences
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container">
                <div>
                  <span className="font-semibold text-on-surface text-xs block">Operating Timezone</span>
                  <span className="text-xs text-outline">{profile?.timezone || "Asia/Karachi"} (PKT UTC+5)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface-container-high text-on-surface-variant">
                  Configured
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container">
                <div>
                  <span className="font-semibold text-on-surface text-xs block">Primary Workspace</span>
                  <span className="text-xs text-outline">Office (8 Social Pages)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-primary-container/20 text-primary">
                  Default
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container">
                <div>
                  <span className="font-semibold text-on-surface text-xs block">Theme Aesthetic</span>
                  <span className="text-xs text-outline">Dark Slate SaaS (Stitch Native)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface-container-high text-on-surface-variant">
                  #0b1326
                </span>
              </div>
            </div>
          </div>

          {/* Account Security & Status */}
          <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/15 space-y-4">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2 pb-3 border-b border-outline-variant/15">
              <Icon name="shield" size={18} className="text-emerald-400" />
              Account & Security
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container">
                <div>
                  <span className="font-semibold text-on-surface text-xs block">Account Identifier</span>
                  <span className="text-xs font-mono text-outline truncate max-w-[200px] block">
                    {profile?.id || "user-afaq-default"}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-400">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container">
                <div>
                  <span className="font-semibold text-on-surface text-xs block">Subscription Plan</span>
                  <span className="text-xs text-outline">TaskFlow Unlimited Multi-Workspace</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-primary-container/20 text-primary">
                  PRO
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container">
                <div>
                  <span className="font-semibold text-on-surface text-xs block">Row Level Security (RLS)</span>
                  <span className="text-xs text-outline">Strict Profile Ownership</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-400">
                  Enforced
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Edit Profile Modal Dialog */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in-50">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-container-low border border-outline-variant/25 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2.5">
                <Icon name="edit" size={20} className="text-primary" />
                <h3 className="text-lg font-bold font-headline text-on-surface">Edit Creator Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                    Username *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-outline text-sm font-mono">@</span>
                    <input
                      type="text"
                      required
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-container"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Describe your creative work and technical focus..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="e.g. Peshawar, Pakistan"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                    Timezone
                  </label>
                  <select
                    value={editForm.timezone}
                    onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                  >
                    <option value="Asia/Karachi">Asia/Karachi (PKT, UTC+5)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="America/New_York">America/New_York (EST/EDT)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                    <option value="UTC">UTC Universal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                  Website URL
                </label>
                <input
                  type="text"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="https://afaqahmad.dev"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>

              {/* Social links configuration */}
              <div className="pt-2 border-t border-outline-variant/15 space-y-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-on-surface">
                  Social Presence Links
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: "youtube", label: "YouTube URL", placeholder: "https://youtube.com/@handle" },
                    { key: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/handle" },
                    { key: "tiktok", label: "TikTok URL", placeholder: "https://tiktok.com/@handle" },
                    { key: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/handle" },
                    { key: "x", label: "X (Twitter) URL", placeholder: "https://x.com/handle" },
                    { key: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/handle" },
                    { key: "github", label: "GitHub URL", placeholder: "https://github.com/handle" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-[11px] font-mono text-outline mb-0.5">
                        {label}
                      </label>
                      <input
                        type="url"
                        value={editForm.socialLinks[key as keyof SocialLinks] || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              [key]: e.target.value,
                            },
                          })
                        }
                        placeholder={placeholder}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/20 text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary-container"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon="check"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
