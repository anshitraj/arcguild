// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title XPSystem
 * @notice Manages XP, levels, and reputation onchain
 */
contract XPSystem is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant GRANTER_ROLE = keccak256("GRANTER_ROLE");
    
    struct UserStats {
        uint256 xp;
        uint256 level;
        uint256 reputation;
        uint256 lastUpdate;
    }
    
    mapping(address => UserStats) public userStats;
    mapping(uint256 => uint256) public levelThresholds; // level => XP required
    
    event XPGranted(address indexed user, uint256 amount, string reason);
    event LevelUp(address indexed user, uint256 newLevel);
    event ReputationChanged(address indexed user, uint256 newReputation);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        // Set level thresholds (exponential curve)
        levelThresholds[1] = 0;
        levelThresholds[2] = 100;
        levelThresholds[3] = 300;
        levelThresholds[4] = 600;
        levelThresholds[5] = 1000;
        levelThresholds[6] = 1500;
        levelThresholds[7] = 2100;
        levelThresholds[8] = 2800;
        levelThresholds[9] = 3600;
        levelThresholds[10] = 4500;
        // Continue pattern: each level requires +100 more XP than previous gap
    }
    
    /**
     * @notice Grant XP to a user
     * @param user User address
     * @param amount XP amount
     * @param reason Reason for grant
     */
    function grantXP(
        address user,
        uint256 amount,
        string calldata reason
    ) external onlyRole(GRANTER_ROLE) nonReentrant {
        UserStats storage stats = userStats[user];
        
        // Initialize if first time
        if (stats.level == 0) {
            stats.level = 1;
            stats.reputation = 100;
        }
        
        stats.xp += amount;
        stats.lastUpdate = block.timestamp;
        
        // Check for level up
        uint256 newLevel = _calculateLevel(stats.xp);
        if (newLevel > stats.level) {
            stats.level = newLevel;
            emit LevelUp(user, newLevel);
        }
        
        emit XPGranted(user, amount, reason);
    }
    
    /**
     * @notice Update user reputation
     * @param user User address
     * @param newReputation New reputation score (0-100)
     */
    function updateReputation(
        address user,
        uint256 newReputation
    ) external onlyRole(ADMIN_ROLE) {
        require(newReputation <= 100, "Reputation must be <= 100");
        
        userStats[user].reputation = newReputation;
        
        emit ReputationChanged(user, newReputation);
    }
    
    /**
     * @notice Calculate level from XP
     */
    function _calculateLevel(uint256 xp) internal view returns (uint256) {
        uint256 level = 1;
        
        for (uint256 i = 2; i <= 10; i++) {
            if (xp >= levelThresholds[i]) {
                level = i;
            } else {
                break;
            }
        }
        
        // For levels > 10, use formula
        if (xp >= levelThresholds[10]) {
            uint256 xpAbove10 = xp - levelThresholds[10];
            uint256 levelsAbove10 = xpAbove10 / 1000; // 1000 XP per level after 10
            level = 10 + levelsAbove10;
        }
        
        return level;
    }
    
    /**
     * @notice Get user stats
     */
    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }
    
    /**
     * @notice Grant granter role
     */
    function grantGranterRole(address granter) external onlyRole(ADMIN_ROLE) {
        _grantRole(GRANTER_ROLE, granter);
    }
}
