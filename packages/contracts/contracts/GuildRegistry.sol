// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GuildRegistry
 * @notice Manages guild creation, membership, and invite codes onchain
 */
contract GuildRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    struct Guild {
        uint256 id;
        string handle;
        string metadataURI;
        address creator;
        uint256 createdAt;
        bool active;
    }
    
    struct Member {
        address memberAddress;
        uint8 role; // 0=MEMBER, 1=OFFICER, 2=LEADER
        uint256 joinedAt;
    }
    
    // State
    uint256 private _guildIdCounter;
    mapping(uint256 => Guild) public guilds;
    mapping(string => uint256) public handleToGuildId;
    mapping(uint256 => mapping(address => Member)) public guildMembers;
    mapping(uint256 => address[]) public guildMemberList;
    mapping(uint256 => bytes32) public guildInviteCodes;
    
    // Events
    event GuildCreated(uint256 indexed guildId, string handle, address indexed creator, string metadataURI);
    event MemberJoined(uint256 indexed guildId, address indexed member, bytes32 inviteCode);
    event MemberLeft(uint256 indexed guildId, address indexed member);
    event RoleChanged(uint256 indexed guildId, address indexed member, uint8 newRole);
    event InviteRotated(uint256 indexed guildId, bytes32 newInviteCode);
    event GuildDeactivated(uint256 indexed guildId);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @notice Create a new guild
     * @param handle Unique guild handle
     * @param metadataURI IPFS or HTTP URI for guild metadata
     */
    function createGuild(string calldata handle, string calldata metadataURI) 
        external 
        nonReentrant 
        returns (uint256) 
    {
        require(bytes(handle).length > 0 && bytes(handle).length <= 32, "Invalid handle length");
        require(handleToGuildId[handle] == 0, "Handle already taken");
        
        _guildIdCounter++;
        uint256 guildId = _guildIdCounter;
        
        guilds[guildId] = Guild({
            id: guildId,
            handle: handle,
            metadataURI: metadataURI,
            creator: msg.sender,
            createdAt: block.timestamp,
            active: true
        });
        
        handleToGuildId[handle] = guildId;
        
        // Creator automatically becomes leader
        _addMember(guildId, msg.sender, 2);
        
        // Generate initial invite code
        bytes32 inviteCode = keccak256(abi.encodePacked(guildId, block.timestamp, msg.sender));
        guildInviteCodes[guildId] = inviteCode;
        
        emit GuildCreated(guildId, handle, msg.sender, metadataURI);
        emit InviteRotated(guildId, inviteCode);
        
        return guildId;
    }
    
    /**
     * @notice Join a guild using invite code
     * @param guildId Guild ID to join
     * @param inviteCode Invite code provided by guild leader
     */
    function joinGuild(uint256 guildId, bytes32 inviteCode) external nonReentrant {
        require(guilds[guildId].active, "Guild not active");
        require(guildInviteCodes[guildId] == inviteCode, "Invalid invite code");
        require(guildMembers[guildId][msg.sender].memberAddress == address(0), "Already a member");
        
        _addMember(guildId, msg.sender, 0);
        
        emit MemberJoined(guildId, msg.sender, inviteCode);
    }
    
    /**
     * @notice Leave a guild
     * @param guildId Guild ID to leave
     */
    function leaveGuild(uint256 guildId) external nonReentrant {
        require(guildMembers[guildId][msg.sender].memberAddress != address(0), "Not a member");
        require(guildMembers[guildId][msg.sender].role != 2, "Leaders cannot leave");
        
        _removeMember(guildId, msg.sender);
        
        emit MemberLeft(guildId, msg.sender);
    }
    
    /**
     * @notice Set member role (leader only)
     * @param guildId Guild ID
     * @param member Member address
     * @param newRole New role (0=MEMBER, 1=OFFICER, 2=LEADER)
     */
    function setMemberRole(uint256 guildId, address member, uint8 newRole) external {
        require(guildMembers[guildId][msg.sender].role == 2, "Only leader can change roles");
        require(guildMembers[guildId][member].memberAddress != address(0), "Not a member");
        require(newRole <= 2, "Invalid role");
        
        guildMembers[guildId][member].role = newRole;
        
        emit RoleChanged(guildId, member, newRole);
    }
    
    /**
     * @notice Rotate invite code (leader only)
     * @param guildId Guild ID
     */
    function rotateInviteCode(uint256 guildId) external returns (bytes32) {
        require(guildMembers[guildId][msg.sender].role == 2, "Only leader can rotate invite");
        
        bytes32 newInviteCode = keccak256(abi.encodePacked(guildId, block.timestamp, msg.sender, block.prevrandao));
        guildInviteCodes[guildId] = newInviteCode;
        
        emit InviteRotated(guildId, newInviteCode);
        
        return newInviteCode;
    }
    
    /**
     * @notice Deactivate guild (admin only)
     * @param guildId Guild ID
     */
    function deactivateGuild(uint256 guildId) external onlyRole(ADMIN_ROLE) {
        guilds[guildId].active = false;
        emit GuildDeactivated(guildId);
    }
    
    // Internal functions
    function _addMember(uint256 guildId, address member, uint8 role) private {
        guildMembers[guildId][member] = Member({
            memberAddress: member,
            role: role,
            joinedAt: block.timestamp
        });
        guildMemberList[guildId].push(member);
    }
    
    function _removeMember(uint256 guildId, address member) private {
        delete guildMembers[guildId][member];
        
        // Remove from member list
        address[] storage members = guildMemberList[guildId];
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == member) {
                members[i] = members[members.length - 1];
                members.pop();
                break;
            }
        }
    }
    
    // View functions
    function getGuildMemberCount(uint256 guildId) external view returns (uint256) {
        return guildMemberList[guildId].length;
    }
    
    function getGuildMembers(uint256 guildId) external view returns (address[] memory) {
        return guildMemberList[guildId];
    }
    
    function isMember(uint256 guildId, address account) external view returns (bool) {
        return guildMembers[guildId][account].memberAddress != address(0);
    }
}
