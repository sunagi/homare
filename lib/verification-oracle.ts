import { generateDeviceFingerprint, advancedSybilDetection } from './sybil-detection';

export interface VerificationRequest {
  taskId: number;
  userId: string;
  walletAddress: string;
  proofData: any;
  verificationType: 'ONCHAIN' | 'OFFCHAIN_SOCIAL' | 'OFFCHAIN_GITHUB' | 'OFFCHAIN_DISCORD';
}

export interface VerificationResult {
  verified: boolean;
  sybilScore: number;
  proofHash: string;
  timestamp: number;
  details: string;
}

/**
 * Verify on-chain transaction tasks (Swap, Bridge, DeFi)
 */
export async function verifyOnChainTask(
  taskId: number,
  walletAddress: string,
  proofData: any
): Promise<VerificationResult> {
  try {
    const { transactionHash, expectedAmount, tokenAddress } = proofData;
    
    // Verify transaction exists and is valid
    const txValid = await verifyTransaction(transactionHash, walletAddress, expectedAmount, tokenAddress);
    
    if (!txValid) {
      return {
        verified: false,
        sybilScore: 0,
        proofHash: '',
        timestamp: Date.now(),
        details: 'Transaction verification failed',
      };
    }

    // Get sybil score
    const fingerprint = generateDeviceFingerprint();
    const sybilResult = advancedSybilDetection(fingerprint, walletAddress, [], []);
    
    return {
      verified: true,
      sybilScore: sybilResult.score,
      proofHash: generateProofHash(transactionHash, walletAddress),
      timestamp: Date.now(),
      details: 'On-chain transaction verified successfully',
    };
  } catch (error) {
    console.error('Error verifying on-chain task:', error);
    return {
      verified: false,
      sybilScore: 0,
      proofHash: '',
      timestamp: Date.now(),
      details: 'Verification error occurred',
    };
  }
}

/**
 * Verify off-chain social tasks (Twitter, Discord)
 */
export async function verifyOffChainSocialTask(
  taskId: number,
  walletAddress: string,
  proofData: any
): Promise<VerificationResult> {
  try {
    const { platform, action, proof } = proofData;
    
    let verified = false;
    let details = '';

    switch (platform) {
      case 'twitter':
        verified = await verifyTwitterAction(action, proof);
        details = verified ? 'Twitter action verified' : 'Twitter verification failed';
        break;
      case 'discord':
        verified = await verifyDiscordAction(action, proof);
        details = verified ? 'Discord action verified' : 'Discord verification failed';
        break;
      default:
        return {
          verified: false,
          sybilScore: 0,
          proofHash: '',
          timestamp: Date.now(),
          details: 'Unsupported social platform',
        };
    }

    if (!verified) {
      return {
        verified: false,
        sybilScore: 0,
        proofHash: '',
        timestamp: Date.now(),
        details,
      };
    }

    // Get sybil score
    const fingerprint = generateDeviceFingerprint();
    const sybilResult = advancedSybilDetection(fingerprint, walletAddress, [], []);
    
    return {
      verified: true,
      sybilScore: sybilResult.score,
      proofHash: generateProofHash(platform, action, proof),
      timestamp: Date.now(),
      details,
    };
  } catch (error) {
    console.error('Error verifying off-chain social task:', error);
    return {
      verified: false,
      sybilScore: 0,
      proofHash: '',
      timestamp: Date.now(),
      details: 'Social verification error occurred',
    };
  }
}

/**
 * Verify GitHub tasks
 */
export async function verifyGitHubTask(
  taskId: number,
  walletAddress: string,
  proofData: any
): Promise<VerificationResult> {
  try {
    const { repository, action, proof } = proofData;
    
    // Verify GitHub action (star, fork, follow, etc.)
    const verified = await verifyGitHubAction(repository, action, proof);
    
    if (!verified) {
      return {
        verified: false,
        sybilScore: 0,
        proofHash: '',
        timestamp: Date.now(),
        details: 'GitHub action verification failed',
      };
    }

    // Get sybil score
    const fingerprint = generateDeviceFingerprint();
    const sybilResult = advancedSybilDetection(fingerprint, walletAddress, [], []);
    
    return {
      verified: true,
      sybilScore: sybilResult.score,
      proofHash: generateProofHash(repository, action, proof),
      timestamp: Date.now(),
      details: 'GitHub action verified successfully',
    };
  } catch (error) {
    console.error('Error verifying GitHub task:', error);
    return {
      verified: false,
      sybilScore: 0,
      proofHash: '',
      timestamp: Date.now(),
      details: 'GitHub verification error occurred',
    };
  }
}

/**
 * Verify transaction on blockchain
 */
async function verifyTransaction(
  txHash: string,
  walletAddress: string,
  expectedAmount: number,
  tokenAddress: string
): Promise<boolean> {
  try {
    // This would integrate with actual blockchain RPC
    // For now, simulate verification
    const response = await fetch('/api/blockchain/verify-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        txHash,
        walletAddress,
        expectedAmount,
        tokenAddress,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.verified;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
}

/**
 * Verify Twitter action
 */
async function verifyTwitterAction(action: string, proof: any): Promise<boolean> {
  try {
    // This would integrate with Twitter API
    const response = await fetch('/api/social/twitter/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        proof,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.verified;
  } catch (error) {
    console.error('Error verifying Twitter action:', error);
    return false;
  }
}

/**
 * Verify Discord action
 */
async function verifyDiscordAction(action: string, proof: any): Promise<boolean> {
  try {
    // This would integrate with Discord API
    const response = await fetch('/api/social/discord/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        proof,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.verified;
  } catch (error) {
    console.error('Error verifying Discord action:', error);
    return false;
  }
}

/**
 * Verify GitHub action
 */
async function verifyGitHubAction(repository: string, action: string, proof: any): Promise<boolean> {
  try {
    // This would integrate with GitHub API
    const response = await fetch('/api/social/github/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repository,
        action,
        proof,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.verified;
  } catch (error) {
    console.error('Error verifying GitHub action:', error);
    return false;
  }
}

/**
 * Generate proof hash for verification
 */
function generateProofHash(...data: any[]): string {
  const combined = data.join('|');
  return btoa(combined).replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Main verification function that routes to appropriate verifier
 */
export async function verifyTask(request: VerificationRequest): Promise<VerificationResult> {
  switch (request.verificationType) {
    case 'ONCHAIN':
      return verifyOnChainTask(request.taskId, request.walletAddress, request.proofData);
    case 'OFFCHAIN_SOCIAL':
      return verifyOffChainSocialTask(request.taskId, request.walletAddress, request.proofData);
    case 'OFFCHAIN_GITHUB':
      return verifyGitHubTask(request.taskId, request.walletAddress, request.proofData);
    case 'OFFCHAIN_DISCORD':
      return verifyOffChainSocialTask(request.taskId, request.walletAddress, request.proofData);
    default:
      return {
        verified: false,
        sybilScore: 0,
        proofHash: '',
        timestamp: Date.now(),
        details: 'Unsupported verification type',
      };
  }
}

