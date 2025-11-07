import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Replace this with your Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
      console.error('Google Script URL not configured properly');
      return NextResponse.json(
        { error: 'Google Sheets integration is not configured yet. Please check WAITLIST_README.md for setup instructions.' },
        { status: 500 }
      );
    }

    console.log('Sending to Google Sheets:', GOOGLE_SCRIPT_URL);

    // Send to Google Sheets via Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      redirect: 'follow',
    });

    // Check if response is HTML (common error when script isn't properly deployed)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error('Google Apps Script returned HTML instead of JSON. This usually means:');
      console.error('1. The script is not deployed as a Web App');
      console.error('2. The deployment settings are incorrect');
      console.error('3. Authorization is required');
      console.error('Please check GOOGLE_SHEETS_SETUP.md for detailed instructions.');
      
      return NextResponse.json(
        { 
          error: 'Google Sheets is not properly configured. Please ensure the Apps Script is deployed with "Execute as: Me" and "Who has access: Anyone".' 
        },
        { status: 500 }
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      console.error('Response status:', response.status);
      console.error('Response text:', await response.text());
      
      return NextResponse.json(
        { error: 'Invalid response from Google Sheets. Please check the setup.' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      // Check for duplicate email (409 status or specific error message)
      if (data.error && (data.error.toLowerCase().includes('already') || data.error.toLowerCase().includes('exist'))) {
        return NextResponse.json(
          { error: data.error },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: data.error || 'Failed to register email' },
        { status: response.status }
      );
    }

    // Check if the response indicates success but also check for duplicate in message
    if (data.error && (data.error.toLowerCase().includes('already') || data.error.toLowerCase().includes('exist'))) {
      return NextResponse.json(
        { error: data.error },
        { status: 409 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
