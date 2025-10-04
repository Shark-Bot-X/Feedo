import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import Logo from "@/components/Logo";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground/70 hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-foreground/70 hover:text-foreground transition-colors">
              How it works
            </a>
            <a href="#pricing" className="text-foreground/70 hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/auth")}
            >
              Log in
            </Button>
            <Button onClick={() => navigate("/auth")}>
              Start free trial
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6">
        <section className="py-20 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-8">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Now with AI-powered insights
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Turn customer feedback into actionable insights
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Stop drowning in feedback. Our AI agent categorizes thousands of entries by urgency and impact,
            highlights top pain points, and delivers a prioritized action list to your team every week.
          </p>

          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              size="lg"
              className="text-lg px-8"
              onClick={() => navigate("/auth")}
            >
              Start free trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8"
            >
              Watch demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </section>

        {/* Features Preview */}
        <section className="py-20 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Categorization</h3>
            <p className="text-muted-foreground">
              AI automatically categorizes feedback by type, urgency, and impact for instant insights.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Priority Dashboard</h3>
            <p className="text-muted-foreground">
              Visual analytics and priority lists help you focus on what matters most.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Weekly Reports</h3>
            <p className="text-muted-foreground">
              Automated reports track trends and highlight urgent issues requiring immediate attention.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
