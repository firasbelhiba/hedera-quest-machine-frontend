import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Discord OAuth configuration
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = process.env.DISCORD_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/profile/discord/callback`;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Discord client ID not configured' },
        { status: 500 }
      );
    }

    // Discord OAuth scopes
    const scopes = ['identify', 'email'].join(' ');
    
    // Generate state parameter for security
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Construct Discord OAuth URL
    const discordAuthUrl = new URL('https://discord.com/api/oauth2/authorize');
    discordAuthUrl.searchParams.append('client_id', clientId);
    discordAuthUrl.searchParams.append('redirect_uri', redirectUri);
    discordAuthUrl.searchParams.append('response_type', 'code');
    discordAuthUrl.searchParams.append('scope', scopes);
    discordAuthUrl.searchParams.append('state', state);

    return NextResponse.json({
      success: true,
      url: discordAuthUrl.toString(),
      message: 'Discord OAuth URL generated successfully'
    });
  } catch (error) {
    console.error('Discord OAuth URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Discord OAuth URL' },
      { status: 500 }
    );
  }
}