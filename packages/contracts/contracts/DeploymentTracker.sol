// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DeploymentTracker
 * @notice Tracks contract deployments for the Deployment Arena
 */
contract DeploymentTracker is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    enum ContractTemplate {
        ERC20,
        ERC721,
        ERC1155,
        MULTISIG,
        TIMELOCK,
        GOVERNOR,
        CUSTOM
    }
    
    struct Deployment {
        address deployer;
        address contractAddress;
        ContractTemplate template;
        uint256 timestamp;
        bool verified;
    }
    
    mapping(address => Deployment[]) public userDeployments;
    mapping(address => bool) public verifiedContracts;
    
    uint256 public totalDeployments;
    
    event ContractDeployed(
        address indexed deployer,
        address indexed contractAddress,
        ContractTemplate template,
        uint256 timestamp
    );
    
    event ContractVerified(address indexed contractAddress);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @notice Register a contract deployment
     * @param contractAddress Deployed contract address
     * @param template Contract template used
     */
    function registerDeployment(
        address contractAddress,
        ContractTemplate template
    ) external {
        require(contractAddress != address(0), "Invalid contract address");
        require(contractAddress.code.length > 0, "No code at address");
        
        Deployment memory deployment = Deployment({
            deployer: msg.sender,
            contractAddress: contractAddress,
            template: template,
            timestamp: block.timestamp,
            verified: false
        });
        
        userDeployments[msg.sender].push(deployment);
        totalDeployments++;
        
        emit ContractDeployed(msg.sender, contractAddress, template, block.timestamp);
    }
    
    /**
     * @notice Verify a contract deployment (admin only)
     * @param contractAddress Contract to verify
     */
    function verifyContract(address contractAddress) external onlyRole(ADMIN_ROLE) {
        verifiedContracts[contractAddress] = true;
        emit ContractVerified(contractAddress);
    }
    
    /**
     * @notice Get user's deployment count
     */
    function getUserDeploymentCount(address user) external view returns (uint256) {
        return userDeployments[user].length;
    }
    
    /**
     * @notice Get user's deployments
     */
    function getUserDeployments(address user) external view returns (Deployment[] memory) {
        return userDeployments[user];
    }
    
    /**
     * @notice Check if contract is verified
     */
    function isVerified(address contractAddress) external view returns (bool) {
        return verifiedContracts[contractAddress];
    }
}
