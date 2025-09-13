import CryptoJS from 'crypto-js';

export interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: string;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  colorDepth: number;
  pixelRatio: number;
}

export interface SybilDetectionResult {
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: string[];
  recommendations: string[];
}

/**
 * Generate device fingerprint for sybil detection
 */
export function generateDeviceFingerprint(): DeviceFingerprint {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback
    return {
      userAgent: '',
      screenResolution: '',
      timezone: '',
      language: '',
      platform: '',
      cookieEnabled: false,
      doNotTrack: '',
      hardwareConcurrency: 0,
      maxTouchPoints: 0,
      colorDepth: 0,
      pixelRatio: 0,
    };
  }

  return {
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || '',
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
  };
}

/**
 * Calculate sybil resistance score based on device fingerprint
 */
export function calculateSybilScore(fingerprint: DeviceFingerprint): SybilDetectionResult {
  let score = 100;
  const factors: string[] = [];
  const recommendations: string[] = [];

  // Check for common sybil indicators
  if (fingerprint.userAgent.includes('HeadlessChrome') || fingerprint.userAgent.includes('PhantomJS')) {
    score -= 30;
    factors.push('Automated browser detected');
    recommendations.push('Use a standard browser');
  }

  if (fingerprint.screenResolution === '1920x1080' && fingerprint.timezone === 'UTC') {
    score -= 15;
    factors.push('Common bot configuration detected');
  }

  if (fingerprint.hardwareConcurrency < 2) {
    score -= 10;
    factors.push('Low hardware concurrency');
  }

  if (fingerprint.maxTouchPoints === 0 && fingerprint.platform.includes('Mobile')) {
    score -= 20;
    factors.push('Mobile device without touch support');
  }

  if (!fingerprint.cookieEnabled) {
    score -= 15;
    factors.push('Cookies disabled');
    recommendations.push('Enable cookies for better verification');
  }

  if (fingerprint.doNotTrack === '1') {
    score -= 5;
    factors.push('Do Not Track enabled');
  }

  // Check for unique characteristics that indicate real user
  if (fingerprint.language !== 'en-US' && fingerprint.language !== 'en') {
    score += 5;
    factors.push('Non-English language preference');
  }

  if (fingerprint.timezone !== 'UTC' && fingerprint.timezone !== 'America/New_York') {
    score += 5;
    factors.push('Non-standard timezone');
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  if (score >= 80) {
    riskLevel = 'LOW';
  } else if (score >= 60) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'HIGH';
  }

  return {
    score,
    riskLevel,
    factors,
    recommendations,
  };
}

/**
 * Generate unique user ID based on device fingerprint
 */
export function generateUserID(fingerprint: DeviceFingerprint): string {
  const fingerprintString = JSON.stringify(fingerprint);
  return CryptoJS.SHA256(fingerprintString).toString();
}

/**
 * Check for duplicate device fingerprints (potential sybil attack)
 */
export function checkForDuplicateFingerprints(
  currentFingerprint: DeviceFingerprint,
  existingFingerprints: DeviceFingerprint[]
): boolean {
  const currentID = generateUserID(currentFingerprint);
  
  return existingFingerprints.some(fingerprint => {
    const existingID = generateUserID(fingerprint);
    return currentID === existingID;
  });
}

/**
 * Advanced sybil detection using multiple factors
 */
export function advancedSybilDetection(
  fingerprint: DeviceFingerprint,
  walletAddress: string,
  transactionHistory: any[],
  socialConnections: any[]
): SybilDetectionResult {
  const baseResult = calculateSybilScore(fingerprint);
  let score = baseResult.score;
  const factors = [...baseResult.factors];
  const recommendations = [...baseResult.recommendations];

  // Check wallet age and transaction history
  if (transactionHistory.length < 5) {
    score -= 10;
    factors.push('Limited transaction history');
    recommendations.push('Complete more transactions to build reputation');
  }

  // Check for multiple wallets from same device
  const walletFingerprints = JSON.parse(localStorage.getItem('walletFingerprints') || '[]');
  if (walletFingerprints.length > 3) {
    score -= 20;
    factors.push('Multiple wallets from same device');
    recommendations.push('Use different devices for multiple wallets');
  }

  // Check social connections
  if (socialConnections.length === 0) {
    score -= 5;
    factors.push('No social connections');
    recommendations.push('Connect social accounts for better verification');
  }

  // Check for rapid account creation
  const accountCreationTime = localStorage.getItem('accountCreationTime');
  if (accountCreationTime) {
    const timeSinceCreation = Date.now() - parseInt(accountCreationTime);
    if (timeSinceCreation < 24 * 60 * 60 * 1000) { // Less than 24 hours
      score -= 15;
      factors.push('Recently created account');
    }
  }

  // Store fingerprint for future checks
  const fingerprintID = generateUserID(fingerprint);
  const existingFingerprints = JSON.parse(localStorage.getItem('deviceFingerprints') || '[]');
  if (!existingFingerprints.includes(fingerprintID)) {
    existingFingerprints.push(fingerprintID);
    localStorage.setItem('deviceFingerprints', JSON.stringify(existingFingerprints));
  }

  // Store wallet fingerprint mapping
  const walletFingerprints = JSON.parse(localStorage.getItem('walletFingerprints') || '[]');
  if (!walletFingerprints.includes({ wallet: walletAddress, fingerprint: fingerprintID })) {
    walletFingerprints.push({ wallet: walletAddress, fingerprint: fingerprintID });
    localStorage.setItem('walletFingerprints', JSON.stringify(walletFingerprints));
  }

  score = Math.max(0, Math.min(100, score));

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  if (score >= 80) {
    riskLevel = 'LOW';
  } else if (score >= 60) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'HIGH';
  }

  return {
    score,
    riskLevel,
    factors,
    recommendations,
  };
}

/**
 * Integration with ØG Compute for AI-powered sybil detection
 */
export async function getOGComputeSybilScore(
  fingerprint: DeviceFingerprint,
  walletAddress: string,
  transactionData: any
): Promise<number> {
  try {
    // This would integrate with ØG Compute API
    // For now, return a mock score
    const response = await fetch('/api/og-compute/sybil-detection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fingerprint,
        walletAddress,
        transactionData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get sybil score from ØG Compute');
    }

    const data = await response.json();
    return data.score;
  } catch (error) {
    console.error('Error getting sybil score from ØG Compute:', error);
    // Fallback to local calculation
    return calculateSybilScore(fingerprint).score;
  }
}

