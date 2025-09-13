import { useAccount, useConnect, useDisconnect, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, TASK_REGISTRY_ABI, PAYOUT_SPLITTER_ABI } from '@/lib/wagmi';
import { useState, useEffect } from 'react';

export interface Task {
  id: number;
  name: string;
  description: string;
  category: number;
  status: number;
  rewardAmount: bigint;
  maxParticipants: number;
  currentParticipants: number;
  startTime: bigint;
  endTime: bigint;
  verificationCriteria: string;
  requiresKYC: boolean;
  sybilThreshold: number;
}

export interface UserStats {
  totalEarnings: bigint;
  completedTasks: number;
  directReferrals: number;
  indirectReferrals: number;
  sybilScore: number;
}

export function useWeb3() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  return {
    address,
    isConnected,
    connect,
    disconnect,
    connectors,
    balance,
    writeContract,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useTasks() {
  const { address } = useAccount();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Read active tasks from contract
  const { data: taskCount } = useReadContract({
    address: CONTRACT_ADDRESSES.TASK_REGISTRY,
    abi: TASK_REGISTRY_ABI,
    functionName: 'nextTaskId',
  });

  useEffect(() => {
    if (taskCount) {
      // Fetch all tasks
      const fetchTasks = async () => {
        const taskPromises = [];
        for (let i = 1; i < Number(taskCount); i++) {
          taskPromises.push(
            useReadContract({
              address: CONTRACT_ADDRESSES.TASK_REGISTRY,
              abi: TASK_REGISTRY_ABI,
              functionName: 'getTask',
              args: [BigInt(i)],
            })
          );
        }
        // This would need to be implemented properly with Promise.all
        setLoading(false);
      };
      fetchTasks();
    }
  }, [taskCount]);

  return { tasks, loading };
}

export function useUserStats() {
  const { address } = useAccount();
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Read user earnings
  const { data: totalEarnings } = useReadContract({
    address: CONTRACT_ADDRESSES.PAYOUT_SPLITTER,
    abi: PAYOUT_SPLITTER_ABI,
    functionName: 'getUserTotalEarnings',
    args: address ? [address] : undefined,
  });

  // Read completed tasks
  const { data: completedTasks } = useReadContract({
    address: CONTRACT_ADDRESSES.TASK_REGISTRY,
    abi: TASK_REGISTRY_ABI,
    functionName: 'getUserCompletedTasks',
    args: address ? [address] : undefined,
  });

  // Read referral data
  const { data: referralData } = useReadContract({
    address: CONTRACT_ADDRESSES.PAYOUT_SPLITTER,
    abi: PAYOUT_SPLITTER_ABI,
    functionName: 'getReferralData',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (totalEarnings !== undefined && completedTasks !== undefined && referralData !== undefined) {
      setUserStats({
        totalEarnings: totalEarnings as bigint,
        completedTasks: (completedTasks as number[])?.length || 0,
        directReferrals: 0, // Would be calculated from referral data
        indirectReferrals: 0, // Would be calculated from referral data
        sybilScore: 95, // Would be fetched from verification system
      });
    }
  }, [totalEarnings, completedTasks, referralData]);

  return { userStats };
}

export function useTaskActions() {
  const { writeContract } = useWeb3();

  const completeTask = async (taskId: number, proofData: string) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.TASK_REGISTRY,
        abi: TASK_REGISTRY_ABI,
        functionName: 'completeTask',
        args: [BigInt(taskId), proofData],
      });
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  };

  const registerWithReferral = async (referralCode: string) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.PAYOUT_SPLITTER,
        abi: PAYOUT_SPLITTER_ABI,
        functionName: 'registerWithReferral',
        args: [referralCode],
      });
    } catch (error) {
      console.error('Error registering with referral:', error);
      throw error;
    }
  };

  return {
    completeTask,
    registerWithReferral,
  };
}

