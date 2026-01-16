// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BadgeSBT
 * @notice Non-transferable Soul Bound Token for guild achievements
 */
contract BadgeSBT is ERC721, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    uint256 private _tokenIdCounter;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => uint8) private _badgeTypes; // 0=PARTICIPANT, 1=TOP_GUILD, 2=TOP_CONTRIBUTOR, 3=STREAK_MASTER
    
    event BadgeMinted(address indexed to, uint256 indexed tokenId, uint8 badgeType, string tokenURI);
    
    constructor() ERC721("ArcGuilds Badge", "ARCBADGE") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    /**
     * @notice Mint a badge to a user
     * @param to Recipient address
     * @param badgeType Type of badge (0-3)
     * @param uri Token URI for metadata
     */
    function mintBadge(address to, uint8 badgeType, string calldata uri) 
        external 
        onlyRole(MINTER_ROLE) 
        nonReentrant 
        returns (uint256) 
    {
        require(badgeType <= 3, "Invalid badge type");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = uri;
        _badgeTypes[tokenId] = badgeType;
        
        emit BadgeMinted(to, tokenId, badgeType, uri);
        
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
     * @notice Get badge type
     */
    function getBadgeType(uint256 tokenId) external view returns (uint8) {
        _requireOwned(tokenId);
        return _badgeTypes[tokenId];
    }
    
    /**
     * @notice Override transfer to make non-transferable
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) but block transfers
        if (from != address(0) && to != address(0)) {
            revert("BadgeSBT: token is non-transferable");
        }
        
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @notice Grant minter role to backend service
     */
    function grantMinterRole(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
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
