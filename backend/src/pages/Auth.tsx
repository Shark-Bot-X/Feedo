// src/pages/Auth.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// IMPORT the Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";
import { Loader2 } from "lucide-react";

// The name of your custom profile table in Supabase
const PROFILE_TABLE = "profiles";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  // ADD state for Company Details
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // --- Sign In Logic (Unchanged) ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Logged in successfully.",
        });

        navigate("/dashboard");
      } else {
        // --- Sign Up Logic with Profile Creation ---
        // 1. Sign up the user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: "https://feedo-confirmation.netlify.app/",
          },
        });

        if (error) throw error;

        // 2. CRITICAL: Create the initial profile row with all details
        if (data.user) {
          const profileInsert = {
            id: data.user.id,
            full_name: name,
            // INCLUDE the new fields
            company_name: companyName,
            company_size: companySize,
            updated_at: new Date().toISOString(),
          };

          const { error: profileError } = await supabase
            .from(PROFILE_TABLE)
            .insert([profileInsert]);

          if (profileError) {
            console.error("Profile creation error:", profileError);
            toast({
              title: "Profile Creation Warning",
              description: "Account created, but initial profile data save failed. Please check RLS.",
              variant: "destructive",
            });
          }
        }

        // 3. Handle navigation/toasts
        if (data.user && !data.session) {
          toast({
            title: "Check your email!",
            description:
              "We sent you a confirmation link. Please verify your email to continue.",
          });
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to Feedo.",
          });
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Logo size="lg" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isLogin ? "Welcome back" : "Create account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to access your dashboard"
                : "Start managing your feedback with AI-powered insights"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* --- Sign Up Fields (Only shown on !isLogin) --- */}
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Company Name Field (New) */}
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      type="text"
                      placeholder="Acme Inc."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Company Size Select (New) */}
                  <div className="space-y-2">
                    <Label htmlFor="company-size">Company Size</Label>
                    <Select value={companySize} onValueChange={setCompanySize} disabled={isLoading}>
                      <SelectTrigger id="company-size">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="501-1000">501-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {/* --- End Sign Up Fields --- */}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : isLogin ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;