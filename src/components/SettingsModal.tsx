import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X, Volume2, VolumeX, Bell } from "lucide-react";
import { signOut } from "next-auth/react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/push-utils";

export default function SettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isChangingPush, setIsChangingPush] = useState(false);

  useEffect(() => {
    // Check initial notification state when modal opens
    if (isOpen && "serviceWorker" in navigator && "Notification" in window) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setNotificationsEnabled(!!sub);
        });
      });
    }

    if (isOpen && typeof window !== "undefined") {
      const stored = window.localStorage.getItem("soundEnabled");
      setSoundEnabled(stored !== "false");
    }
  }, [isOpen]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("soundEnabled", String(next));
    }
  };

  const handleToggleNotifications = async () => {
    try {
      setIsChangingPush(true);
      if (!notificationsEnabled) {
        // Request permission if needed
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          await subscribeToPush();
          setNotificationsEnabled(true);
        } else {
          alert("You need to allow notifications in your browser settings.");
        }
      } else {
        await unsubscribeFromPush();
        setNotificationsEnabled(false);
      }
    } catch (err) {
      console.error("Failed to toggle push notifications:", err);
      alert("Something went wrong toggling notifications.");
    } finally {
      setIsChangingPush(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[var(--color-white)] w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
          >
            <div className="bg-[var(--color-slate-800)] text-[var(--color-white)] p-6 relative flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-[var(--color-white)]/20 hover:bg-[var(--color-white)]/30 rounded-full transition-colors text-[var(--color-white)]"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-black mb-1">Settings</h2>
              <p className="text-[var(--color-indigo-200)] text-sm font-medium">
                Manage your preferences
              </p>
            </div>

            <div className="p-6 overflow-y-auto pb-safe">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-[var(--color-slate-400)] uppercase tracking-wider mb-3 ml-2">
                    App Appearance
                  </h3>
                  <ThemeSwitcher />
                </div>

                <div>
                  <h3 className="text-sm font-black text-[var(--color-slate-400)] uppercase tracking-wider mb-3 ml-2">
                    Preferences
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-[var(--color-white)] rounded-2xl p-4 shadow-[0_4px_0_var(--color-button-shadow)] border-2 border-[var(--color-gray-100)] flex items-center justify-between transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--color-indigo-100)] text-[var(--color-indigo-500)] rounded-xl">
                          {soundEnabled ? (
                            <Volume2 size={24} />
                          ) : (
                            <VolumeX size={24} />
                          )}
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-[var(--color-slate-800)]">
                            Sound Effects
                          </h4>
                          <p className="text-[var(--color-slate-500)] text-xs font-medium">
                            Toggle app sounds
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={soundEnabled}
                          onChange={toggleSound}
                        />
                        <div className="w-11 h-6 bg-[var(--color-gray-200)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-indigo-500)]"></div>
                      </label>
                    </div>

                    <div className="bg-[var(--color-white)] rounded-2xl p-4 shadow-[0_4px_0_var(--color-button-shadow)] border-2 border-[var(--color-gray-100)] flex flex-col gap-3 transition-all relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-[var(--color-indigo-100)] text-[var(--color-indigo-500)] rounded-xl">
                            <Bell size={24} />
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-[var(--color-slate-800)]">
                              Push Notifications
                            </h4>
                            <p className="text-[var(--color-slate-500)] text-xs font-medium">
                              Updates and reminders
                            </p>
                          </div>
                        </div>
                        <label className={`relative inline-flex items-center ${isChangingPush ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={notificationsEnabled}
                            onChange={handleToggleNotifications}
                            disabled={isChangingPush}
                          />
                          <div className="w-11 h-6 bg-[var(--color-gray-200)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-indigo-500)]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-[var(--color-slate-400)] uppercase tracking-wider mb-3 ml-2">
                    Account
                  </h3>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full bg-[#fee2e2] rounded-2xl p-4 border-2 border-red-200 active:translate-y-1 transition-all flex items-center justify-center gap-3 cursor-pointer text-red-600 font-bold"
                  >
                    <LogOut size={20} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
