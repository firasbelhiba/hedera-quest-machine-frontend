'use client';

import { useState, useEffect } from 'react';
import { tokenStorage } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Users, 
  Bell, 
  Shield, 
  Database,
  Mail,
  Globe,
  Palette,
  Save,
  AlertTriangle,
  Twitter,
  MessageCircle,
  Facebook
} from 'lucide-react';

export default function SettingsPage() {
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Hedera Quest Machine',
    siteDescription: 'Gamified learning platform for the Hedera ecosystem',
    maintenanceMode: false,
    registrationEnabled: true,
    
    // Quest Settings
    defaultQuestPoints: 100,
    maxQuestAttempts: 3,
    questApprovalRequired: true,
    autoApproveThreshold: 0.8,
    
    // User Settings
    defaultUserRole: 'user',
    emailVerificationRequired: false,
    profilePicturesEnabled: true,
    
    // Notification Settings
    emailNotifications: true,
    questCompletionEmails: true,
    weeklyDigest: true,
    adminAlerts: true,
    
    // Security Settings
    sessionTimeout: 24,
    passwordMinLength: 6,
    twoFactorEnabled: false,
    ipWhitelist: '',
    
    // Integration Settings
    hederaNetwork: 'testnet',
    hashscanEnabled: true,
    analyticsEnabled: true,
    
    // Social Media Integration
    twitterConnected: false,
    twitterApiKey: '',
    twitterApiSecret: '',
    twitterAccessToken: '',
    twitterAccessTokenSecret: '',
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const fetchAdminProfile = async () => {
    try {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hedera-quests.com';
      const response = await fetch(`${baseUrl}/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminProfile(data.admin);
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
    
    // Check if user just returned from Twitter auth
    const twitterAuthPending = localStorage.getItem('twitter_auth_pending');
    if (twitterAuthPending) {
      localStorage.removeItem('twitter_auth_pending');
      // Refresh profile data after a short delay to ensure backend is updated
      setTimeout(() => {
        fetchAdminProfile();
      }, 2000);
    }
    
    // Check if user just returned from Discord auth
     const discordAuthPending = localStorage.getItem('discord_auth_pending');
     if (discordAuthPending) {
       localStorage.removeItem('discord_auth_pending');
       // Refresh profile data after a short delay to ensure backend is updated
       setTimeout(() => {
         fetchAdminProfile();
       }, 2000);
     }
     
     // Check if user just returned from Facebook auth
     const facebookAuthPending = localStorage.getItem('facebook_auth_pending');
     if (facebookAuthPending) {
       localStorage.removeItem('facebook_auth_pending');
       // Refresh profile data after a short delay to ensure backend is updated
       setTimeout(() => {
         fetchAdminProfile();
       }, 2000);
     }
   }, []);

  const handleTwitterConnect = async () => {
    try {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        alert('Please log in to connect your Twitter account.');
        return;
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hedera-quests.com';
      const response = await fetch(`${baseUrl}/profile/admin/twitter/url`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          // Store a flag to refresh profile data when user returns
          localStorage.setItem('twitter_auth_pending', 'true');
          window.location.href = data.url;
        } else {
          alert('Failed to get Twitter authorization URL');
        }
      } else {
        alert('Failed to connect to Twitter. Please try again.');
      }
    } catch (error) {
      console.error('Error connecting to Twitter:', error);
      alert('Failed to connect to Twitter. Please try again.');
    }
  };

  const handleDiscordConnect = async () => {
    try {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        alert('Please log in to connect your Discord account.');
        return;
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hedera-quests.com';
      const response = await fetch(`${baseUrl}/profile/admin/discord/url`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          // Store a flag to refresh profile data when user returns
          localStorage.setItem('discord_auth_pending', 'true');
          window.location.href = data.url;
        } else {
          alert('Failed to get Discord authorization URL');
        }
      } else {
        alert('Failed to connect to Discord. Please try again.');
      }
    } catch (error) {
       console.error('Error connecting to Discord:', error);
       alert('Failed to connect to Discord. Please try again.');
     }
   };

  const handleFacebookConnect = async () => {
    try {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        alert('Please log in to connect your Facebook account.');
        return;
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hedera-quests.com';
      const response = await fetch(`${baseUrl}/profile/admin/facebook/url`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          // Store a flag to refresh profile data when user returns
          localStorage.setItem('facebook_auth_pending', 'true');
          window.location.href = data.url;
        } else {
          alert('Failed to get Facebook authorization URL');
        }
      } else {
        alert('Failed to connect to Facebook. Please try again.');
      }
    } catch (error) {
       console.error('Error connecting to Facebook:', error);
       alert('Failed to connect to Facebook. Please try again.');
     }
   };

  const handleSaveSettings = () => {
    // In a real app, this would save to the backend
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure platform settings and preferences</p>
        </div>
        <Button onClick={handleSaveSettings} className="gap-2">
          <Save className="w-4 h-4" />
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="quests">Quests</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable access to the platform
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to create accounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.registrationEnabled}
                    onCheckedChange={(checked) => handleSettingChange('registrationEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Quest Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultQuestPoints">Default Quest Points</Label>
                  <Input
                    id="defaultQuestPoints"
                    type="number"
                    value={settings.defaultQuestPoints}
                    onChange={(e) => handleSettingChange('defaultQuestPoints', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxQuestAttempts">Max Quest Attempts</Label>
                  <Input
                    id="maxQuestAttempts"
                    type="number"
                    value={settings.maxQuestAttempts}
                    onChange={(e) => handleSettingChange('maxQuestAttempts', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Quest Approval Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Require admin approval for quest submissions
                    </p>
                  </div>
                  <Switch
                    checked={settings.questApprovalRequired}
                    onCheckedChange={(checked) => handleSettingChange('questApprovalRequired', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="autoApproveThreshold">Auto-Approve Threshold</Label>
                  <Input
                    id="autoApproveThreshold"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={settings.autoApproveThreshold}
                    onChange={(e) => handleSettingChange('autoApproveThreshold', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Confidence score threshold for automatic approval (0.0 - 1.0)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="defaultUserRole">Default User Role</Label>
                <select
                  id="defaultUserRole"
                  value={settings.defaultUserRole}
                  onChange={(e) => handleSettingChange('defaultUserRole', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background mt-1"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Verification Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Require users to verify their email address
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailVerificationRequired}
                    onCheckedChange={(checked) => handleSettingChange('emailVerificationRequired', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Profile Pictures Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to upload profile pictures
                    </p>
                  </div>
                  <Switch
                    checked={settings.profilePicturesEnabled}
                    onCheckedChange={(checked) => handleSettingChange('profilePicturesEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Roles & Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Admin</div>
                    <div className="text-sm text-muted-foreground">Full system access</div>
                  </div>
                  <Badge>5 users</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Moderator</div>
                    <div className="text-sm text-muted-foreground">Quest review and user management</div>
                  </div>
                  <Badge variant="secondary">12 users</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">User</div>
                    <div className="text-sm text-muted-foreground">Standard user access</div>
                  </div>
                  <Badge variant="outline">1,230 users</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable email notifications system-wide
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Quest Completion Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Send emails when users complete quests
                    </p>
                  </div>
                  <Switch
                    checked={settings.questCompletionEmails}
                    onCheckedChange={(checked) => handleSettingChange('questCompletionEmails', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Send weekly progress summaries to users
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyDigest}
                    onCheckedChange={(checked) => handleSettingChange('weeklyDigest', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Admin Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Send alerts for system events and issues
                    </p>
                  </div>
                  <Switch
                    checked={settings.adminAlerts}
                    onCheckedChange={(checked) => handleSettingChange('adminAlerts', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(checked) => handleSettingChange('twoFactorEnabled', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                  <Textarea
                    id="ipWhitelist"
                    placeholder="Enter IP addresses (one per line)"
                    value={settings.ipWhitelist}
                    onChange={(e) => handleSettingChange('ipWhitelist', e.target.value)}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Restrict admin access to specific IP addresses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  Reset All User Progress
                </Button>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  Clear All Submissions
                </Button>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  Factory Reset System
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                External Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hederaNetwork">Hedera Network</Label>
                <select
                  id="hederaNetwork"
                  value={settings.hederaNetwork}
                  onChange={(e) => handleSettingChange('hederaNetwork', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background mt-1"
                >
                  <option value="testnet">Testnet</option>
                  <option value="mainnet">Mainnet</option>
                </select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>HashScan Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable HashScan explorer links
                    </p>
                  </div>
                  <Switch
                    checked={settings.hashscanEnabled}
                    onCheckedChange={(checked) => handleSettingChange('hashscanEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable user behavior analytics
                    </p>
                  </div>
                  <Switch
                    checked={settings.analyticsEnabled}
                    onCheckedChange={(checked) => handleSettingChange('analyticsEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Twitter className="w-5 h-5" />
                Social Media Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Twitter Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Connect Twitter account for social features
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={adminProfile?.twitterProfile ? "default" : "secondary"}>
                      {adminProfile?.twitterProfile ? "Connected" : "Disconnected"}
                    </Badge>
                    <Button 
                      variant={adminProfile?.twitterProfile ? "outline" : "default"}
                      size="sm"
                      disabled={loading}
                      onClick={() => {
                        if (adminProfile?.twitterProfile) {
                          // Handle disconnect logic here
                          alert('Disconnect functionality to be implemented');
                        } else {
                          handleTwitterConnect();
                        }
                      }}
                    >
                      {adminProfile?.twitterProfile ? "Disconnect" : "Connect Twitter"}
                    </Button>
                  </div>
                </div>

                {adminProfile?.twitterProfile && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img 
                        src={adminProfile.twitterProfile.twitter_profile_picture} 
                        alt="Twitter Profile" 
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium">@{adminProfile.twitterProfile.twitter_username}</p>
                        <p className="text-sm text-muted-foreground">Twitter ID: {adminProfile.twitterProfile.twitter_id}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Connected At</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(adminProfile.twitterProfile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm">Token Expires</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(adminProfile.twitterProfile.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Discord Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Connect Discord account for community features
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={adminProfile?.discordProfile ? "default" : "secondary"}>
                      {adminProfile?.discordProfile ? "Connected" : "Disconnected"}
                    </Badge>
                    <Button 
                      variant={adminProfile?.discordProfile ? "outline" : "default"}
                      size="sm"
                      disabled={loading}
                      onClick={() => {
                        if (adminProfile?.discordProfile) {
                          // Handle disconnect logic here
                          alert('Disconnect functionality to be implemented');
                        } else {
                          handleDiscordConnect();
                        }
                      }}
                    >
                      {adminProfile?.discordProfile ? "Disconnect" : "Connect Discord"}
                    </Button>
                  </div>
                </div>

                {adminProfile?.discordProfile && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-10 h-10 text-indigo-500" />
                      <div>
                        <p className="font-medium">{adminProfile.discordProfile.discord_username}</p>
                        <p className="text-sm text-muted-foreground">Discord ID: {adminProfile.discordProfile.discord_id}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Connected At</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(adminProfile.discordProfile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm">Token Expires</Label>
                        <p className="text-sm text-muted-foreground">
                          {adminProfile.discordProfile.expires_at ? new Date(adminProfile.discordProfile.expires_at).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Facebook Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Connect Facebook account for social features
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={adminProfile?.facebookProfile ? "default" : "secondary"}>
                      {adminProfile?.facebookProfile ? "Connected" : "Disconnected"}
                    </Badge>
                    <Button 
                      variant={adminProfile?.facebookProfile ? "outline" : "default"}
                      size="sm"
                      disabled={loading}
                      onClick={() => {
                        if (adminProfile?.facebookProfile) {
                          // Handle disconnect logic here
                          alert('Disconnect functionality to be implemented');
                        } else {
                          handleFacebookConnect();
                        }
                      }}
                    >
                      {adminProfile?.facebookProfile ? "Disconnect" : "Connect Facebook"}
                    </Button>
                  </div>
                </div>

                {adminProfile?.facebookProfile && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Facebook className="w-10 h-10 text-blue-600" />
                      <div>
                        <p className="font-medium">{adminProfile.facebookProfile.facebook_username}</p>
                        <p className="text-sm text-muted-foreground">Facebook ID: {adminProfile.facebookProfile.facebook_id}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Connected At</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(adminProfile.facebookProfile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm">Token Expires</Label>
                        <p className="text-sm text-muted-foreground">
                          {adminProfile.facebookProfile.expires_at ? new Date(adminProfile.facebookProfile.expires_at).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>API Rate Limits</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label className="text-sm">Requests per minute</Label>
                    <Input type="number" defaultValue="100" />
                  </div>
                  <div>
                    <Label className="text-sm">Requests per hour</Label>
                    <Input type="number" defaultValue="1000" />
                  </div>
                </div>
              </div>

              <div>
                <Label>Webhook Endpoints</Label>
                <div className="space-y-2 mt-2">
                  <Input placeholder="Quest completion webhook URL" />
                  <Input placeholder="User registration webhook URL" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}