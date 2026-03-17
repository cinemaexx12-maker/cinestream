import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ExternalLink, Loader2, RefreshCw, VideoOff, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface TrailerModalProps {
  trailerKey: string | null;
  /** If omitted, modal is open whenever trailerKey is non-null */
  open?: boolean;
  onClose: () => void;
}

export default function TrailerModal({
  trailerKey,
  open: openProp,
  onClose,
}: TrailerModalProps) {
  const open = openProp !== undefined ? openProp : trailerKey !== null;

  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeKeyRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Reset and start timeout when open/trailerKey changes
  useEffect(() => {
    if (open && trailerKey) {
      setIframeLoaded(false);
      setLoadFailed(false);
      timeoutRef.current = setTimeout(() => {
        setLoadFailed(true);
      }, 5000);
    } else {
      clearTimer();
      setIframeLoaded(false);
      setLoadFailed(false);
    }
    return clearTimer;
  }, [open, trailerKey, clearTimer]);

  // Restart timeout on retry (iframeKey bump)
  useEffect(() => {
    if (iframeKey === 0) return;
    clearTimer();
    setIframeLoaded(false);
    setLoadFailed(false);
    timeoutRef.current = setTimeout(() => {
      setLoadFailed(true);
    }, 5000);
    return clearTimer;
  }, [iframeKey, clearTimer]);

  const handleIframeLoad = useCallback(() => {
    clearTimer();
    setIframeLoaded(true);
    setLoadFailed(false);
  }, [clearTimer]);

  const handleRetry = useCallback(() => {
    iframeKeyRef.current += 1;
    setIframeKey(iframeKeyRef.current);
  }, []);

  const handleClose = useCallback(() => {
    clearTimer();
    onClose();
  }, [clearTimer, onClose]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent
        aria-label="Movie Trailer"
        showCloseButton={false}
        className="max-w-3xl w-full p-0 overflow-hidden bg-black border-border"
        data-ocid="trailer.dialog"
      >
        <div className="relative w-full">
          {/* Close button */}
          <button
            type="button"
            data-ocid="trailer.close_button"
            onClick={handleClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* No trailer key */}
          {!trailerKey ? (
            <div
              className="flex flex-col items-center justify-center gap-3 h-64 text-white"
              data-ocid="trailer.error_state"
            >
              <VideoOff className="w-10 h-10 text-white/40" />
              <p className="text-lg font-semibold">Trailer not available</p>
            </div>
          ) : (
            <div
              className="relative w-full"
              style={{ paddingBottom: "56.25%" }}
            >
              {/* Loading spinner */}
              {!iframeLoaded && !loadFailed && (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black"
                  data-ocid="trailer.loading_state"
                >
                  <Loader2 className="w-10 h-10 text-white/60 animate-spin" />
                </div>
              )}

              {/* Load failed state */}
              {loadFailed && (
                <div
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black"
                  data-ocid="trailer.error_state"
                >
                  <VideoOff className="w-10 h-10 text-white/40" />
                  <p className="text-white font-semibold">
                    Video failed to load
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      data-ocid="trailer.retry_button"
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      className="gap-2 border-white/30 text-white hover:bg-white/10"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retry
                    </Button>
                    <a
                      data-ocid="trailer.secondary_button"
                      href={`https://www.youtube.com/watch?v=${trailerKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              )}

              {/* iframe — key forces remount on retry */}
              <iframe
                key={iframeKey}
                src={`https://www.youtube.com/embed/${trailerKey}?mute=1&controls=1&rel=0`}
                title="Movie Trailer"
                onLoad={handleIframeLoad}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                  opacity: iframeLoaded ? 1 : 0,
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
