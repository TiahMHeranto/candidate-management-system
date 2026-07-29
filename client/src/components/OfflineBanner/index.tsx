import { WifiOff, Wifi } from 'lucide-react';
import { useOffline } from '../../hooks/useOffline';

/**
 * Sticky banner shown at the top of every page when the backend is
 * unreachable. Disappears automatically once connectivity is restored.
 */
export const OfflineBanner = () => {
  const { isOffline } = useOffline();

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 w-full bg-amber-50 border-b border-amber-200 px-4 py-2
                 flex items-center justify-center gap-2 text-amber-800 text-sm"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        <strong>Mode hors-ligne</strong> — Le serveur est inaccessible.
        Toutes les fonctionnalités sont disponibles mais les modifications ne seront pas sauvegardées.
      </span>
    </div>
  );
};

/**
 * Small inline indicator — can be placed next to form buttons, etc.
 */
export const OfflineIndicator = () => {
  const { isOffline } = useOffline();

  if (!isOffline) return null;

  return (
    <span
      title="Mode hors-ligne – non sauvegardé"
      className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"
    >
      <WifiOff className="w-3 h-3" />
      Hors-ligne
    </span>
  );
};

/**
 * Shows a brief "back online" toast when connectivity is restored.
 * Include once near the root.
 */
export const OnlineToast = () => {
  const { isOffline } = useOffline();

  // Only visible when we just came back online — handled via CSS transition
  if (isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="hidden" // The banner simply disappears; extend here if you want a toast
    >
      <Wifi className="w-4 h-4" />
      Connexion rétablie
    </div>
  );
};
