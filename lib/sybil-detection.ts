import CryptoJS from 'crypto-js';
import { uploadToKV, downloadFromKV, setJson, getJson } from './zg-storage';
import { ethers } from 'ethers';
import { createZGComputeNetworkBroker, ServiceStructOutput } from '@0glabs/0g-serving-broker';

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
  
  return existingFingerprints.some(fp => {
    const existingID = generateUserID(fp);
    return currentID === existingID;
  });
}

// zg-storage による JSON 保存／取得のラッパー
async function getWalletFingerprints(streamId: string): Promise<Array<{ wallet: string; fingerprint: string }>> {
  return await getJson<Array<{ wallet: string; fingerprint: string }>>(streamId, 'walletFingerprints').catch(() => []);
}

async function setWalletFingerprints(streamId: string, fingerprints: Array<{ wallet: string; fingerprint: string }>) {
  return setJson(streamId, 'walletFingerprints', fingerprints);
}

async function getAccountCreationTime(streamId: string): Promise<string | undefined> {
  return getJson<string>(streamId, 'accountCreationTime').catch(() => undefined);
}

async function setAccountCreationTime(streamId: string, time: string) {
  return setJson(streamId, 'accountCreationTime', time);
}

async function getDeviceFingerprints(streamId: string): Promise<string[]> {
  return getJson<string[]>(streamId, 'deviceFingerprints').catch(() => []);
}

async function setDeviceFingerprints(streamId: string, fingerprints: string[]) {
  return setJson(streamId, 'deviceFingerprints', fingerprints);
}

/**
 * Advanced sybil detection using multiple factors
 */
export async function advancedSybilDetection(
  fingerprint: DeviceFingerprint,
  walletAddress: string,
  transactionHistory: any[],
  socialConnections: any[],
  streamId: string
): Promise<SybilDetectionResult> {
  const baseResult = calculateSybilScore(fingerprint);
  let score = baseResult.score;
  const factors = [...baseResult.factors];
  const recommendations = [...baseResult.recommendations];

  // Transaction history check
  if (transactionHistory.length < 5) {
    score -= 10;
    factors.push('Limited transaction history');
    recommendations.push('Complete more transactions to build reputation');
  }

  // Multiple wallets from same device
  const walletFingerprints = await getWalletFingerprints(streamId);
  if (walletFingerprints.length > 3) {
    score -= 20;
    factors.push('Multiple wallets from same device');
    recommendations.push('Use different devices for multiple wallets');
  }

  // Social connections check
  if (socialConnections.length === 0) {
    score -= 5;
    factors.push('No social connections');
    recommendations.push('Connect social accounts for better verification');
  }

  // Recently created account check
  const accountCreationTime = await getAccountCreationTime(streamId);
  if (accountCreationTime) {
    const timeSinceCreation = Date.now() - parseInt(accountCreationTime, 10);
    if (timeSinceCreation < 24 * 60 * 60 * 1000) {
      score -= 15;
      factors.push('Recently created account');
    }
  }

  // Store device fingerprint record
  const fingerprintID = generateUserID(fingerprint);
  const existingFingerprints = await getDeviceFingerprints(streamId);
  if (!existingFingerprints.includes(fingerprintID)) {
    const updated = [...existingFingerprints, fingerprintID];
    await setDeviceFingerprints(streamId, updated);
  }

  // Store wallet → fingerprint mapping
  const walletMap = await getWalletFingerprints(streamId);
  if (!walletMap.some(wf => wf.wallet === walletAddress && wf.fingerprint === fingerprintID)) {
    const updatedMap = [...walletMap, { wallet: walletAddress, fingerprint: fingerprintID }];
    await setWalletFingerprints(streamId, updatedMap);
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
 * ドキュメントに準拠した実装
 */
export async function getOGComputeSybilScore(
  fingerprint: DeviceFingerprint,
  walletAddress: string,
  transactionData: any
): Promise<number> {
  try {
    // --- Broker 初期化 ---
    const rpcUrl = process.env.OG_RPC_ENDPOINT ?? "https://evmrpc-testnet.0g.ai";
    const privateKey = process.env.OG_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("OG_PRIVATE_KEY is not defined");
    }
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const broker = await createZGComputeNetworkBroker(wallet);

    // --- 利用可能なサービスを取得 ---
    const services: ServiceStructOutput[] = await broker.inference.listService();

    // “sybil” モデルを探す（必要に応じてモデル名を固定できればより安全）
    const sybilService = services.find(s => s.model.toLowerCase().includes("sybil"));
    if (!sybilService) {
      throw new Error("No sybil detection service found in available 0G services");
    }

    const providerAddress = sybilService.provider;

    // --- プロバイダーの署名認証（初回のみ） ---
    await broker.inference.acknowledgeProviderSigner(providerAddress);

    // --- サービスメタデータ取得 ---
    const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);

    // --- リクエストヘッダー生成 ---
    const content = JSON.stringify({ fingerprint, walletAddress, transactionData });
    const headers = await broker.inference.getRequestHeaders(providerAddress, content);

    // --- サービスへのリクエスト ---
    const resp = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content }],
        model,
      }),
    });
    if (!resp.ok) {
      throw new Error(`0G service request failed: ${resp.status} ${resp.statusText}`);
    }

    const respJson = await resp.json();

    // （オプション）応答検証を行う場合
    // await broker.inference.processResponse(providerAddress, respJson.choices[0].message.content, optionalChatId);

    const strResult = respJson.choices?.[0]?.message?.content;
    const score = Number(strResult);
    if (isNaN(score)) {
      throw new Error("Received invalid score from 0G service: " + strResult);
    }

    return score;
  } catch (err) {
    console.error("Error in getOGComputeSybilScore, falling back to local:", err);
    return calculateSybilScore(fingerprint).score;
  }
}