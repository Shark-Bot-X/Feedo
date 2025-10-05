// src/pages/Profile.tsx
import { useEffect, useState, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User, Loader2 } from "lucide-react";

// The name of your custom profile table in Supabase
const PROFILE_TABLE = "profiles";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();

  // --- 1. Fetch User and Profile Data ---
  const getProfile = useCallback(async () => {
    setLoading(true);

    // 1. Get the authenticated user's session/data
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/auth");
      setLoading(false);
      return;
    }

    // Set user's email and ID from the Auth service
    setUserId(user.id);
    setEmail(user.email || "");

    // 2. Fetch the custom profile data
    const { data, error } = await supabase
      .from(PROFILE_TABLE)
      // This line fetches the company details
      .select(`full_name, company_name, company_size`)
      .eq("id", user.id);
    // Note: Not using .single() to avoid error if profile row doesn't exist yet

    if (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Profile Load Error",
        description: "Could not load profile data. Check database setup and RLS.",
        variant: "destructive",
      });
    }
    // Check if the array is non-empty and use the first element
    else if (data && data.length > 0) {
      const profile = data[0];
      // These lines set the state with the fetched data
      setFullName(profile.full_name || "");
      setCompanyName(profile.company_name || "");
      setCompanySize(profile.company_size || "");
    } else {
      // Fallback for users without a profile row (shouldn't happen with the new Auth.tsx)
      setFullName(user.user_metadata.full_name || "");
      setCompanyName("");
      setCompanySize("");
    }

    setLoading(false);
  }, [navigate, toast]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  // --- 2. Save User and Profile Data ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);

    const updates = {
      id: userId,
      full_name: fullName,
      company_name: companyName,
      company_size: companySize,
      updated_at: new Date().toISOString(),
    };

    // Use upsert to insert a new profile if it doesn't exist, or update it if it does
    const { error } = await supabase
      .from(PROFILE_TABLE)
      .upsert(updates, { onConflict: "id" });

    setSaving(false);

    if (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Update Failed",
        description: `Error saving profile: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">
          Loading profile...
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information and company details
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal and company information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  type="text"
                  placeholder="Acme Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-size">Company Size</Label>
                <Select value={companySize} onValueChange={setCompanySize}>
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

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving || !userId}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;