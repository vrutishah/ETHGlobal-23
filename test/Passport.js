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
    it("Emits an event if a Nft get minted", async () => {
      const [owner, user1] = await ethers.getSigners();
      await expect(passport.safeMint(user1.address)).to.emit(
        passport,
        "PassportMinted"
      );
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

describe("Visa", function () {
  let Visa, visa;
  beforeEach(async () => {
    Visa = await ethers.getContractFactory("Visa");
    visa = await Visa.deploy();
    visa.deployed();
  });
  describe("Mint", () => {
    it("Mints the visa for user", async () => {
      const visaDuration = 60 * 60 * 24 * 30;
      const [owner, user1] = await ethers.getSigners();
      await visa.safeMint(user1.address, 1, visaDuration);
      const address = await visa.ownerOf(1);
      await expect(address).to.equal(user1.address);
    });
  });
  describe("Validity", () => {
    it("Visa is unvalid if the time is before or after the visa date", async () => {
      const visaDuration = 60 * 60 * 24 * 30;
      const [owner, user1] = await ethers.getSigners();
      await visa.safeMint(user1.address, 60 * 60 * 24 * 7, visaDuration);
      let validity = await visa.isValid(1);
      await expect(validity).to.equal(false);
      await network.provider.send("evm_mine");
      await network.provider.send("evm_increaseTime", [
        visaDuration + 60 * 60 * 24 * 7 + 1,
      ]);
      await network.provider.send("evm_mine");
      validity = await visa.isValid(1);
      await expect(validity).to.equal(false);
    });
    it("Visa is valid during the period", async () => {
      const visaDuration = 60 * 60 * 24 * 30;
      const [owner, user1] = await ethers.getSigners();
      await visa.safeMint(user1.address, 60 * 60 * 24 * 7, visaDuration);
      await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 7 + 1]);
      await network.provider.send("evm_mine");
      let validity = await visa.isValid(1);
      await expect(validity).to.equal(true);
    });
  });
  describe("Cancel", () => {
    it("Visa will be unvalid if the visa got canceled", async () => {
      const visaDuration = 60 * 60 * 24 * 30;
      const [owner, user1] = await ethers.getSigners();
      await visa.safeMint(user1.address, 60 * 60 * 24 * 7, visaDuration);
      await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 7 + 1]);
      await network.provider.send("evm_mine");
      await visa.cancelVisa(1);
      let validity = await visa.isValid(1);
      await expect(validity).to.equal(false);
    });
    it("Will revert if someone but the owner tries to cancel", async () => {
      const visaDuration = 60 * 60 * 24 * 30;
      const [owner, user1] = await ethers.getSigners();
      await visa.safeMint(user1.address, 60 * 60 * 24 * 7, visaDuration);
      await expect(visa.connect(user1).cancelVisa(1)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });
});
