"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';



export default function ValidateUserPage() {
  const handleValidateUser = async () => {
    try {
      const accessToken = localStorage.getItem('auth_token');
      const baseUrl = 'https://hedera-quests.com';
      const response = await fetch(`${baseUrl}/profile/hederadid/validate-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        window.location.href = '/profile';
      }
    } catch (error) {
      console.error('API validate-user error:', error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-purple-500/10">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 border-2 border-dashed border-primary/30">
        <h1 className="text-3xl font-bold font-mono text-primary mb-4">Welcome to hedera quest!</h1>
        <p className="text-lg font-mono text-muted-foreground mb-6">Your account has been validated. You can now access your profile.</p>
        <Button
          variant="default"
          size="lg"
          className="font-mono"
          onClick={handleValidateUser}
        >
          Verify user
        </Button>
      </div>
    </div>
  );
}
