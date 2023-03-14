const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("Passport", function () {
  let Passport, passport;
  beforeEach(async () => {
    Passport = await ethers.getContractFactory("Passport");
    passport = await Passport.deploy();
    await passport.deployed();
  });
  describe("Mint", () => {
    it("Lets the owner mint a passport for a user", async () => {
      const [owner, user1] = await ethers.getSigners();
      await passport.safeMint(user1.address);
      const address = await passport.ownerOf(1);
      await expect(address).to.equal(user1.address);
    });
  });
  describe("Burn", () => {
    it("Lets the holder burn the token", async () => {
      const [owner, user1] = await ethers.getSigners();
      await passport.safeMint(user1.address);
      await passport.connect(user1).burn(1);
      await expect(passport.ownerOf(1)).to.be.revertedWith(
        "ERC721: invalid token ID"
      );
    });
  });
  describe("Transfer", () => {
    it("Will revert if the user tries to transfer the token", async () => {
      const [owner, user1] = await ethers.getSigners();
      await passport.safeMint(user1.address);
      await expect(
        passport.connect(user1).transferFrom(user1.address, owner.address, 1)
      ).to.be.revertedWith(
        "This is your passport. It can't be transferred. It can only be burned by the owner."
      );
    });
  });
});
