"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const ImageEditor = dynamic(() => import("@unlayer/react-image-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[700px] items-center justify-center bg-[#101010]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-1.5 w-40 overflow-hidden bg-white/10">
          <div className="h-full w-1/2 animate-pulse bg-fuchsia-500" />
        </div>
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30">
          Loading Editor...
        </p>
      </div>
    </div>
  ),
});

type Screen =
  | "landing"
  | "jobs"
  | "upload"
  | "editor"
  | "transmitting"
  | "deployed";

type ShareState = "idle" | "sharing" | "copied" | "unsupported";

type MissionState = {
  screen: "deployed";
  editedImage: string;
  mission: string;
  location: string;
  time: string;
  completed: boolean;
};

const STORAGE_KEY = "vice-signal-mission";
const DEFAULT_MISSION_IMAGE = "/images/street-race.jpg";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [editedBlob, setEditedBlob] = useState<Blob | null>(null);
  const [missionState, setMissionState] = useState<MissionState | null>(null);
  const [transmissionProgress, setTransmissionProgress] = useState(0);
  const [billboardActive, setBillboardActive] = useState(false);
  const [sourceImage, setSourceImage] = useState<string>(DEFAULT_MISSION_IMAGE);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [shareState, setShareState] = useState<ShareState>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  /*
   * Restore completed mission after refresh
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed: MissionState = JSON.parse(saved);

      if (parsed.completed && parsed.screen === "deployed" && parsed.editedImage) {
        setMissionState(parsed);
        setEditedImage(parsed.editedImage);
        setScreen("deployed");
      }
    } catch (error) {
      console.error("Failed to restore mission:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /*
   * Transmission animation
   */
  useEffect(() => {
    if (screen !== "transmitting") return;

    setTransmissionProgress(0);
    setBillboardActive(false);

    const duration = 3200;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = window.setInterval(() => {
      currentStep += 1;
      const progress = Math.min(100, Math.round((currentStep / steps) * 100));
      setTransmissionProgress(progress);
      if (progress >= 100) {
        window.clearInterval(interval);
      }
    }, intervalTime);

    const timeout = window.setTimeout(() => {
      setTransmissionProgress(100);
      setScreen("deployed");
    }, 3700);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [screen]);

  /*
   * Billboard power-on reveal
   */
  useEffect(() => {
    if (screen !== "deployed") {
      setBillboardActive(false);
      return;
    }

    setBillboardActive(false);

    const timeout = window.setTimeout(() => {
      setBillboardActive(true);
    }, 900);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [screen]);

  /*
   * Clear mission
   */
  const clearMission = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear mission:", error);
    }

    setMissionState(null);
    setEditedImage(null);
    setEditedBlob(null);
    setTransmissionProgress(0);
    setBillboardActive(false);
    setSourceImage(DEFAULT_MISSION_IMAGE);
    setUploadError(null);
    setShareState("idle");
  };

  /*
   * Handle photo upload
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Unsupported file. Upload a JPG, PNG, or WEBP image.");
      return;
    }

    const maxSizeBytes = 8 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError("File too large. Keep it under 8MB.");
      return;
    }

    setUploadError(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSourceImage(reader.result);
      }
    };
    reader.onerror = () => {
      setUploadError("Could not read that file. Try another image.");
    };
    reader.readAsDataURL(file);
  };

  /*
   * Handle share
   */
  const handleShare = async () => {
    setShareState("sharing");

    try {
      if (editedBlob && navigator.canShare) {
        const file = new File([editedBlob], "vice-signal-broadcast.png", {
          type: editedBlob.type || "image/png",
        });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Vice Signal",
            text: "My mission signal just went live on the network.",
            files: [file],
          });
          setShareState("idle");
          return;
        }
      }

      if (navigator.share) {
        await navigator.share({
          title: "Vice Signal",
          text: "My mission signal just went live on the network.",
          url: window.location.href,
        });
        setShareState("idle");
        return;
      }

      if (navigator.clipboard && editedImage) {
        await navigator.clipboard.writeText(window.location.href);
        setShareState("copied");
        window.setTimeout(() => setShareState("idle"), 2500);
        return;
      }

      setShareState("unsupported");
      window.setTimeout(() => setShareState("idle"), 2500);
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") {
        console.error("Share failed:", error);
      }
      setShareState("idle");
    }
  };

  /*
   * LANDING
   */
  if (screen === "landing") {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-600/10 blur-[140px]" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />
          </div>

          <div className="relative z-10 w-full max-w-5xl px-6 py-20">
            <div className="mb-20 flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-white/40">
              <span>Private Transmission</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.9)]" />
                Signal Active
              </span>
            </div>

            <div className="max-w-4xl">
              <p className="mb-5 text-xs uppercase tracking-[0.45em] text-fuchsia-400">
                Signal Network
              </p>

              <h1 className="text-6xl font-black uppercase leading-[0.82] tracking-[-0.06em] sm:text-8xl md:text-[10rem]">
                Vice
                <br />
                <span className="text-white/20">Signal</span>
              </h1>

              <div className="mt-12 max-w-xl border-l border-fuchsia-500/40 pl-5">
                <p className="text-lg leading-relaxed text-white/60">
                  Someone needs a message distributed across the city.
                  Someone needs you.
                </p>
              </div>

              <button
                onClick={() => setScreen("jobs")}
                className="group mt-12 flex items-center gap-5 border border-white/20 bg-white/[0.03] px-7 py-4 text-xs font-bold uppercase tracking-[0.25em] transition hover:border-fuchsia-500 hover:bg-fuchsia-500 hover:text-black"
              >
                <span>Accept the Job</span>
                <span className="transition-transform group-hover:translate-x-2">
                  →
                </span>
              </button>
            </div>

            <div className="mt-24 flex items-center justify-between border-t border-white/10 pt-5 text-[9px] uppercase tracking-[0.3em] text-white/30">
              <span>Signal Network // 03:47 AM</span>
              <span>Encrypted Channel</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * JOB SELECTION
   */
  if (screen === "jobs") {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto min-h-screen max-w-6xl px-6 py-8">
          <header className="flex items-center justify-between border-b border-white/10 pb-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-white/30">
                Signal Network
              </p>
              <h1 className="mt-1 text-xl font-black uppercase tracking-tight">
                Vice Signal
              </h1>
            </div>

            <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.25em] text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
              Connection Established
            </div>
          </header>

          <section className="py-20">
            <div className="mb-14">
              <p className="text-[10px] uppercase tracking-[0.4em] text-fuchsia-400">
                Available Jobs
              </p>
              <h2 className="mt-3 text-5xl font-black uppercase tracking-[-0.04em]">
                Choose Your Job
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/40">
                Select an assignment. Complete the transmission. Make the
                city notice.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <button
                onClick={() => setScreen("upload")}
                className="group relative min-h-[390px] overflow-hidden border border-fuchsia-500/40 bg-white/[0.025] text-left transition hover:border-fuchsia-400 hover:bg-fuchsia-500/[0.04]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-45 transition duration-700 group-hover:scale-105 group-hover:opacity-60"
                  style={{ backgroundImage: `url('${DEFAULT_MISSION_IMAGE}')` }}
                />

                <div className="relative flex min-h-[390px] flex-col justify-between p-7">
                  <div className="flex items-center justify-between">
                    <span className="border border-fuchsia-500/40 bg-black/50 px-3 py-1 text-[8px] uppercase tracking-[0.3em] text-fuchsia-300">
                      Active
                    </span>
                    <span className="text-[9px] text-white/30">001</span>
                  </div>

                  <div>
                    <p className="mb-2 text-[9px] uppercase tracking-[0.3em] text-fuchsia-400">
                      Mission
                    </p>
                    <h3 className="text-3xl font-black uppercase">
                      Midnight Run
                    </h3>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/40">
                      Ocean Drive // 02:00 AM
                    </p>
                    <div className="mt-7 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.25em] text-white/50 transition group-hover:text-white">
                      <span>Accept Mission</span>
                      <span className="transition-transform group-hover:translate-x-2">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              <div className="relative min-h-[390px] overflow-hidden border border-white/10 bg-white/[0.02] opacity-60">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,70,239,0.08),transparent_40%)]" />
                <div className="relative flex min-h-[390px] flex-col justify-between p-7">
                  <div className="flex items-center justify-between">
                    <span className="border border-white/10 px-3 py-1 text-[8px] uppercase tracking-[0.3em] text-white/30">
                      Coming Soon
                    </span>
                    <span className="text-[9px] text-white/20">002</span>
                  </div>
                  <div>
                    <p className="mb-2 text-[9px] uppercase tracking-[0.3em] text-white/20">
                      Mission
                    </p>
                    <h3 className="text-3xl font-black uppercase text-white/30">
                      Club Opening
                    </h3>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/20">
                      Location Classified
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[390px] overflow-hidden border border-white/10 bg-white/[0.02] opacity-60">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(217,70,239,0.08),transparent_40%)]" />
                <div className="relative flex min-h-[390px] flex-col justify-between p-7">
                  <div className="flex items-center justify-between">
                    <span className="border border-white/10 px-3 py-1 text-[8px] uppercase tracking-[0.3em] text-white/30">
                      Coming Soon
                    </span>
                    <span className="text-[9px] text-white/20">003</span>
                  </div>
                  <div>
                    <p className="mb-2 text-[9px] uppercase tracking-[0.3em] text-white/20">
                      Mission
                    </p>
                    <h3 className="text-3xl font-black uppercase text-white/30">
                      New Business
                    </h3>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/20">
                      Location Classified
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="border-t border-white/10 py-5 text-[9px] uppercase tracking-[0.3em] text-white/20">
            Vice Signal Network / Choose Carefully
          </footer>
        </div>
      </main>
    );
  }

  /*
   * PHOTO UPLOAD
   */
  if (screen === "upload") {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-20">
          <div className="mb-2 flex items-center justify-between text-[9px] uppercase tracking-[0.3em] text-white/30">
            <span>Signal Network</span>
            <span className="flex items-center gap-2 text-fuchsia-400">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
              Intake Required
            </span>
          </div>

          <p className="mt-10 text-[10px] uppercase tracking-[0.4em] text-fuchsia-400">
            Step 1 of 2
          </p>

          <h1 className="mt-3 text-5xl font-black uppercase tracking-[-0.03em] sm:text-6xl">
            Submit Your Photo
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/50">
            The network needs an image to broadcast. Upload your own photo
            to customize this mission, or skip and use the default signal
            image.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="mt-10 border border-dashed border-white/20 bg-white/[0.02] p-8">
            {sourceImage !== DEFAULT_MISSION_IMAGE ? (
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <div className="h-32 w-32 shrink-0 overflow-hidden border border-fuchsia-500/40 bg-black">
                  <img
                    src={sourceImage}
                    alt="Uploaded preview"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-green-400">
                    Photo Received
                  </p>
                  <p className="mt-2 text-sm text-white/60">
                    Your photo is locked in for this mission.
                  </p>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 text-[9px] font-bold uppercase tracking-[0.25em] text-white/40 underline underline-offset-4 transition hover:text-white"
                  >
                    Choose a Different Photo
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-3 py-10 text-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-fuchsia-500/40 text-xl text-fuchsia-400">
                  ↑
                </span>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                  Tap to Upload a Photo
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                  JPG, PNG, or WEBP — up to 8MB
                </span>
              </button>
            )}
          </div>

          {uploadError && (
            <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-red-400">
              {uploadError}
            </p>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setScreen("jobs")}
              className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30 transition hover:text-white"
            >
              ← Back to Jobs
            </button>

            <div className="flex items-center gap-4">
              {sourceImage === DEFAULT_MISSION_IMAGE && (
                <button
                  onClick={() => setScreen("editor")}
                  className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/40 underline underline-offset-4 transition hover:text-white"
                >
                  Skip — Use Default Photo
                </button>
              )}

              <button
                onClick={() => setScreen("editor")}
                className="group flex items-center gap-4 border border-white/20 bg-white/[0.03] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] transition hover:border-fuchsia-500 hover:bg-fuchsia-500 hover:text-black"
              >
                <span>Continue to Editor</span>
                <span className="transition-transform group-hover:translate-x-2">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * IMAGE EDITOR
   */
  if (screen === "editor") {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-5">
              <div>
                <p className="text-[8px] uppercase tracking-[0.35em] text-white/30">
                  Vice Signal
                </p>
                <p className="text-sm font-black uppercase">Signal 001</p>
              </div>

              <div className="hidden h-5 w-px bg-white/10 sm:block" />

              <p className="hidden text-[9px] uppercase tracking-[0.25em] text-fuchsia-400 sm:block">
                Operation Midnight Run
              </p>
            </div>

            <button
              onClick={() => {
                clearMission();
                setScreen("jobs");
              }}
              className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30 transition hover:text-white"
            >
              Abort Mission
            </button>
          </header>

          <div className="flex flex-1 flex-col lg:flex-row">
            <aside className="w-full border-b border-white/10 bg-[#080808] lg:w-[300px] lg:border-b-0 lg:border-r">
              <div className="p-6 lg:sticky lg:top-0">
                <div className="mb-10">
                  <p className="text-[9px] uppercase tracking-[0.35em] text-fuchsia-400">
                    Mission
                  </p>
                  <h2 className="mt-3 text-2xl font-black uppercase leading-none">
                    Make the city notice.
                  </h2>
                </div>

                <div className="space-y-7">
                  <div>
                    <p className="mb-2 text-[8px] uppercase tracking-[0.3em] text-white/25">
                      Transmission Data
                    </p>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/30">Mission</span>
                        <span>Midnight Run</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/30">Location</span>
                        <span>Ocean Drive</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/30">Time</span>
                        <span>02:00 AM</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/30">Source</span>
                        <span>
                          {sourceImage === DEFAULT_MISSION_IMAGE
                            ? "Default Signal"
                            : "User Upload"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[8px] uppercase tracking-[0.3em] text-white/25">
                      Requirements
                    </p>

                    <div className="space-y-3 text-[10px] uppercase tracking-[0.12em] text-white/50">
                      <div className="flex items-start gap-3">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
                        <span>Customize the image</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
                        <span>Make it yours</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
                        <span>Broadcast the signal</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-5">
                    <div className="flex items-center gap-2 text-[8px] uppercase tracking-[0.25em] text-green-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                      Network Connected
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <section className="min-w-0 flex-1 bg-[#101010]">
              <div className="h-full min-h-[700px]">
                <ImageEditor
                  image={sourceImage}
                  minHeight={700}
                  options={{
                    projectId: 289665,
                    theme: "light",
                    features: {
                      ai: {
                        enabled: true,
                        assistant: true,
                      },
                    },
                  }}
                  onSave={({ dataUrl, blob }) => {
                    if (!dataUrl) {
                      console.error("Unlayer did not return an image data URL.");
                      return;
                    }

                    const completedMission: MissionState = {
                      screen: "deployed",
                      editedImage: dataUrl,
                      mission: "Midnight Run",
                      location: "Ocean Drive",
                      time: "02:00 AM",
                      completed: true,
                    };

                    try {
                      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedMission));
                    } catch (error) {
                      console.error("Could not persist mission to localStorage:", error);
                    }

                    setEditedImage(dataUrl);
                    setEditedBlob(blob ?? null);
                    setMissionState(completedMission);
                    setScreen("transmitting");
                  }}
                  onCancel={() => {
                    clearMission();
                    setScreen("jobs");
                  }}
                  onLoadError={() => {
                    console.error("Image could not be loaded (CORS, 404, or decode error).");
                  }}
                  onError={(error) => {
                    console.error("Embed script or editor instance failed to load:", error);
                  }}
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  /*
   * TRANSMITTING
   */
  if (screen === "transmitting") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-600/10 blur-[160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.9)_80%)]" />
        </div>

        <div className="relative z-10 w-full max-w-2xl px-6">
          <div className="mb-16 flex items-center justify-between border-b border-white/10 pb-5 text-[9px] uppercase tracking-[0.3em]">
            <span className="text-white/30">Signal Network</span>
            <span className="flex items-center gap-2 text-fuchsia-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fuchsia-500" />
              Transmitting
            </span>
          </div>

          <div className="text-center">
            <p className="text-[9px] uppercase tracking-[0.5em] text-fuchsia-400">
              Routing Broadcast
            </p>
            <h1 className="mt-5 text-6xl font-black uppercase tracking-[-0.05em] sm:text-8xl">
              Downtown
            </h1>
            <p className="mx-auto mt-7 max-w-md text-sm leading-relaxed text-white/40">
              Your signal is being routed through the network. Stay
              connected.
            </p>
          </div>

          <div className="mt-20">
            <div className="mb-3 flex items-center justify-between text-[9px] uppercase tracking-[0.25em]">
              <span className="text-white/30">Transmission Progress</span>
              <span className="text-fuchsia-400">{transmissionProgress}%</span>
            </div>

            <div className="h-[2px] w-full overflow-hidden bg-white/10">
              <div
                className="h-full bg-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.8)] transition-all duration-100"
                style={{ width: `${transmissionProgress}%` }}
              />
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-3">
            <div
              className={`border p-4 transition ${
                transmissionProgress >= 20
                  ? "border-fuchsia-500/40 bg-fuchsia-500/[0.04]"
                  : "border-white/10"
              }`}
            >
              <p className="text-[8px] uppercase tracking-[0.2em] text-white/25">01</p>
              <p
                className={`mt-2 text-[9px] uppercase tracking-[0.15em] ${
                  transmissionProgress >= 20 ? "text-fuchsia-300" : "text-white/30"
                }`}
              >
                Image Locked
              </p>
            </div>

            <div
              className={`border p-4 transition ${
                transmissionProgress >= 55
                  ? "border-fuchsia-500/40 bg-fuchsia-500/[0.04]"
                  : "border-white/10"
              }`}
            >
              <p className="text-[8px] uppercase tracking-[0.2em] text-white/25">02</p>
              <p
                className={`mt-2 text-[9px] uppercase tracking-[0.15em] ${
                  transmissionProgress >= 55 ? "text-fuchsia-300" : "text-white/30"
                }`}
              >
                Signal Routed
              </p>
            </div>

            <div
              className={`border p-4 transition ${
                transmissionProgress >= 85
                  ? "border-fuchsia-500/40 bg-fuchsia-500/[0.04]"
                  : "border-white/10"
              }`}
            >
              <p className="text-[8px] uppercase tracking-[0.2em] text-white/25">03</p>
              <p
                className={`mt-2 text-[9px] uppercase tracking-[0.15em] ${
                  transmissionProgress >= 85 ? "text-fuchsia-300" : "text-white/30"
                }`}
              >
                Broadcast Ready
              </p>
            </div>
          </div>

          <div className="mt-10 text-center text-[8px] uppercase tracking-[0.3em] text-white/20">
            Secure connection established
          </div>
        </div>
      </main>
    );
  }

  /*
   * DEPLOYED / BILLBOARD
   */
  if (screen === "deployed") {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#080313_0%,#12051a_35%,#26091f_62%,#050505_100%)]" />
          <div className="absolute right-[12%] top-[12%] h-24 w-24 rounded-full bg-white/80 shadow-[0_0_80px_rgba(255,255,255,0.25)]" />
          <div className="absolute left-1/2 top-[40%] h-64 w-[700px] -translate-x-1/2 rounded-full bg-fuchsia-600/20 blur-[120px]" />

          <div className="absolute bottom-[25%] left-0 right-0 flex h-40 items-end gap-1 opacity-80">
            {Array.from({ length: 42 }).map((_, index) => (
              <div
                key={index}
                className="relative flex-1 bg-[#080808]"
                style={{ height: `${35 + ((index * 17) % 65)}%` }}
              >
                {Array.from({ length: 2 + (index % 4) }).map((_, windowIndex) => (
                  <span
                    key={windowIndex}
                    className="absolute left-1/2 h-1 w-1 -translate-x-1/2 bg-fuchsia-400/40"
                    style={{ top: `${18 + windowIndex * 22}%` }}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="absolute bottom-[24%] left-0 right-0 h-px bg-fuchsia-500/40 shadow-[0_0_20px_rgba(217,70,239,0.8)]" />

          <div className="absolute bottom-0 left-0 right-0 h-[26%] bg-[#030303]">
            <div className="absolute left-1/2 top-1/2 h-px w-[70%] -translate-x-1/2 bg-white/10" />
            <div className="absolute left-1/2 top-[65%] h-px w-[30%] -translate-x-1/2 bg-white/10" />
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.7)_100%)]" />
        </div>

        <header className="relative z-20 flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-8">
          <div>
            <p className="text-[8px] uppercase tracking-[0.35em] text-white/30">
              Signal Network
            </p>
            <p className="mt-1 text-sm font-black uppercase">Vice Signal</p>
          </div>

          <div className="flex items-center gap-2 text-[8px] uppercase tracking-[0.3em] text-fuchsia-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.9)]" />
            Broadcast Active
          </div>
        </header>

        <section className="relative z-10 mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-24">
          <div>
            <p className="text-[9px] uppercase tracking-[0.45em] text-fuchsia-400">
              Transmission Complete
            </p>

            <h1 className="mt-6 text-6xl font-black uppercase leading-[0.84] tracking-[-0.06em] sm:text-8xl">
              The city
              <br />
              <span className="text-white/25">knows.</span>
            </h1>

            <p className="mt-9 max-w-lg text-sm leading-relaxed text-white/50">
              Your customized signal has been broadcast across downtown.
              The image you created is now live on the network.
            </p>

            <div className="mt-10 grid max-w-md grid-cols-2 border-y border-white/10">
              <div className="border-r border-white/10 py-5 pr-5">
                <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                  Mission
                </p>
                <p className="mt-2 text-sm font-bold uppercase">
                  {missionState?.mission ?? "Midnight Run"}
                </p>
              </div>

              <div className="py-5 pl-5">
                <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                  Location
                </p>
                <p className="mt-2 text-sm font-bold uppercase">
                  {missionState?.location ?? "Ocean Drive"}
                </p>
              </div>
            </div>

            <div className="mt-10 flex max-w-md items-center justify-between border border-white/10 bg-black/30 p-5">
              <div>
                <p className="text-[8px] uppercase tracking-[0.3em] text-white/25">
                  Operator
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em]">
                  Signal 001
                </p>
              </div>

              <div className="text-right">
                <p className="text-[8px] uppercase tracking-[0.3em] text-white/25">
                  Status
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-green-400">
                  Deployment Confirmed
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  clearMission();
                  setScreen("jobs");
                }}
                className="group flex items-center gap-5 border border-white/20 bg-white/[0.03] px-6 py-4 text-[9px] font-bold uppercase tracking-[0.25em] transition hover:border-fuchsia-500 hover:bg-fuchsia-500 hover:text-black"
              >
                <span>Take Another Job</span>
                <span className="transition-transform group-hover:translate-x-2">
                  →
                </span>
              </button>

              {editedImage && (
                
                  <a
                  href={editedImage}
                  download="vice-signal-broadcast.png"
                  className="flex items-center gap-3 border border-fuchsia-500/40 bg-fuchsia-500/[0.06] px-6 py-4 text-[9px] font-bold uppercase tracking-[0.25em] text-fuchsia-300 transition hover:bg-fuchsia-500 hover:text-black"
                >
                  <span>Save Signal</span>
                  <span>↓</span>
                </a>
              )}

              {editedImage && (
                <button
                  onClick={handleShare}
                  disabled={shareState === "sharing"}
                  className="flex items-center gap-3 border border-white/20 bg-white/[0.03] px-6 py-4 text-[9px] font-bold uppercase tracking-[0.25em] text-white/70 transition hover:border-white hover:bg-white hover:text-black disabled:opacity-40"
                >
                  <span>
                    {shareState === "copied"
                      ? "Link Copied"
                      : shareState === "unsupported"
                      ? "Sharing Unavailable"
                      : shareState === "sharing"
                      ? "Opening…"
                      : "Share Signal"}
                  </span>
                  <span>↗</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-white/30">
                  Live Billboard
                </p>
                <p className="mt-1 text-xs font-bold uppercase">
                  Downtown // 03:52 AM
                </p>
              </div>

              <div className="flex items-center gap-2 text-[8px] uppercase tracking-[0.25em] text-fuchsia-400">
                <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
                Live
              </div>
            </div>

            <div className="relative mx-auto max-w-2xl">
              <div className="absolute -top-4 left-0 right-0 z-10 flex justify-around px-8">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-2.5 w-2.5 rounded-full bg-fuchsia-300 transition-all duration-700 ${
                      billboardActive
                        ? "shadow-[0_0_18px_rgba(217,70,239,0.9)]"
                        : "opacity-30"
                    }`}
                  />
                ))}
              </div>

              <div
                className={`relative overflow-hidden border-8 border-[#161616] bg-black p-3 shadow-2xl transition-all duration-1000 ${
                  billboardActive ? "shadow-[0_0_80px_rgba(217,70,239,0.18)]" : "shadow-none"
                }`}
              >
                <div
                  className={`relative aspect-video overflow-hidden bg-black transition-all duration-1000 ${
                    billboardActive ? "brightness-100" : "brightness-[0.08]"
                  }`}
                >
                  {editedImage ? (
                    <img
                      src={editedImage}
                      alt="Broadcasted mission artwork"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[9px] uppercase tracking-[0.3em] text-white/20">
                      Signal Unavailable
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:100%_4px]" />

                  <div
                    className={`pointer-events-none absolute inset-0 bg-fuchsia-500/10 mix-blend-screen transition-opacity duration-1000 ${
                      billboardActive ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  <div className="absolute left-4 top-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 text-[7px] font-bold uppercase tracking-[0.25em] backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.9)]" />
                    Live Signal
                  </div>
                </div>

                <div className="flex items-center justify-between px-1 pt-3 text-[7px] uppercase tracking-[0.25em] text-white/25">
                  <span>Broadcast 001</span>
                  <span>{missionState?.mission ?? "Midnight Run"}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        key={index}
                        className={`h-2 w-1 ${
                          billboardActive && index < 4 ? "bg-fuchsia-400" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {["Downtown", "Ocean Drive", "Night District"].map((location) => (
                <div key={location} className="border border-white/10 bg-black/20 p-4">
                  <p className="text-[7px] uppercase tracking-[0.2em] text-white/25">
                    Location
                  </p>
                  <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.12em]">
                    {location}
                  </p>
                  <p className="mt-3 text-[7px] uppercase tracking-[0.2em] text-green-400">
                    Received
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="relative z-10 border-t border-white/10 px-5 py-5 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between text-[8px] uppercase tracking-[0.3em] text-white/20">
            <span>Vice Signal Network</span>
            <span>Transmission Encrypted</span>
          </div>
        </footer>
      </main>
    );
  }

  return null;
}

