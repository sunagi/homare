// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title TaskRegistry
 * @dev Registry for managing Web3 affiliate campaign tasks on ØG Chain
 * @notice Handles task creation, verification, and reward distribution
 */
contract TaskRegistry is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Task categories
    enum TaskCategory {
        SWAP,
        BRIDGE,
        SOCIAL,
        DEFI,
        NFT,
        CUSTOM
    }

    // Task status
    enum TaskStatus {
        ACTIVE,
        PAUSED,
        COMPLETED,
        CANCELLED
    }

    // Task structure
    struct Task {
        uint256 id;
        address advertiser;
        string name;
        string description;
        TaskCategory category;
        TaskStatus status;
        uint256 rewardAmount;
        address rewardToken; // ERC20 token address
        uint256 maxParticipants;
        uint256 currentParticipants;
        uint256 startTime;
        uint256 endTime;
        string verificationCriteria;
        bool requiresKYC;
        uint256 sybilThreshold; // Minimum score to prevent sybil attacks
    }

    // User task completion
    struct TaskCompletion {
        address user;
        uint256 taskId;
        bool completed;
        bool verified;
        uint256 completionTime;
        string proofData; // On-chain or off-chain proof
        uint256 sybilScore;
    }

    // Events
    event TaskCreated(uint256 indexed taskId, address indexed advertiser, string name);
    event TaskCompleted(uint256 indexed taskId, address indexed user, uint256 rewardAmount);
    event TaskVerified(uint256 indexed taskId, address indexed user, bool verified);
    event TaskStatusUpdated(uint256 indexed taskId, TaskStatus newStatus);

    // State variables
    uint256 public nextTaskId = 1;
    mapping(uint256 => Task) public tasks;
    mapping(uint256 => mapping(address => TaskCompletion)) public taskCompletions;
    mapping(address => uint256[]) public userCompletedTasks;
    mapping(address => uint256) public userTotalEarnings;
    
    // Verification oracle address
    address public verificationOracle;
    
    // Referral system integration
    address public payoutSplitter;
    
    // Supported reward tokens
    mapping(address => bool) public supportedTokens;

    constructor(address _verificationOracle, address _payoutSplitter) Ownable(msg.sender) {
        verificationOracle = _verificationOracle;
        payoutSplitter = _payoutSplitter;
    }

    /**
     * @dev Create a new campaign task
     * @param _name Task name
     * @param _description Task description
     * @param _category Task category
     * @param _rewardAmount Reward amount in specified token
     * @param _rewardToken ERC20 token address for rewards
     * @param _maxParticipants Maximum number of participants
     * @param _duration Task duration in seconds
     * @param _verificationCriteria JSON string with verification requirements
     * @param _requiresKYC Whether task requires KYC
     * @param _sybilThreshold Minimum sybil resistance score
     */
    function createTask(
        string memory _name,
        string memory _description,
        TaskCategory _category,
        uint256 _rewardAmount,
        address _rewardToken,
        uint256 _maxParticipants,
        uint256 _duration,
        string memory _verificationCriteria,
        bool _requiresKYC,
        uint256 _sybilThreshold
    ) external onlyOwner returns (uint256) {
        require(_rewardAmount > 0, "Reward amount must be greater than 0");
        require(_rewardToken != address(0), "Invalid reward token address");
        require(supportedTokens[_rewardToken], "Reward token not supported");
        require(_maxParticipants > 0, "Max participants must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");

        uint256 taskId = nextTaskId++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + _duration;

        tasks[taskId] = Task({
            id: taskId,
            advertiser: msg.sender,
            name: _name,
            description: _description,
            category: _category,
            status: TaskStatus.ACTIVE,
            rewardAmount: _rewardAmount,
            rewardToken: _rewardToken,
            maxParticipants: _maxParticipants,
            currentParticipants: 0,
            startTime: startTime,
            endTime: endTime,
            verificationCriteria: _verificationCriteria,
            requiresKYC: _requiresKYC,
            sybilThreshold: _sybilThreshold
        });

        emit TaskCreated(taskId, msg.sender, _name);
        return taskId;
    }

    /**
     * @dev Complete a task (called by user)
     * @param _taskId Task ID to complete
     * @param _proofData Proof of task completion
     */
    function completeTask(uint256 _taskId, string memory _proofData) external nonReentrant {
        Task storage task = tasks[_taskId];
        require(task.status == TaskStatus.ACTIVE, "Task is not active");
        require(block.timestamp >= task.startTime && block.timestamp <= task.endTime, "Task not in valid time range");
        require(task.currentParticipants < task.maxParticipants, "Task is full");
        require(!taskCompletions[_taskId][msg.sender].completed, "Task already completed by user");

        // Create task completion record
        taskCompletions[_taskId][msg.sender] = TaskCompletion({
            user: msg.sender,
            taskId: _taskId,
            completed: true,
            verified: false,
            completionTime: block.timestamp,
            proofData: _proofData,
            sybilScore: 0 // Will be set by verification oracle
        });

        task.currentParticipants++;
        userCompletedTasks[msg.sender].push(_taskId);

        // Trigger verification process
        _triggerVerification(_taskId, msg.sender);
    }

    /**
     * @dev Verify task completion (called by verification oracle)
     * @param _taskId Task ID
     * @param _user User address
     * @param _verified Whether task is verified
     * @param _sybilScore User's sybil resistance score
     */
    function verifyTaskCompletion(
        uint256 _taskId,
        address _user,
        bool _verified,
        uint256 _sybilScore
    ) external {
        require(msg.sender == verificationOracle, "Only verification oracle can verify");
        require(taskCompletions[_taskId][_user].completed, "Task not completed by user");

        TaskCompletion storage completion = taskCompletions[_taskId][_user];
        completion.verified = _verified;
        completion.sybilScore = _sybilScore;

        if (_verified && _sybilScore >= tasks[_taskId].sybilThreshold) {
            // Trigger payout through PayoutSplitter
            _triggerPayout(_taskId, _user);
        }

        emit TaskVerified(_taskId, _user, _verified);
    }

    /**
     * @dev Update task status
     * @param _taskId Task ID
     * @param _newStatus New task status
     */
    function updateTaskStatus(uint256 _taskId, TaskStatus _newStatus) external onlyOwner {
        require(_taskId < nextTaskId, "Task does not exist");
        tasks[_taskId].status = _newStatus;
        emit TaskStatusUpdated(_taskId, _newStatus);
    }

    /**
     * @dev Set verification oracle address
     * @param _oracle New oracle address
     */
    function setVerificationOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        verificationOracle = _oracle;
    }

    /**
     * @dev Set payout splitter address
     * @param _splitter New splitter address
     */
    function setPayoutSplitter(address _splitter) external onlyOwner {
        require(_splitter != address(0), "Invalid splitter address");
        payoutSplitter = _splitter;
    }

    /**
     * @dev Add supported reward token
     * @param _token Token address
     */
    function addSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = true;
    }

    /**
     * @dev Get task details
     * @param _taskId Task ID
     * @return Task details
     */
    function getTask(uint256 _taskId) external view returns (Task memory) {
        return tasks[_taskId];
    }

    /**
     * @dev Get user's completed tasks
     * @param _user User address
     * @return Array of completed task IDs
     */
    function getUserCompletedTasks(address _user) external view returns (uint256[] memory) {
        return userCompletedTasks[_user];
    }

    /**
     * @dev Get user's total earnings
     * @param _user User address
     * @return Total earnings
     */
    function getUserTotalEarnings(address _user) external view returns (uint256) {
        return userTotalEarnings[_user];
    }

    /**
     * @dev Internal function to trigger verification
     * @param _taskId Task ID
     * @param _user User address
     */
    function _triggerVerification(uint256 _taskId, address _user) internal {
        // This would integrate with ØG Compute for AI-powered verification
        // For now, we'll emit an event that the oracle can listen to
        emit TaskCompleted(_taskId, _user, tasks[_taskId].rewardAmount);
    }

    /**
     * @dev Internal function to trigger payout
     * @param _taskId Task ID
     * @param _user User address
     */
    function _triggerPayout(uint256 _taskId, address _user) internal {
        // This would call the PayoutSplitter contract
        // For now, we'll update the user's total earnings
        userTotalEarnings[_user] += tasks[_taskId].rewardAmount;
    }
}

