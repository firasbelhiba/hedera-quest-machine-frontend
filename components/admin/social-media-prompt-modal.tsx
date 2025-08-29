'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle, Twitter, Facebook, MessageSquare } from 'lucide-react';
import { User } from '@/lib/types';

interface SocialMediaPromptModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function SocialMediaPromptModal({ user, isOpen, onClose }: SocialMediaPromptModalProps) {
  const router = useRouter();
  const [missingConnections, setMissingConnections] = useState<string[]>([]);
  const [neverShowAgain, setNeverShowAgain] = useState(false);

  useEffect(() => {
    if (user) {
      const missing: string[] = [];
      
      if (!user.twitterProfile) {
        missing.push('Twitter');
      }
      if (!user.facebookProfile) {
        missing.push('Facebook');
      }
      if (!user.discordProfile) {
        missing.push('Discord');
      }
      
      setMissingConnections(missing);
    }
  }, [user]);

  const handleConnectAccounts = () => {
    onClose();
    router.push('/admin/settings');
  };

  const handleDoItLater = () => {
    if (neverShowAgain) {
      localStorage.setItem('socialMediaPromptDismissed', 'true');
    }
    onClose();
  };

  const handleConnectAccountsClick = () => {
    if (neverShowAgain) {
      localStorage.setItem('socialMediaPromptDismissed', 'true');
    }
    handleConnectAccounts();
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'Twitter':
        return <Twitter className="w-4 h-4" />;
      case 'Facebook':
        return <Facebook className="w-4 h-4" />;
      case 'Discord':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getSocialColor = (platform: string) => {
    switch (platform) {
      case 'Twitter':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Facebook':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
      case 'Discord':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  if (missingConnections.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent className="sm:max-w-md font-mono border-2 border-dashed border-orange-500/30 bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center border border-dashed border-orange-500/30">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            [SOCIAL_MEDIA_REQUIRED]
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground space-y-3">
            <p>
              To access all admin features and manage social media quests effectively, 
              you need to connect at least one social media account.
            </p>
            <div className="space-y-2">
              <p className="font-semibold text-orange-600 dark:text-orange-400">
                Missing connections:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {missingConnections.map((platform) => (
                  <Badge
                    key={platform}
                    variant="outline"
                    className={`${getSocialColor(platform)} font-mono text-xs`}
                  >
                    {getSocialIcon(platform)}
                    <span className="ml-1">{platform.toUpperCase()}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2 px-1">
            <Checkbox
              id="never-show-again"
              checked={neverShowAgain}
              onCheckedChange={(checked) => setNeverShowAgain(checked as boolean)}
              className="border-dashed border-orange-500/50 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
            <Label
              htmlFor="never-show-again"
              className="text-sm font-mono text-muted-foreground cursor-pointer hover:text-orange-600 transition-colors"
            >
              Never show this again
            </Label>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleDoItLater}
              className="font-mono border-dashed border-gray-500/50 hover:border-solid transition-all duration-200"
            >
              DO_IT_LATER
            </Button>
            <Button
              onClick={handleConnectAccountsClick}
              className="font-mono bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              CONNECT_ACCOUNTS
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SocialMediaPromptModal;