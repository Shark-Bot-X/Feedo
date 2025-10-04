import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Check } from "lucide-react";
import Logo from "@/components/Logo";

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center">
            <Logo />
          </button>

          <Button onClick={() => navigate("/")} variant="ghost">
            ← Back to Home
          </Button>
        </div>
      </header>

      {/* Pricing Content */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm mb-8 animate-pulse">
            <Sparkles className="w-4 h-4" />
            Limited Time Offer
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Free for Early Adopters
          </h1>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            We're building something special, and we want you to be part of it. 
            Get unlimited access completely free during our beta phase.
          </p>

          {/* Pricing Card */}
          <div className="max-w-lg mx-auto">
            <div className="p-10 rounded-3xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/20 shadow-2xl">
              <div className="mb-8">
                <div className="text-6xl font-bold mb-2">$0</div>
                <div className="text-muted-foreground text-lg">
                  Forever · Limited time only
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full text-lg mb-8"
                onClick={() => navigate("/auth")}
              >
                Get Started Now
              </Button>

              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Unlimited feedback submissions</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">AI-powered categorization & analysis</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Priority dashboard with real-time insights</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Weekly automated reports</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Team collaboration tools</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Priority support from our team</span>
                </div>
              </div>
            </div>
          </div>

          {/* Why Free Section */}
          <div className="mt-20 p-8 rounded-2xl bg-card border border-border max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Why is this free?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We're in our beta phase and actively improving our AI models. Your feedback helps us 
              build a better product. As an early adopter, you'll get grandfathered into special 
              pricing when we launch our paid tiers.
            </p>
            <p className="text-sm text-muted-foreground italic">
              "The best products are built with real users, not in isolation. Join us in shaping 
              the future of feedback management." — FeedbackAI Team
            </p>
          </div>

          {/* FAQ */}
          <div className="mt-16 grid md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-semibold mb-2">How long will it stay free?</h3>
              <p className="text-sm text-muted-foreground">
                While we're building and refining our product. Early adopters will receive advance 
                notice and exclusive pricing when we introduce paid plans.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-semibold mb-2">What happens to my data?</h3>
              <p className="text-sm text-muted-foreground">
                Your data is yours. We use industry-standard encryption and never share your 
                feedback data with third parties. You can export or delete it anytime.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-semibold mb-2">Do I need a credit card?</h3>
              <p className="text-sm text-muted-foreground">
                Nope! Just sign up with your email and start using all features immediately. 
                No hidden fees, no surprises.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-semibold mb-2">Can I invite my team?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely! Invite unlimited team members to collaborate on feedback analysis 
                and action items together.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;