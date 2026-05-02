import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone === true);
    if (isStandalone) return;

    // Check if dismissed before
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed) return;

    // Detect iOS
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    if (ios) {
      setIsIOS(true);
      setTimeout(() => setShowBanner(true), 3000);
      return;
    }

    // Listen for install prompt (Android/Desktop Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    localStorage.setItem("pwa-banner-dismissed", "1");
  };

  if (isDismissed || !showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
        style={{ translateX: "-50%" }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div
          className="bg-card border border-primary/40 rounded-2xl p-4 shadow-2xl glow-box-orange"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.12 0.04 265), oklch(0.15 0.06 280))",
          }}
        >
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
              <img
                src="/icon/icon-192.png"
                alt="App Icon"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <div
                className="font-bold text-sm text-primary"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                Install Sistem Rekod
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isIOS
                  ? 'Tap "Share" → "Add to Home Screen" untuk install'
                  : "Install app di peranti anda untuk akses lebih cepat"}
              </div>
            </div>
          </div>

          {isIOS ? (
            <div className="mt-3 flex items-center gap-2 bg-muted/30 rounded-lg p-2 text-xs text-muted-foreground">
              <Smartphone size={14} className="text-primary shrink-0" />
              <span>
                Tap{" "}
                <span className="text-primary font-bold">
                  Share ↑
                </span>{" "}
                kemudian{" "}
                <span className="text-primary font-bold">
                  Add to Home Screen
                </span>
              </span>
            </div>
          ) : (
            <Button
              onClick={handleInstall}
              size="sm"
              className="mt-3 w-full glow-box-orange font-bold"
            >
              <Download size={15} /> Install App Sekarang
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
