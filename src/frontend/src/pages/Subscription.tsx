import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Check, Crown, Loader2, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useStripeCheckout, useSubscription } from "../hooks/useQueries";

function isSubActive(sub: { expiryDate: bigint } | null | undefined): boolean {
  if (!sub) return false;
  return Number(sub.expiryDate) > Math.floor(Date.now() / 1000);
}

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "₹99",
    priceInCents: 9900n,
    period: "month",
    resolution: "720p",
    description: "Great streaming quality",
    features: [
      "720p HD streaming",
      "1 device at a time",
      "Unlimited movies",
      "Mobile & tablet",
    ],
    color: "from-gray-500 to-gray-700",
    popular: false,
    icon: Star,
  },
  {
    id: "standard",
    name: "Standard",
    price: "₹199",
    priceInCents: 19900n,
    period: "month",
    resolution: "1080p",
    description: "Full HD for the family",
    features: [
      "1080p Full HD streaming",
      "2 devices at a time",
      "Unlimited movies",
      "All devices supported",
      "Download for offline",
    ],
    color: "from-blue-500 to-indigo-700",
    popular: false,
    icon: Sparkles,
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹299",
    priceInCents: 29900n,
    period: "month",
    resolution: "4K",
    description: "The ultimate experience",
    features: [
      "4K Ultra HD streaming",
      "4 devices at a time",
      "Unlimited movies",
      "All devices supported",
      "Download for offline",
      "Dolby Atmos audio",
      "Early access to new releases",
    ],
    color: "from-yellow-400 to-orange-600",
    popular: true,
    icon: Crown,
  },
];

export default function SubscriptionPage() {
  const { loginStatus, login } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success";
  const { data: sub } = useSubscription();
  const stripeCheckout = useStripeCheckout();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const activePlan = isSubActive(sub) ? sub?.plan : null;

  const handleSubscribe = async (plan: (typeof PLANS)[0]) => {
    if (!isLoggedIn) {
      login();
      return;
    }
    setLoadingPlan(plan.id);
    try {
      const successUrl = `${window.location.origin}/subscription/success?plan=${plan.id}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/subscription`;
      const url = await stripeCheckout.mutateAsync({
        items: [
          {
            productName: `CineStream ${plan.name}`,
            currency: "inr",
            quantity: 1n,
            priceInCents: plan.priceInCents,
            productDescription: `CineStream ${plan.name} plan — ${plan.resolution} streaming`,
          },
        ],
        successUrl,
        cancelUrl,
      });
      window.location.href = url;
    } catch {
      toast.error("Subscription service coming soon");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20 px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-[0.3em] text-[#e50914] uppercase mb-3">
            CineStream Premium
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Unlimited access to movies, series, and exclusive content. Cancel
            anytime.
          </p>
          {activePlan && (
            <p className="mt-4 text-sm text-green-400 font-semibold">
              ✓ You are currently on the{" "}
              <span className="capitalize">{activePlan}</span> plan
              {sub?.expiryDate
                ? ` · Expires ${new Date(Number(sub.expiryDate) * 1000).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`
                : ""}
            </p>
          )}
        </div>

        {/* Plan cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = activePlan === plan.id;
            const isLoading = loadingPlan === plan.id;
            return (
              <div
                key={plan.id}
                data-ocid={`subscription.${plan.id}_plan.card`}
                className={`relative rounded-2xl border transition-all duration-300 ${
                  plan.popular
                    ? "border-yellow-400/60 bg-gradient-to-b from-yellow-400/5 to-orange-600/5 shadow-[0_0_40px_rgba(250,204,21,0.15)] scale-105"
                    : "border-white/10 bg-card hover:border-white/20 hover:shadow-xl"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-600 text-black text-xs font-black tracking-wider shadow-lg">
                    MOST POPULAR
                  </div>
                )}

                <div className="p-7">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-5 shadow-md`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-xl font-display font-black text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    {plan.description}
                  </p>

                  <div className="flex items-end gap-1 mb-6">
                    <span className="text-4xl font-black text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground mb-1">
                      /{plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-7">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2.5 text-sm text-muted-foreground"
                      >
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button
                      disabled
                      className="w-full bg-green-500/20 text-green-400 border border-green-500/40 font-bold cursor-default"
                    >
                      ✓ Current Plan
                    </Button>
                  ) : (
                    <Button
                      data-ocid={`subscription.${plan.id}_plan.button`}
                      onClick={() => handleSubscribe(plan)}
                      disabled={isLoading || stripeCheckout.isPending}
                      className={`w-full font-black py-5 rounded-xl transition-all duration-200 hover:scale-105 ${
                        plan.popular
                          ? "bg-gradient-to-r from-yellow-400 to-orange-600 text-black hover:from-yellow-500 hover:to-orange-700"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : isLoggedIn ? (
                        "Subscribe Now"
                      ) : (
                        "Sign In to Subscribe"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Features grid */}
        <div className="max-w-3xl mx-auto mt-20 text-center">
          <h2 className="font-display font-bold text-2xl text-foreground mb-8">
            Everything included
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "10,000+ Movies", icon: "🎬" },
              { label: "No Ads", icon: "🚫" },
              { label: "Cancel Anytime", icon: "✨" },
              { label: "4K Streaming", icon: "📺" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50"
              >
                <span className="text-3xl">{item.icon}</span>
                <span className="text-sm font-semibold text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/">
            <Button variant="ghost" className="text-muted-foreground">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
