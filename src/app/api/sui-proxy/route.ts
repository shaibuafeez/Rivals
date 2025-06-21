import { NextResponse } from 'next/server';

// Simple in-memory request tracking for rate limiting
const requestTracker = {
  lastRequestTime: 0,
  requestCount: 0,
  resetTime: 0,
};

// RPC endpoints to try in order
const RPC_ENDPOINTS = [
  'https://fullnode.mainnet.sui.io:443',
  'https://sui-mainnet.nodeinfra.com',
  'https://sui-mainnet-rpc.allthatnode.com',
];

// Exponential backoff retry function
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  let retries = 0;
  let lastError;

  while (retries < maxRetries) {
    try {
      // Add delay between retries with exponential backoff
      if (retries > 0) {
        const delay = Math.min(Math.pow(2, retries) * 500, 5000); // 500ms, 1s, 2s, 4s, max 5s
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Try different endpoints if we've retried
      const endpoint = RPC_ENDPOINTS[retries % RPC_ENDPOINTS.length];
      const response = await fetch(endpoint, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      lastError = error;
      retries++;
      console.error(`Attempt ${retries} failed:`, error);
    }
  }
  
  throw lastError;
}

// Rate limiting function
function checkRateLimit() {
  const now = Date.now();
  
  // Reset counter every minute
  if (now - requestTracker.resetTime > 60000) {
    requestTracker.resetTime = now;
    requestTracker.requestCount = 0;
  }
  
  // Limit to 60 requests per minute (1 per second on average)
  if (requestTracker.requestCount >= 60) {
    const timeSinceLastReset = now - requestTracker.resetTime;
    if (timeSinceLastReset < 60000) {
      return false;
    }
  }
  
  requestTracker.requestCount++;
  requestTracker.lastRequestTime = now;
  return true;
}

export async function POST(request: Request) {
  try {
    // Check rate limit
    if (!checkRateLimit()) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Get the request body
    const body = await request.json();
    
    // Forward the request to the Sui RPC
    const result = await fetchWithRetry(RPC_ENDPOINTS[0], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Sui proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
