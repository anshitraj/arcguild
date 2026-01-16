// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SeasonEngine
 * @notice Manages seasons and score emissions for guild wars
 */
contract SeasonEngine is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SCORER_ROLE = keccak256("SCORER_ROLE");
    
    enum SeasonStatus { DRAFT, ACTIVE, ENDED }
    
    struct Season {
        uint256 id;
        string name;
        uint256 startTime;
        uint256 endTime;
        SeasonStatus status;
        string configHash; // IPFS hash of season config
    }
    
    struct Score {
        uint256 guildPoints;
        uint256 individualPoints;
        uint256 lastUpdated;
    }
    
    // State
    uint256 private _seasonIdCounter;
    mapping(uint256 => Season) public seasons;
    mapping(uint256 => mapping(uint256 => Score)) public guildScores; // seasonId => guildId => Score
    mapping(uint256 => mapping(address => Score)) public userScores; // seasonId => user => Score
    
    // Events
    event SeasonCreated(uint256 indexed seasonId, string name, uint256 startTime, uint256 endTime);
    event SeasonStatusChanged(uint256 indexed seasonId, SeasonStatus newStatus);
    event ScoreEmitted(
        uint256 indexed seasonId,
        uint256 indexed guildId,
        address indexed user,
        uint256 guildPoints,
        uint256 individualPoints,
        string reason
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @notice Create a new season
     * @param name Season name
     * @param startTime Start timestamp
     * @param endTime End timestamp
     * @param configHash IPFS hash of season configuration
     */
    function createSeason(
        string calldata name,
        uint256 startTime,
        uint256 endTime,
        string calldata configHash
    ) external onlyRole(ADMIN_ROLE) returns (uint256) {
        require(startTime < endTime, "Invalid time range");
        require(startTime > block.timestamp, "Start time must be in future");
        
        _seasonIdCounter++;
        uint256 seasonId = _seasonIdCounter;
        
        seasons[seasonId] = Season({
            id: seasonId,
            name: name,
            startTime: startTime,
            endTime: endTime,
            status: SeasonStatus.DRAFT,
            configHash: configHash
        });
        
        emit SeasonCreated(seasonId, name, startTime, endTime);
        
        return seasonId;
    }
    
    /**
     * @notice Start a season
     * @param seasonId Season ID
     */
    function startSeason(uint256 seasonId) external onlyRole(ADMIN_ROLE) {
        require(seasons[seasonId].status == SeasonStatus.DRAFT, "Season not in draft");
        require(block.timestamp >= seasons[seasonId].startTime, "Too early to start");
        
        seasons[seasonId].status = SeasonStatus.ACTIVE;
        
        emit SeasonStatusChanged(seasonId, SeasonStatus.ACTIVE);
    }
    
    /**
     * @notice End a season
     * @param seasonId Season ID
     */
    function endSeason(uint256 seasonId) external onlyRole(ADMIN_ROLE) {
        require(seasons[seasonId].status == SeasonStatus.ACTIVE, "Season not active");
        
        seasons[seasonId].status = SeasonStatus.ENDED;
        
        emit SeasonStatusChanged(seasonId, SeasonStatus.ENDED);
    }
    
    /**
     * @notice Emit score for a user and guild (scorer service only)
     * @param seasonId Season ID
     * @param guildId Guild ID
     * @param user User address
     * @param guildPoints Points to add to guild
     * @param individualPoints Points to add to user
     * @param reason Reason for score emission
     */
    function emitScore(
        uint256 seasonId,
        uint256 guildId,
        address user,
        uint256 guildPoints,
        uint256 individualPoints,
        string calldata reason
    ) external onlyRole(SCORER_ROLE) nonReentrant {
        require(seasons[seasonId].status == SeasonStatus.ACTIVE, "Season not active");
        
        // Update guild score
        guildScores[seasonId][guildId].guildPoints += guildPoints;
        guildScores[seasonId][guildId].lastUpdated = block.timestamp;
        
        // Update user score
        userScores[seasonId][user].individualPoints += individualPoints;
        userScores[seasonId][user].lastUpdated = block.timestamp;
        
        emit ScoreEmitted(seasonId, guildId, user, guildPoints, individualPoints, reason);
    }
    
    /**
     * @notice Grant scorer role to backend service
     * @param scorer Address to grant scorer role
     */
    function grantScorerRole(address scorer) external onlyRole(ADMIN_ROLE) {
        _grantRole(SCORER_ROLE, scorer);
    }
    
    /**
     * @notice Revoke scorer role
     * @param scorer Address to revoke scorer role from
     */
    function revokeScorerRole(address scorer) external onlyRole(ADMIN_ROLE) {
        _revokeRole(SCORER_ROLE, scorer);
    }
    
    // View functions
    function getGuildScore(uint256 seasonId, uint256 guildId) external view returns (uint256) {
        return guildScores[seasonId][guildId].guildPoints;
    }
    
    function getUserScore(uint256 seasonId, address user) external view returns (uint256) {
        return userScores[seasonId][user].individualPoints;
    }
    
    function getCurrentSeasonId() external view returns (uint256) {
        return _seasonIdCounter;
    }
}
