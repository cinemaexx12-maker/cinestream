import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useActor } from "../hooks/useActor";
import { useSubscriptionMutations } from "../hooks/useQueries";

export default function SubscriptionSuccessPage() {
  const search = useSearch({ from: "/subscription/success" }) as {
    plan?: string;
    session_id?: string;
  };
  const { actor } = useActor();
  const { saveSubscription } = useSubscriptionMutations();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [planName, setPlanName] = useState("");

  useEffect(() => {
    const verify = async () => {
      const sessionId = search.session_id;
      const plan = search.plan ?? "basic";
      if (!sessionId || !actor) {
        setStatus("error");
        return;
      }
      try {
        const result = await actor.getStripeSessionStatus(sessionId);
        if (result.__kind__ === "completed") {
          await saveSubscription.mutateAsync({
            plan,
            paymentId: sessionId,
            startDate: BigInt(Math.floor(Date.now() / 1000)),
            expiryDate: BigInt(
              Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
            ),
          });
          setPlanName(plan.charAt(0).toUpperCase() + plan.slice(1));
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };
    if (actor) {
      verify();
    }
  }, [actor, search.session_id, search.plan, saveSubscription.mutateAsync]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20 px-4 flex flex-col items-center justify-center">
        {status === "loading" && (
          <div
            className="flex flex-col items-center gap-4"
            data-ocid="subscription.loading_state"
          >
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">
              Verifying your subscription...
            </p>
          </div>
        )}

        {status === "success" && (
          <div
            className="flex flex-col items-center gap-6 text-center max-w-md"
            data-ocid="subscription.success_state"
          >
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <div>
              <h1 className="font-display font-black text-4xl text-foreground mb-2">
                Welcome to CineStream {planName}!
              </h1>
              <p className="text-lg text-muted-foreground">
                Your subscription is now active. Enjoy unlimited streaming.
              </p>
            </div>
            <Link to="/">
              <Button className="bg-[#e50914] hover:bg-[#c4070f] text-white font-black text-lg px-10 py-6 rounded-xl">
                Start Watching →
              </Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div
            className="flex flex-col items-center gap-6 text-center max-w-md"
            data-ocid="subscription.error_state"
          >
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <div>
              <h1 className="font-display font-black text-3xl text-foreground mb-2">
                Payment Incomplete
              </h1>
              <p className="text-muted-foreground">
                We couldn&apos;t verify your payment. Please try again or
                contact support.
              </p>
            </div>
            <Link to="/subscription">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8">
                Try Again
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
