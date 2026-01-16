// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BadgeFactory
 * @notice Factory for creating and minting badges (SBT or NFT)
 */
contract BadgeFactory is ERC721, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    struct Badge {
        string name;
        string imageURI;
        bool isSBT; // true = non-transferable, false = transferable NFT
        uint256 guildId;
        bytes32 conditionsHash;
    }
    
    uint256 private _tokenIdCounter;
    uint256 private _badgeTypeCounter;
    
    mapping(uint256 => Badge) public badges; // badgeTypeId => Badge
    mapping(uint256 => uint256) public tokenToBadgeType; // tokenId => badgeTypeId
    mapping(uint256 => string) private _tokenURIs;
    
    event BadgeTypeCreated(uint256 indexed badgeTypeId, string name, uint256 guildId, bool isSBT);
    event BadgeMinted(address indexed to, uint256 indexed tokenId, uint256 indexed badgeTypeId);
    
    constructor() ERC721("ArcGuilds Badge", "ARCBADGE") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    /**
     * @notice Create a new badge type
     * @param name Badge name
     * @param imageURI IPFS or HTTP URI for badge image
     * @param isSBT True for non-transferable, false for NFT
     * @param guildId Guild ID this badge belongs to
     * @param conditionsHash Hash of mint conditions
     */
    function createBadgeType(
        string calldata name,
        string calldata imageURI,
        bool isSBT,
        uint256 guildId,
        bytes32 conditionsHash
    ) external onlyRole(ADMIN_ROLE) returns (uint256) {
        _badgeTypeCounter++;
        uint256 badgeTypeId = _badgeTypeCounter;
        
        badges[badgeTypeId] = Badge({
            name: name,
            imageURI: imageURI,
            isSBT: isSBT,
            guildId: guildId,
            conditionsHash: conditionsHash
        });
        
        emit BadgeTypeCreated(badgeTypeId, name, guildId, isSBT);
        
        return badgeTypeId;
    }
    
    /**
     * @notice Mint a badge to a user
     * @param to Recipient address
     * @param badgeTypeId Badge type to mint
     * @param tokenURI Token URI for this specific badge instance
     */
    function mintBadge(
        address to,
        uint256 badgeTypeId,
        string calldata tokenURI
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        require(bytes(badges[badgeTypeId].name).length > 0, "Badge type does not exist");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = tokenURI;
        tokenToBadgeType[tokenId] = badgeTypeId;
        
        emit BadgeMinted(to, tokenId, badgeTypeId);
        
        return tokenId;
    }
    
    /**
     * @notice Get token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }
    
    /**
     * @notice Get badge type for a token
     */
    function getBadgeType(uint256 tokenId) external view returns (Badge memory) {
        _requireOwned(tokenId);
        uint256 badgeTypeId = tokenToBadgeType[tokenId];
        return badges[badgeTypeId];
    }
    
    /**
     * @notice Override transfer to respect SBT flag
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0))
        if (from == address(0)) {
            return super._update(to, tokenId, auth);
        }
        
        // Check if this is an SBT
        uint256 badgeTypeId = tokenToBadgeType[tokenId];
        if (badges[badgeTypeId].isSBT && to != address(0)) {
            revert("BadgeFactory: SBT is non-transferable");
        }
        
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @notice Grant minter role
     */
    function grantMinterRole(address minter) external onlyRole(ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
    }
    
    /**
     * @notice Check interface support
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
