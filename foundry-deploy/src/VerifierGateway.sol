// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VerifierGateway
 * @dev Gateway for ØG Compute verification services
 * @notice Handles on-chain and off-chain task verification
 */
contract VerifierGateway is Ownable, ReentrancyGuard {
    
    // Verification types
    enum VerificationType {
        ONCHAIN_TRANSACTION,
        OFFCHAIN_SOCIAL,
        OFFCHAIN_GITHUB,
        OFFCHAIN_DISCORD,
        CUSTOM_ORACLE
    }

    // Verification result
    struct VerificationResult {
        bool verified;
        uint256 sybilScore;
        string proofHash;
        uint256 timestamp;
        address verifier;
    }

    // Task verification request
    struct VerificationRequest {
        uint256 taskId;
        address user;
        VerificationType verificationType;
        string proofData;
        bool processed;
        VerificationResult result;
    }

    // Events
    event VerificationRequested(
        uint256 indexed taskId,
        address indexed user,
        VerificationType verificationType,
        string proofData
    );
    event VerificationCompleted(
        uint256 indexed taskId,
        address indexed user,
        bool verified,
        uint256 sybilScore
    );
    event OracleRegistered(address indexed oracle, VerificationType verificationType);
    event OracleRemoved(address indexed oracle);

    // State variables
    mapping(uint256 => VerificationRequest) public verificationRequests;
    mapping(address => bool) public authorizedOracles;
    mapping(VerificationType => address) public oracleAddresses;
    mapping(address => uint256) public oracleNonces;
    
    uint256 public nextRequestId = 1;
    address public taskRegistry;
    
    // Sybil detection thresholds
    uint256 public constant MIN_SYBIL_SCORE = 50;
    uint256 public constant MAX_SYBIL_SCORE = 100;

    constructor(address _taskRegistry) Ownable(msg.sender) {
        taskRegistry = _taskRegistry;
    }

    /**
     * @dev Request task verification
     * @param _taskId Task ID
     * @param _user User address
     * @param _verificationType Type of verification
     * @param _proofData Proof data for verification
     */
    function requestVerification(
        uint256 _taskId,
        address _user,
        VerificationType _verificationType,
        string memory _proofData
    ) external nonReentrant returns (uint256) {
        require(msg.sender == taskRegistry, "Only task registry can request verification");
        require(oracleAddresses[_verificationType] != address(0), "No oracle for verification type");

        uint256 requestId = nextRequestId++;
        
        verificationRequests[requestId] = VerificationRequest({
            taskId: _taskId,
            user: _user,
            verificationType: _verificationType,
            proofData: _proofData,
            processed: false,
            result: VerificationResult({
                verified: false,
                sybilScore: 0,
                proofHash: "",
                timestamp: 0,
                verifier: address(0)
            })
        });

        emit VerificationRequested(_taskId, _user, _verificationType, _proofData);
        
        // Trigger ØG Compute verification
        _triggerOGComputeVerification(requestId, _verificationType, _proofData);
        
        return requestId;
    }

    /**
     * @dev Complete verification (called by oracle)
     * @param _requestId Verification request ID
     * @param _verified Whether verification passed
     * @param _sybilScore User's sybil resistance score
     * @param _proofHash Hash of verification proof
     */
    function completeVerification(
        uint256 _requestId,
        bool _verified,
        uint256 _sybilScore,
        string memory _proofHash
    ) external {
        require(authorizedOracles[msg.sender], "Only authorized oracles can complete verification");
        require(_requestId < nextRequestId, "Invalid request ID");
        require(!verificationRequests[_requestId].processed, "Request already processed");
        require(_sybilScore >= 0 && _sybilScore <= 100, "Invalid sybil score");

        VerificationRequest storage request = verificationRequests[_requestId];
        request.processed = true;
        request.result = VerificationResult({
            verified: _verified,
            sybilScore: _sybilScore,
            proofHash: _proofHash,
            timestamp: block.timestamp,
            verifier: msg.sender
        });

        // Update oracle nonce for replay protection
        oracleNonces[msg.sender]++;

        emit VerificationCompleted(request.taskId, request.user, _verified, _sybilScore);

        // Notify task registry of verification result
        _notifyTaskRegistry(request.taskId, request.user, _verified, _sybilScore);
    }

    /**
     * @dev Register oracle for specific verification type
     * @param _oracle Oracle address
     * @param _verificationType Verification type
     */
    function registerOracle(address _oracle, VerificationType _verificationType) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        authorizedOracles[_oracle] = true;
        oracleAddresses[_verificationType] = _oracle;
        emit OracleRegistered(_oracle, _verificationType);
    }

    /**
     * @dev Remove oracle
     * @param _oracle Oracle address
     */
    function removeOracle(address _oracle) external onlyOwner {
        require(authorizedOracles[_oracle], "Oracle not registered");
        authorizedOracles[_oracle] = false;
        
        // Remove from all verification types
        for (uint256 i = 0; i < 5; i++) {
            if (oracleAddresses[VerificationType(i)] == _oracle) {
                oracleAddresses[VerificationType(i)] = address(0);
            }
        }
        
        emit OracleRemoved(_oracle);
    }

    /**
     * @dev Get verification request
     * @param _requestId Request ID
     * @return Verification request data
     */
    function getVerificationRequest(uint256 _requestId) external view returns (VerificationRequest memory) {
        return verificationRequests[_requestId];
    }

    /**
     * @dev Check if user has valid sybil score
     * @param _user User address
     * @param _minScore Minimum required score
     * @return Whether user meets sybil requirements
     */
    function checkSybilResistance(address _user, uint256 _minScore) external view returns (bool) {
        // This would integrate with ØG Compute for real-time sybil detection
        // For now, return true as placeholder
        return true;
    }

    /**
     * @dev Get oracle nonce for replay protection
     * @param _oracle Oracle address
     * @return Current nonce
     */
    function getOracleNonce(address _oracle) external view returns (uint256) {
        return oracleNonces[_oracle];
    }

    /**
     * @dev Internal function to trigger ØG Compute verification
     * @param _requestId Request ID
     * @param _verificationType Verification type
     * @param _proofData Proof data
     */
    function _triggerOGComputeVerification(
        uint256 _requestId,
        VerificationType _verificationType,
        string memory _proofData
    ) internal {
        // This would integrate with ØG Compute for AI-powered verification
        // For now, we'll simulate the verification process
        
        // In a real implementation, this would:
        // 1. Send verification request to ØG Compute
        // 2. Wait for AI model processing
        // 3. Receive verification result and sybil score
        // 4. Call completeVerification with results
    }

    /**
     * @dev Internal function to notify task registry
     * @param _taskId Task ID
     * @param _user User address
     * @param _verified Whether verified
     * @param _sybilScore Sybil score
     */
    function _notifyTaskRegistry(
        uint256 _taskId,
        address _user,
        bool _verified,
        uint256 _sybilScore
    ) internal {
        // This would call the task registry's verifyTaskCompletion function
        // For now, we'll emit an event that the registry can listen to
    }

    /**
     * @dev Set task registry address
     * @param _registry New registry address
     */
    function setTaskRegistry(address _registry) external onlyOwner {
        require(_registry != address(0), "Invalid registry address");
        taskRegistry = _registry;
    }
}

