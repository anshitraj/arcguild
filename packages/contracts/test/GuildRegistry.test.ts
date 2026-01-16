import { expect } from "chai";
import { ethers } from "hardhat";
import { GuildRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("GuildRegistry", function () {
  let guildRegistry: GuildRegistry;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const GuildRegistry = await ethers.getContractFactory("GuildRegistry");
    guildRegistry = await GuildRegistry.deploy();
    await guildRegistry.waitForDeployment();
  });

  describe("Guild Creation", function () {
    it("Should create a guild successfully", async function () {
      const tx = await guildRegistry.connect(user1).createGuild("test-guild", "ipfs://metadata");
      const receipt = await tx.wait();
      
      expect(receipt).to.not.be.null;
      
      const guild = await guildRegistry.guilds(1);
      expect(guild.handle).to.equal("test-guild");
      expect(guild.creator).to.equal(user1.address);
      expect(guild.active).to.be.true;
    });

    it("Should not allow duplicate handles", async function () {
      await guildRegistry.connect(user1).createGuild("test-guild", "ipfs://metadata");
      
      await expect(
        guildRegistry.connect(user2).createGuild("test-guild", "ipfs://metadata2")
      ).to.be.revertedWith("Handle already taken");
    });

    it("Should make creator a leader", async function () {
      await guildRegistry.connect(user1).createGuild("test-guild", "ipfs://metadata");
      
      const member = await guildRegistry.guildMembers(1, user1.address);
      expect(member.role).to.equal(2); // LEADER
    });
  });

  describe("Guild Membership", function () {
    let inviteCode: string;

    beforeEach(async function () {
      await guildRegistry.connect(user1).createGuild("test-guild", "ipfs://metadata");
      inviteCode = await guildRegistry.guildInviteCodes(1);
    });

    it("Should allow joining with valid invite code", async function () {
      await guildRegistry.connect(user2).joinGuild(1, inviteCode);
      
      const member = await guildRegistry.guildMembers(1, user2.address);
      expect(member.memberAddress).to.equal(user2.address);
      expect(member.role).to.equal(0); // MEMBER
    });

    it("Should not allow joining with invalid invite code", async function () {
      const invalidCode = ethers.keccak256(ethers.toUtf8Bytes("invalid"));
      
      await expect(
        guildRegistry.connect(user2).joinGuild(1, invalidCode)
      ).to.be.revertedWith("Invalid invite code");
    });

    it("Should allow leaving guild", async function () {
      await guildRegistry.connect(user2).joinGuild(1, inviteCode);
      await guildRegistry.connect(user2).leaveGuild(1);
      
      const member = await guildRegistry.guildMembers(1, user2.address);
      expect(member.memberAddress).to.equal(ethers.ZeroAddress);
    });

    it("Should not allow leader to leave", async function () {
      await expect(
        guildRegistry.connect(user1).leaveGuild(1)
      ).to.be.revertedWith("Leaders cannot leave");
    });
  });

  describe("Role Management", function () {
    let inviteCode: string;

    beforeEach(async function () {
      await guildRegistry.connect(user1).createGuild("test-guild", "ipfs://metadata");
      inviteCode = await guildRegistry.guildInviteCodes(1);
      await guildRegistry.connect(user2).joinGuild(1, inviteCode);
    });

    it("Should allow leader to change member role", async function () {
      await guildRegistry.connect(user1).setMemberRole(1, user2.address, 1); // OFFICER
      
      const member = await guildRegistry.guildMembers(1, user2.address);
      expect(member.role).to.equal(1);
    });

    it("Should not allow non-leader to change roles", async function () {
      await expect(
        guildRegistry.connect(user2).setMemberRole(1, user2.address, 1)
      ).to.be.revertedWith("Only leader can change roles");
    });
  });

  describe("Invite Code Rotation", function () {
    beforeEach(async function () {
      await guildRegistry.connect(user1).createGuild("test-guild", "ipfs://metadata");
    });

    it("Should allow leader to rotate invite code", async function () {
      const oldCode = await guildRegistry.guildInviteCodes(1);
      await guildRegistry.connect(user1).rotateInviteCode(1);
      const newCode = await guildRegistry.guildInviteCodes(1);
      
      expect(newCode).to.not.equal(oldCode);
    });

    it("Should not allow non-leader to rotate invite code", async function () {
      await expect(
        guildRegistry.connect(user2).rotateInviteCode(1)
      ).to.be.revertedWith("Only leader can rotate invite");
    });
  });
});
