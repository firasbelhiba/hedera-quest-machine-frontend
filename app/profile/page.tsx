"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import { QuestService } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  User as UserIcon,
  Settings,
  ExternalLink,
  Shield,
  CheckCircle,
  AlertCircle,
  Link,
  Twitter,
  Facebook,
  MessageSquare,
  Award,
  Clock,
  XCircle,
} from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";

interface UserStats {
  numberOfBadges: number;
  numberOfquestCompleted: number;
  numberOfquestRejected: number;
  numberOfquestPending: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailVerificationSuccess, setEmailVerificationSuccess] =
    useState(false);
  const [isConnectingTwitter, setIsConnectingTwitter] = useState(false);
  const [isConnectingFacebook, setIsConnectingFacebook] = useState(false);
  const [isConnectingDiscord, setIsConnectingDiscord] = useState(false);

  const { toast } = useToast();

  const handleVerifyEmail = async () => {
    const email = profileData?.user?.email;
    if (!email) return;

    setIsVerifyingEmail(true);
    setEmailVerificationSuccess(false);

    try {
      const accessToken = localStorage.getItem("auth_token");
      if (!accessToken) {
        setSaveError("No access token found. Please login again.");
        setTimeout(() => setSaveError(null), 5000);
        return;
      }

      const baseUrl = "https://hedera-quests.com";
      const response = await fetch(`${baseUrl}/profile/verify-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send verification email");
      }

      setEmailVerificationSuccess(true);
      setTimeout(() => setEmailVerificationSuccess(false), 5000);
    } catch (error) {
      console.error("Error verifying email:", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to send verification email"
      );
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("auth_token");
      if (!accessToken) {
        console.log("No access token found");
        return;
      }

      const baseUrl = "https://hedera-quests.com";
      const response = await fetch(`${baseUrl}/profile/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const data = await response.json();
      setProfileData(data);

      // Create user object from profile data
      const userData: User = {
        id: String(data.user.id),
        name: `${data.user.firstName} ${data.user.lastName}`.trim(),
        email: data.user.email,
        avatar:
          data.user.twitterProfile?.twitter_profile_picture || "/logo.png",
        hederaAccountId: "",
        points: 0,
        level: 1,
        streak: 0,
        joinedAt: data.user.created_at || new Date().toISOString(),
        role: data.is_admin ? "admin" : "user",
        badges: [],
        completedQuests: [],
      };

      setUser(userData);
    } catch (error) {
      console.error("Failed to load user data:", error);
      setSaveError("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const accessToken = localStorage.getItem("auth_token");
      if (!accessToken) {
        console.log("No access token found");
        return;
      }

      const response = await fetch("/api/user/stats", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user stats");
      }

      const data = await response.json();
      if (data.success) {
        setUserStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to load user stats:", error);
      // Set default stats on error
      setUserStats({
        numberOfBadges: 0,
        numberOfquestCompleted: 0,
        numberOfquestRejected: 0,
        numberOfquestPending: 0,
      });
    }
  };

  useEffect(() => {
    loadUser();
    fetchUserStats();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleConnectTwitter = async () => {
    setIsConnectingTwitter(true);
    try {
      const accessToken = localStorage.getItem("auth_token");
      if (!accessToken) {
        setSaveError("No access token found. Please login again.");
        setTimeout(() => setSaveError(null), 5000);
        return;
      }

      const baseUrl = "https://hedera-quests.com";
      const response = await fetch(`${baseUrl}/profile/twitter/url`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get Twitter authorization URL");
      }

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Twitter authorization URL
        window.location.href = data.url;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error connecting to Twitter:", error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to connect to Twitter"
      );
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsConnectingTwitter(false);
    }
  };

  const handleConnectFacebook = async () => {
    setIsConnectingFacebook(true);
    try {
      const accessToken = localStorage.getItem("auth_token");
      if (!accessToken) {
        setSaveError("No access token found. Please login again.");
        setTimeout(() => setSaveError(null), 5000);
        return;
      }

      const baseUrl = "https://hedera-quests.com";
      const response = await fetch(`${baseUrl}/profile/facebook/url`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get Facebook authorization URL");
      }

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Facebook authorization URL
        window.location.href = data.url;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error connecting to Facebook:", error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to connect to Facebook"
      );
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsConnectingFacebook(false);
    }
  };

  const handleDisconnectTwitter = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const baseUrl = "https://hedera-quests.com";
      const response = await fetch(`${baseUrl}/profile/twitter/profile`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Twitter Disconnected",
          description:
            "Your Twitter account has been successfully disconnected.",
          variant: "default",
          className:
            "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-50",
        });
        // Refresh profile data
        await loadUser();
      } else {
        const data = await response.json();
        toast({
          title: "Failed to disconnect Twitter",
          description: data.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to disconnect Twitter",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectFacebook = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const baseUrl = "https://hedera-quests.com";
      const response = await fetch(`${baseUrl}/profile/facebook/profile`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Facebook Disconnected",
          description:
            "Your Facebook account has been successfully disconnected.",
          variant: "default",
          className:
            "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-50",
        });
        // Refresh profile data
        await loadUser();
      } else {
        const data = await response.json();
        toast({
          title: "Failed to disconnect Facebook",
          description: data.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to disconnect Facebook",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const handleConnectDiscord = async () => {
    setIsConnectingDiscord(true);
    try {
      const accessToken = localStorage.getItem("auth_token");
      if (!accessToken) {
        setSaveError("No access token found. Please login again.");
        setTimeout(() => setSaveError(null), 5000);
        return;
      }

      const baseUrl = "https://hedera-quests.com";
      const response = await fetch(`${baseUrl}/profile/discord/url`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get Discord authorization URL");
      }

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Discord authorization URL
        window.location.href = data.url;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error connecting to Discord:", error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to connect to Discord"
      );
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsConnectingDiscord(false);
    }
  };

  const handleDisconnectDiscord = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const baseUrl = "https://hedera-quests.com";
      const response = await fetch(`${baseUrl}/profile/discord/profile`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Discord Disconnected",
          description:
            "Your Discord account has been successfully disconnected.",
          variant: "default",
          className:
            "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-50",
        });
        // Refresh profile data
        await loadUser();
      } else {
        const data = await response.json();
        toast({
          title: "Failed to disconnect Discord",
          description: data.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to disconnect Discord",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Failed to load profile. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 hover:border-solid transition-all duration-200">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full border-2 border-dashed border-primary/30" />
              <Avatar className="relative w-24 h-24 border-2 border-solid border-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                <AvatarImage src={profileData?.user?.profilePicture || ""} />
                <AvatarFallback className="text-2xl font-mono bg-gradient-to-r from-primary/10 to-purple-500/10">
                  {getInitials(
                    profileData?.user?.firstName && profileData?.user?.lastName
                      ? `${profileData.user.firstName} ${profileData.user.lastName}`
                      : profileData?.user?.username || "User"
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h1 className="text-3xl font-bold font-mono bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {profileData?.user?.firstName && profileData?.user?.lastName
                  ? `${profileData.user.firstName} ${profileData.user.lastName}`
                  : profileData?.user?.username || "User"}
              </h1>
              <p className="text-muted-foreground font-mono text-sm">
                {">"} Member since{" "}
                {profileData?.user?.created_at
                  ? formatDistanceToNow(new Date(profileData.user.created_at), {
                      addSuffix: true,
                    })
                  : "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="profile"
            className="font-mono text-sm data-[state=active]:bg-primary/20 data-[state=active]:border data-[state=active]:border-dashed data-[state=active]:border-primary/30 data-[state=active]:text-primary transition-all duration-200"
          >
            PROFILE
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="font-mono text-sm data-[state=active]:bg-primary/20 data-[state=active]:border data-[state=active]:border-dashed data-[state=active]:border-primary/30 data-[state=active]:text-primary transition-all duration-200"
          >
            ACCOUNT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 hover:border-solid transition-all duration-200">
            <CardHeader className="border-b border-dashed border-primary/20">
              <CardTitle className="flex items-center gap-2 font-mono text-lg">
                <div className="p-1 bg-primary/10 rounded border border-dashed border-primary/30">
                  <UserIcon className="w-4 h-4 text-primary" />
                </div>
                {">"} PROFILE_INFORMATION
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-mono text-sm text-primary">
                      FULL_NAME
                    </Label>
                    <div className="p-3 border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-md">
                      <p className="font-mono text-sm">
                        {profileData?.user?.firstName &&
                        profileData?.user?.lastName
                          ? `${profileData.user.firstName} ${profileData.user.lastName}`
                          : profileData?.user?.username || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-mono text-sm text-primary">
                      EMAIL_ADDRESS
                    </Label>
                    <div className="p-3 border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-md">
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-sm">
                          {profileData?.user?.email || "Not provided"}
                        </p>
                        {profileData?.user?.email && (
                          <div className="flex items-center gap-2">
                            {profileData?.user?.emailVerified ? (
                              <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border border-dashed border-green-500/50 font-mono text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                VERIFIED
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-dashed border-yellow-500/50 font-mono text-xs">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  UNVERIFIED
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs font-mono border-dashed border-primary/50 hover:border-solid"
                                  onClick={handleVerifyEmail}
                                  disabled={isVerifyingEmail}
                                >
                                  {isVerifyingEmail ? "SENDING..." : "VERIFY"}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Profile Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-mono text-sm text-primary">
                      USERNAME
                    </Label>
                    <div className="p-3 border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-md">
                      <p className="font-mono text-sm">
                        {profileData?.user?.username || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {profileData?.user?.role && (
                  <div className="space-y-2">
                    <Label className="font-mono text-sm text-primary">
                      ACCOUNT_TYPE
                    </Label>
                    <div className="p-3 border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-md">
                      <Badge
                        className={`font-mono ${
                          profileData.user.role === "admin"
                            ? "bg-red-500/20 text-red-700 dark:text-red-300 border border-dashed border-red-500/50"
                            : "bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-dashed border-blue-500/50"
                        }`}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {profileData.user.role.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                )}
                {saveError && (
                  <Alert className="border-2 border-dashed border-destructive/50 bg-destructive/5">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-mono text-sm">
                      {">"} {saveError}
                    </AlertDescription>
                  </Alert>
                )}

                {emailVerificationSuccess && (
                  <Alert className="border-2 border-dashed border-blue-500/50 bg-blue-500/5">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="font-mono text-sm text-blue-700 dark:text-blue-300">
                      {">"} Verification email sent! Check your inbox.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`}
          >
            {/* Badges */}
            <Card className="border-2 border-dashed border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 hover:border-solid transition-all duration-200">
              <CardContent className="p-6 text-center">
                <div className="p-2 bg-yellow-500/10 rounded-lg border border-dashed border-yellow-500/30 w-fit mx-auto mb-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold font-mono bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  {userStats?.numberOfBadges ?? "0"}
                </div>
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  BADGES_EARNED
                </div>
              </CardContent>
            </Card>

            {/* Completed Quests */}
            <Card className="border-2 border-dashed border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 hover:border-solid transition-all duration-200">
              <CardContent className="p-6 text-center">
                <div className="p-2 bg-green-500/10 rounded-lg border border-dashed border-green-500/30 w-fit mx-auto mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold font-mono bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  {userStats?.numberOfquestCompleted ?? "0"}
                </div>
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  QUESTS_COMPLETED
                </div>
              </CardContent>
            </Card>

            {/* Pending Quests */}
            <Card className="border-2 border-dashed border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover:border-solid transition-all duration-200">
              <CardContent className="p-6 text-center">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-dashed border-blue-500/30 w-fit mx-auto mb-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold font-mono bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  {userStats?.numberOfquestPending ?? "0"}
                </div>
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  QUESTS_PENDING
                </div>
              </CardContent>
            </Card>

            {/* Rejected Quests */}
            <Card className="border-2 border-dashed border-red-500/20 bg-gradient-to-br from-red-500/5 to-pink-500/5 hover:border-solid transition-all duration-200">
              <CardContent className="p-6 text-center">
                <div className="p-2 bg-red-500/10 rounded-lg border border-dashed border-red-500/30 w-fit mx-auto mb-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-2xl font-bold font-mono bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                  {userStats?.numberOfquestRejected ?? "0"}
                </div>
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  QUESTS_REJECTED
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 hover:border-solid transition-all duration-200">
            <CardHeader className="border-b border-dashed border-primary/20">
              <CardTitle className="flex items-center gap-2 font-mono text-lg">
                <div className="p-1 bg-primary/10 rounded border border-dashed border-primary/30">
                  <Settings className="w-4 h-4 text-primary" />
                </div>
                {">"} ACCOUNT_SETTINGS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Social Media Integration */}
              <div className="border-2 border-dashed border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover:border-solid transition-all duration-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-mono font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {">"} TWITTER_INTEGRATION
                    </h3>
                    {profileData?.user?.twitterProfile ? (
                      <p className="text-sm text-muted-foreground font-mono">
                        [CONNECTED] @
                        {profileData.user.twitterProfile.twitter_username}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground font-mono">
                        [DISCONNECTED] Link your Twitter account to verify
                        social media quests
                      </p>
                    )}
                  </div>
                  {profileData?.user?.twitterProfile ? (
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border border-dashed border-green-500/50 font-mono">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      CONNECTED
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500/20 text-gray-700 dark:text-gray-300 border border-dashed border-gray-500/50 font-mono">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      NOT_CONNECTED
                    </Badge>
                  )}
                </div>

                {profileData?.user?.twitterProfile ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-dashed border-blue-500/30">
                      <Avatar className="w-10 h-10 border border-dashed border-blue-500/50">
                        <AvatarImage
                          src={
                            profileData.user.twitterProfile
                              .twitter_profile_picture
                          }
                        />
                        <AvatarFallback className="font-mono">@</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium font-mono">
                          @{profileData.user.twitterProfile.twitter_username}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">
                          ID: {profileData.user.twitterProfile.twitter_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-dashed border-blue-500/50 hover:border-solid font-mono"
                        onClick={() =>
                          window.open(
                            `https://twitter.com/${profileData.user.twitterProfile.twitter_username}`,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 border-dashed border-red-500/50 hover:border-solid font-mono"
                        onClick={handleDisconnectTwitter}
                      >
                        <Link className="w-4 h-4 mr-1" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white border-dashed border-blue-600/50 hover:border-solid font-mono"
                        onClick={handleConnectTwitter}
                        disabled={isConnectingTwitter}
                      >
                        <Twitter className="w-4 h-4 mr-1" />
                        {isConnectingTwitter
                          ? "CONNECTING..."
                          : "CONNECT_TWITTER"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-dashed border-gray-500/50 font-mono"
                        disabled
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Profile
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 font-mono">
                      [INFO] Connecting your Twitter account allows you to
                      participate in social media quests and earn additional
                      rewards.
                    </p>
                  </div>
                )}
              </div>

              {/* Facebook Integration */}
              <div className="border-2 border-dashed border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 hover:border-solid transition-all duration-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {">"} FACEBOOK_INTEGRATION
                    </h3>
                    {profileData?.user?.facebookProfile ? (
                      <p className="text-sm text-muted-foreground font-mono">
                        [CONNECTED]{" "}
                        {profileData.user.facebookProfile.facebook_name}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground font-mono">
                        [DISCONNECTED] Link your Facebook account to verify
                        social media quests
                      </p>
                    )}
                  </div>
                  {profileData?.user?.facebookProfile ? (
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border border-dashed border-green-500/50 font-mono">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      CONNECTED
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500/20 text-gray-700 dark:text-gray-300 border border-dashed border-gray-500/50 font-mono">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      NOT_CONNECTED
                    </Badge>
                  )}
                </div>

                {profileData?.user?.facebookProfile ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-indigo-500/10 rounded-lg border border-dashed border-indigo-500/30">
                      <Avatar className="w-10 h-10 border border-dashed border-indigo-500/50">
                        <AvatarImage
                          src={
                            profileData.user.facebookProfile
                              .facebook_profile_picture
                          }
                        />
                        <AvatarFallback className="font-mono">
                          FB
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium font-mono">
                          {profileData.user.facebookProfile.firstname}{" "}
                          {profileData.user.facebookProfile.lastname}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">
                          ID: {profileData.user.facebookProfile.facebook_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-dashed border-indigo-500/50 hover:border-solid font-mono"
                        onClick={() =>
                          window.open(
                            `https://facebook.com/${profileData.user.facebookProfile.facebook_id}`,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 border-dashed border-red-500/50 hover:border-solid font-mono"
                        onClick={handleDisconnectFacebook}
                      >
                        <Link className="w-4 h-4 mr-1" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white border-dashed border-blue-700/50 hover:border-solid font-mono"
                        onClick={handleConnectFacebook}
                        disabled={isConnectingFacebook}
                      >
                        <Facebook className="w-4 h-4 mr-1" />
                        {isConnectingFacebook
                          ? "CONNECTING..."
                          : "CONNECT_FACEBOOK"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-dashed border-gray-500/50 font-mono"
                        disabled
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Profile
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 font-mono">
                      [INFO] Connecting your Facebook account allows you to
                      participate in social media quests and earn additional
                      rewards.
                    </p>
                  </div>
                )}
              </div>

              {/* Discord Integration */}
              <Card className="border-2 border-dashed border-[#5865F2]/30 bg-gradient-to-br from-[#5865F2]/5 to-indigo-600/5 hover:border-solid transition-all duration-200">
                <CardHeader className="border-b border-dashed border-[#5865F2]/30 bg-gradient-to-r from-[#5865F2]/5 to-transparent">
                  <CardTitle className="flex items-center gap-2 font-mono">
                    <SiDiscord className="w-5 h-5 text-[#5865F2]" />
                    [DISCORD_INTEGRATION]
                    <Badge
                      variant="secondary"
                      className="ml-auto border border-dashed border-[#5865F2]/50 bg-[#5865F2]/10 text-[#5865F2] font-mono"
                    >
                      {profileData?.user?.discordProfile
                        ? "[CONNECTED]"
                        : "[NOT_CONNECTED]"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {profileData?.user?.discordProfile ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-purple-600/10 rounded-lg border border-dashed border-purple-600/30">
                        <Avatar className="w-10 h-10 border border-dashed border-purple-600/50">
                          <AvatarImage
                            src={profileData.user.discordProfile.discord_avatar}
                          />
                          <AvatarFallback className="font-mono">
                            DC
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium font-mono">
                            {profileData.user.discordProfile.discord_username}
                          </p>
                          <p className="text-sm text-muted-foreground font-mono">
                            ID: {profileData.user.discordProfile.discord_id}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-dashed border-purple-600/50 hover:border-solid font-mono"
                          onClick={() =>
                            window.open(
                              `https://discord.com/users/${profileData.user.discordProfile.discord_id}`,
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Profile
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 border-dashed border-red-500/50 hover:border-solid font-mono"
                          onClick={handleDisconnectDiscord}
                        >
                          <Link className="w-4 h-4 mr-1" />
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white border-dashed border-purple-700/50 hover:border-solid font-mono"
                          onClick={handleConnectDiscord}
                          disabled={isConnectingDiscord}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {isConnectingDiscord
                            ? "CONNECTING..."
                            : "CONNECT_DISCORD"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-dashed border-gray-500/50 font-mono"
                          disabled
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Profile
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        [INFO] Connecting your Discord account allows you to
                        participate in social media quests and earn additional
                        rewards.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Email Verification */}
              <div
                className={`border-2 border-dashed hover:border-solid transition-all duration-200 rounded-lg p-4 ${
                  profileData?.user?.email_verified
                    ? "border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5"
                    : "border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-yellow-500/5"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3
                      className={`font-mono font-semibold uppercase tracking-wider ${
                        profileData?.user?.email_verified
                          ? "text-green-600 dark:text-green-400"
                          : "text-orange-600 dark:text-orange-400"
                      }`}
                    >
                      {">"} EMAIL_VERIFICATION
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      [EMAIL] {profileData?.user?.email || "No email set"}
                    </p>
                  </div>
                  <Badge
                    className={`border border-dashed font-mono ${
                      profileData?.user?.email_verified
                        ? "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/50"
                        : "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/50"
                    }`}
                  >
                    {profileData?.user?.email_verified ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        VERIFIED
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        VERIFY_REQUIRED
                      </>
                    )}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {!profileData?.user?.email_verified && (
                    <>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleVerifyEmail}
                          disabled={
                            isVerifyingEmail || !profileData?.user?.email
                          }
                          className="font-mono border-2 border-dashed border-orange-500/50 hover:border-solid hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          {isVerifyingEmail
                            ? "SENDING..."
                            : "SEND_VERIFICATION_EMAIL"}
                        </Button>
                      </div>
                      {emailVerificationSuccess && (
                        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded border border-dashed border-green-500/30">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <p className="text-sm text-green-600 dark:text-green-400 font-mono">
                            {">"} Email sent successfully! Check your inbox.
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground font-mono">
                        [INFO] Verify your email address to receive important
                        notifications and updates.
                      </p>
                    </>
                  )}
                  {profileData?.user?.email_verified && (
                    <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded border border-dashed border-green-500/30">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <p className="text-sm text-green-600 dark:text-green-400 font-mono">
                        {">"} Your email address has been verified successfully!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
