import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(req: NextRequest) {
  try {
    // Get wallet address from query params
    const url = new URL(req.url);
    const walletAddress = url.searchParams.get('wallet');
    
    if (!walletAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Wallet address is required' 
      }, { status: 400 });
    }
    
    // Access Cloudflare D1 database
    const db = getCloudflareContext().env.CLOUDFLARE_DB;
    
    if (!db) {
      console.error('D1 database not available');
      return NextResponse.json({
        success: false,
        error: 'Database configuration error'
      }, { status: 500 });
    }
    
    // Query the database to check if the wallet has a Steam account linked
    const userData = await db
      .prepare(`
        SELECT steam_id, steam_username, steam_avatar, steam_profile_url 
        FROM users 
        WHERE wallet_address = ?
      `)
      .bind(walletAddress)
      .first();
    
    if (!userData || !userData.steam_id) {
      return NextResponse.json({ 
        success: false,
        message: 'No Steam account linked to this wallet address'
      });
    }
    
    // Return the Steam account information
    return NextResponse.json({
      success: true,
      message: 'Steam account found',
      data: {
        steam_id: userData.steam_id,
        steam_username: userData.steam_username,
        steam_avatar: userData.steam_avatar,
        steam_profile_url: userData.steam_profile_url
      }
    });
  } catch (error) {
    console.error('Error checking Steam link status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error checking Steam link status' 
    }, { status: 500 });
  }
} 