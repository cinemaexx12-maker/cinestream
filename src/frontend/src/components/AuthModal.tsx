import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  reason?: string;
}

export default function AuthModal({ open, onClose, reason }: AuthModalProps) {
  const { login, loginStatus } = useInternetIdentity();
  const handleLogin = async () => {
    await login();
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        data-ocid="auth.dialog"
        className="bg-popover border-border max-w-sm"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            <span className="text-[#e50914]">CINE</span>STREAM
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {reason ||
              "Sign in to access your watchlist, track progress, and enjoy unlimited streaming."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <Button
            data-ocid="auth.login_button"
            onClick={handleLogin}
            disabled={loginStatus === "logging-in"}
            className="w-full bg-[#e50914] hover:bg-[#c4070f] text-white font-semibold h-12"
          >
            {loginStatus === "logging-in"
              ? "Connecting..."
              : "Sign In with Internet Identity"}
          </Button>
          <Button
            data-ocid="auth.cancel_button"
            variant="ghost"
            onClick={onClose}
            className="w-full text-muted-foreground"
          >
            Continue as Guest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
