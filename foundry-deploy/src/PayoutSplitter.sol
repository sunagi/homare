// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PayoutSplitter
 * @dev Handles automatic revenue distribution for multi-level referral system
 * @notice Distributes rewards to task completers and their referral network
 */
contract PayoutSplitter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Referral structure
    struct ReferralData {
        address directReferrer;
        address[] indirectReferrers; // Up to 3 levels
        bool isActive;
        uint256 totalEarnings;
        uint256 directEarnings;
        uint256 indirectEarnings;
    }

    // Payout structure
    struct PayoutDistribution {
        uint256 taskCompleterReward; // 60% of total reward
        uint256 directReferrerReward; // 25% of total reward
        uint256 indirectReferrerReward; // 15% of total reward (split among levels)
        uint256 platformFee; // 5% of total reward
    }

    // Events
    event ReferralRegistered(address indexed user, address indexed referrer);
    event PayoutDistributed(
        address indexed taskCompleter,
        uint256 taskId,
        uint256 totalAmount,
        uint256 completerAmount,
        uint256 referrerAmount,
        uint256 platformAmount
    );
    event EarningsUpdated(address indexed user, uint256 newTotal);

    // State variables
    mapping(address => ReferralData) public referrals;
    mapping(address => bool) public registeredUsers;
    
    address public taskRegistry;
    address public platformWallet;
    
    // Distribution percentages (in basis points, 10000 = 100%)
    uint256 public constant TASK_COMPLETER_PERCENT = 6000; // 60%
    uint256 public constant DIRECT_REFERRER_PERCENT = 2500; // 25%
    uint256 public constant INDIRECT_REFERRER_PERCENT = 1500; // 15%
    uint256 public constant PLATFORM_FEE_PERCENT = 1000; // 10%
    
    // Maximum referral levels
    uint256 public constant MAX_REFERRAL_LEVELS = 3;
    
    // Supported tokens
    mapping(address => bool) public supportedTokens;

    constructor(address _taskRegistry, address _platformWallet) Ownable(msg.sender) {
        taskRegistry = _taskRegistry;
        platformWallet = _platformWallet;
    }

    /**
     * @dev Register a new user with referral
     * @param _referrerCode Referral code of the referrer
     */
    function registerWithReferral(string memory _referrerCode) external {
        require(!registeredUsers[msg.sender], "User already registered");
        
        address referrer = _getAddressFromReferralCode(_referrerCode);
        require(referrer != address(0), "Invalid referral code");
        require(referrer != msg.sender, "Cannot refer yourself");

        // Build referral chain
        address[] memory indirectReferrers = new address[](MAX_REFERRAL_LEVELS);
        address currentReferrer = referrer;
        
        for (uint256 i = 0; i < MAX_REFERRAL_LEVELS; i++) {
            if (currentReferrer == address(0)) break;
            
            if (i == 0) {
                // Direct referrer
                referrals[msg.sender].directReferrer = currentReferrer;
            } else {
                // Indirect referrer
                indirectReferrers[i - 1] = currentReferrer;
            }
            
            // Move up the referral chain
            currentReferrer = referrals[currentReferrer].directReferrer;
        }

        referrals[msg.sender].indirectReferrers = indirectReferrers;
        referrals[msg.sender].isActive = true;
        registeredUsers[msg.sender] = true;

        emit ReferralRegistered(msg.sender, referrer);
    }

    /**
     * @dev Distribute payout for completed task
     * @param _taskCompleter Address of user who completed the task
     * @param _taskId Task ID
     * @param _totalReward Total reward amount
     * @param _tokenAddress Token address for payout
     */
    function distributePayout(
        address _taskCompleter,
        uint256 _taskId,
        uint256 _totalReward,
        address _tokenAddress
    ) external nonReentrant {
        require(msg.sender == taskRegistry, "Only task registry can trigger payout");
        require(supportedTokens[_tokenAddress], "Token not supported");
        require(_totalReward > 0, "Invalid reward amount");

        IERC20 token = IERC20(_tokenAddress);
        require(token.balanceOf(address(this)) >= _totalReward, "Insufficient contract balance");

        PayoutDistribution memory distribution = _calculateDistribution(_totalReward);
        ReferralData storage referrerData = referrals[_taskCompleter];

        // Distribute to task completer (60%)
        if (distribution.taskCompleterReward > 0) {
            token.safeTransfer(_taskCompleter, distribution.taskCompleterReward);
            referrerData.totalEarnings += distribution.taskCompleterReward;
        }

        // Distribute to direct referrer (25%)
        if (referrerData.directReferrer != address(0) && distribution.directReferrerReward > 0) {
            token.safeTransfer(referrerData.directReferrer, distribution.directReferrerReward);
            referrals[referrerData.directReferrer].totalEarnings += distribution.directReferrerReward;
            referrals[referrerData.directReferrer].directEarnings += distribution.directReferrerReward;
        }

        // Distribute to indirect referrers (15%)
        if (distribution.indirectReferrerReward > 0) {
            uint256 indirectRewardPerLevel = distribution.indirectReferrerReward / MAX_REFERRAL_LEVELS;
            
            for (uint256 i = 0; i < referrerData.indirectReferrers.length; i++) {
                address indirectReferrer = referrerData.indirectReferrers[i];
                if (indirectReferrer != address(0)) {
                    token.safeTransfer(indirectReferrer, indirectRewardPerLevel);
                    referrals[indirectReferrer].totalEarnings += indirectRewardPerLevel;
                    referrals[indirectReferrer].indirectEarnings += indirectRewardPerLevel;
                }
            }
        }

        // Platform fee (10%)
        if (distribution.platformFee > 0) {
            token.safeTransfer(platformWallet, distribution.platformFee);
        }

        emit PayoutDistributed(
            _taskCompleter,
            _taskId,
            _totalReward,
            distribution.taskCompleterReward,
            distribution.directReferrerReward + distribution.indirectReferrerReward,
            distribution.platformFee
        );

        emit EarningsUpdated(_taskCompleter, referrerData.totalEarnings);
    }

    /**
     * @dev Calculate distribution amounts
     * @param _totalReward Total reward amount
     * @return Distribution breakdown
     */
    function _calculateDistribution(uint256 _totalReward) internal pure returns (PayoutDistribution memory) {
        return PayoutDistribution({
            taskCompleterReward: (_totalReward * TASK_COMPLETER_PERCENT) / 10000,
            directReferrerReward: (_totalReward * DIRECT_REFERRER_PERCENT) / 10000,
            indirectReferrerReward: (_totalReward * INDIRECT_REFERRER_PERCENT) / 10000,
            platformFee: (_totalReward * PLATFORM_FEE_PERCENT) / 10000
        });
    }

    /**
     * @dev Get address from referral code
     * @param _referralCode Referral code
     * @return Address of referrer
     */
    function _getAddressFromReferralCode(string memory _referralCode) internal view returns (address) {
        // In a real implementation, this would decode the referral code
        // For now, we'll use a simple mapping
        // This would be replaced with a proper referral code system
        return address(0); // Placeholder
    }

    /**
     * @dev Get user's referral data
     * @param _user User address
     * @return Referral data
     */
    function getReferralData(address _user) external view returns (ReferralData memory) {
        return referrals[_user];
    }

    /**
     * @dev Get user's total earnings
     * @param _user User address
     * @return Total earnings
     */
    function getUserTotalEarnings(address _user) external view returns (uint256) {
        return referrals[_user].totalEarnings;
    }

    /**
     * @dev Get user's direct earnings
     * @param _user User address
     * @return Direct earnings
     */
    function getUserDirectEarnings(address _user) external view returns (uint256) {
        return referrals[_user].directEarnings;
    }

    /**
     * @dev Get user's indirect earnings
     * @param _user User address
     * @return Indirect earnings
     */
    function getUserIndirectEarnings(address _user) external view returns (uint256) {
        return referrals[_user].indirectEarnings;
    }

    /**
     * @dev Add supported token
     * @param _token Token address
     */
    function addSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = true;
    }

    /**
     * @dev Set platform wallet
     * @param _wallet New platform wallet address
     */
    function setPlatformWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid wallet address");
        platformWallet = _wallet;
    }

    /**
     * @dev Set task registry address
     * @param _registry New registry address
     */
    function setTaskRegistry(address _registry) external onlyOwner {
        require(_registry != address(0), "Invalid registry address");
        taskRegistry = _registry;
    }

    /**
     * @dev Emergency withdraw tokens
     * @param _token Token address
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20 token = IERC20(_token);
        token.safeTransfer(owner(), _amount);
    }
}

