'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from '@/lib/types';
import { QuestService } from '@/lib/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  User as UserIcon, 
  Settings, 
  ExternalLink, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Link,
  Twitter
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  hederaAccountId: z.string().refine(
    (val) => QuestService.validateHederaAccountId(val),
    'Invalid Hedera account ID format'
  ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isConnectingTwitter, setIsConnectingTwitter] = useState(false);

  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  });

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('auth_token');
      if (!accessToken) {
        console.log('No access token found');
        return;
      }

      const baseUrl = 'https://hedera-quests.com';
      const response = await fetch(`${baseUrl}/profile/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        
        const data = await response.json();
        setProfileData(data);
        
        // Create user object from profile data
        const userData: User = {
          id: String(data.user.id),
          name: `${data.user.firstName} ${data.user.lastName}`.trim(),
          email: data.user.email,
          avatar: data.user.twitterProfile?.twitter_profile_picture || '/logo.png',
          hederaAccountId: '',
          points: 0,
          level: 1,
          streak: 0,
          joinedAt: new Date().toISOString(),
          role: data.is_admin ? 'admin' : 'user',
          badges: [],
          completedQuests: []
        };
        
        setUser(userData);
        reset({
          name: userData.name,
          email: userData.email,
          hederaAccountId: userData.hederaAccountId
        });
    } catch (error) {
      console.error('Failed to load user data:', error);
      setSaveError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updatedUser = await QuestService.updateUserProfile(user.id, data);
      setUser(updatedUser);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleConnectTwitter = async () => {
    setIsConnectingTwitter(true);
    try {
      const accessToken = localStorage.getItem('auth_token');
      if (!accessToken) {
        setSaveError('No access token found. Please login again.');
        setTimeout(() => setSaveError(null), 5000);
        return;
      }

      const baseUrl = 'https://hedera-quests.com';
      const response = await fetch(`${baseUrl}/profile/twitter/url`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to get Twitter authorization URL');
      }
      
      const data = await response.json();
      
      if (data.success && data.url) {
        // Redirect to Twitter authorization URL
        window.location.href = data.url;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error connecting to Twitter:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to connect to Twitter');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsConnectingTwitter(false);
    }
  };

  const handleDisconnectTwitter = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const baseUrl = 'https://hedera-quests.com';
      const response = await fetch(`${baseUrl}/profile/twitter/profile`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Twitter Disconnected',
          description: 'Your Twitter account has been successfully disconnected.',
          variant: 'default',
          className: 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-50',
        });
        // Refresh profile data
        await loadUser();
      } else {
        const data = await response.json();
        toast({
          title: 'Failed to disconnect Twitter',
          description: data.message || 'Something went wrong.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to disconnect Twitter',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
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
        <p className="text-muted-foreground">Failed to load profile. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Avatar className="w-24 h-24 mx-auto">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-2xl">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">Member since {new Date(user.joinedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="hederaAccountId">Hedera Account ID</Label>
                  <Input
                    id="hederaAccountId"
                    {...register('hederaAccountId')}
                    
                  />
                  {errors.hederaAccountId && (
                    <p className="text-sm text-destructive mt-1">{errors.hederaAccountId.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: 0.0.XXXXXX (e.g., 0.0.123456)
                  </p>
                </div>

                {saveError && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{saveError}</AlertDescription>
                  </Alert>
                )}

                {saveSuccess && (
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>Profile updated successfully!</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary">{user.points.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary">{user.level}</div>
                <div className="text-sm text-muted-foreground">Current Level</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary">{user.completedQuests.length}</div>
                <div className="text-sm text-muted-foreground">Quests Completed</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hedera Integration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">Hedera Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Your connected Hedera account: {user.hederaAccountId}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(QuestService.generateHashScanUrl(user.hederaAccountId), '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View on HashScan
                  </Button>
                  <Button variant="outline" size="sm">
                    Update Account
                  </Button>
                </div>
              </div>

              {/* Social Media Integration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">Twitter Integration</h3>
                    {profileData?.user?.twitterProfile ? (
                      <p className="text-sm text-muted-foreground">
                        Connected as @{profileData.user.twitterProfile.twitter_username}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Link your Twitter account to verify social media quests
                      </p>
                    )}
                  </div>
                  {profileData?.user?.twitterProfile ? (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Not Connected
                    </Badge>
                  )}
                </div>
                
                {profileData?.user?.twitterProfile ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={profileData.user.twitterProfile.twitter_profile_picture} />
                        <AvatarFallback>@</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">@{profileData.user.twitterProfile.twitter_username}</p>
                        <p className="text-sm text-muted-foreground">Twitter ID: {profileData.user.twitterProfile.twitter_id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://twitter.com/${profileData.user.twitterProfile.twitter_username}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
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
                         className="bg-blue-500 hover:bg-blue-600 text-white"
                         onClick={handleConnectTwitter}
                         disabled={isConnectingTwitter}
                       >
                         <Twitter className="w-4 h-4 mr-1" />
                         {isConnectingTwitter ? 'Connecting...' : 'Connect Twitter'}
                       </Button>
                      <Button variant="outline" size="sm" disabled>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Profile
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Connecting your Twitter account allows you to participate in social media quests and earn additional rewards.
                    </p>
                  </div>
                )}
              </div>

              {/* Account Status */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">Account Status</h3>
                    <p className="text-sm text-muted-foreground">
                      Your account is in good standing
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Email verified
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Hedera account linked
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Profile completed
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  These actions cannot be undone. Please be careful.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    Reset Progress
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Privacy Settings */}
              <div>
                <h3 className="font-semibold mb-3">Profile Visibility</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Show on Leaderboard</div>
                      <div className="text-sm text-muted-foreground">
                        Allow others to see your rank and points
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Public Profile</div>
                      <div className="text-sm text-muted-foreground">
                        Make your achievements and badges visible to others
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Show Activity</div>
                      <div className="text-sm text-muted-foreground">
                        Display your recent quest completions
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Disabled</Button>
                  </div>
                </div>
              </div>

              {/* Data Export */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Data Management</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Export Data</div>
                      <div className="text-sm text-muted-foreground">
                        Download a copy of your data
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Link className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Data Retention</div>
                      <div className="text-sm text-muted-foreground">
                        How long we keep your data
                      </div>
                    </div>
                    <Badge variant="outline">Indefinitely</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}