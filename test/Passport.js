const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("Passport", function () {
  let Passport, passport, tokenUri;
  beforeEach(async () => {
    Passport = await ethers.getContractFactory("Passport");
    passport = await Passport.deploy();
    await passport.deployed();
    tokenUri = "";
  });
  describe("Mint", () => {
    it("Lets the owner mint a passport for a user", async () => {
      const [owner, user1] = await ethers.getSigners();
      await passport.safeMint(user1.address, tokenUri);
      const address = await passport.ownerOf(1);
      await expect(address).to.equal(user1.address);
    });
    it("Emits an event if a Nft get minted", async () => {
      const [owner, user1] = await ethers.getSigners();
      await expect(passport.safeMint(user1.address, tokenUri)).to.emit(
        passport,
        "PassportMinted"
      );
    });
    it("A person can't own more than one passport", async () => {
      const [owner, user1] = await ethers.getSigners();
      await passport.safeMint(user1.address, tokenUri);
      await passport.safeMint(user1.address, tokenUri);
      await expect(passport.ownerOf(1)).to.be.revertedWith(
        "ERC721: invalid token ID"
      );
      await passport.safeMint(user1.address, tokenUri);
      await passport.safeMint(user1.address, tokenUri);
      let number = await passport.balanceOf(user1.address);
      await expect(number.toString()).to.equal("1");
    });
    it("It is valid for 10 years from the minting", async () => {
      const [owner, user1] = await ethers.getSigners();
      await passport.safeMint(user1.address, tokenUri);
      let issueDate = await passport.getIssueDate(1);
      let expireDate = await passport.getExpireDate(1);
      let valid = await passport.isValid(1);
      await expect(valid).to.equal(true);
      await network.provider.send("evm_increaseTime", [
        60 * 60 * 24 * 365 * 10,
      ]);
      await network.provider.send("evm_mine");
      valid = await passport.isValid(1);
      await expect(valid).to.equal(true);
      await network.provider.send("evm_increaseTime", [1]);
      await network.provider.send("evm_mine");
      valid = await passport.isValid(1);
      await expect(valid).to.equal(false);
    });
  });
  describe("Burn", () => {
    it("Lets the holder burn the token", async () => {
      const [owner, user1] = await ethers.getSigners();
      await passport.safeMint(user1.address, tokenUri);
      await passport.connect(user1).burn(1);
      await expect(passport.ownerOf(1)).to.be.revertedWith(
        "ERC721: invalid token ID"
      );
    });
    it("Reverts if someone but the owner burns the token", async () => {
      const [owner, user1] = await ethers.getSigners();
      await passport.safeMint(user1.address, tokenUri);
      await expect(passport.burn(1)).to.be.revertedWith(
        "Only the holder can burn the passport"
      );
    });
  });
  describe("Transfer", () => {
    it("Will revert if the user tries to transfer the token", async () => {
      const [owner, user1] = await ethers.getSigners();
      await passport.safeMint(user1.address, tokenUri);
      await expect(
        passport.connect(user1).transferFrom(user1.address, owner.address, 1)
      ).to.be.revertedWith(
        "This is your passport. It can't be transferred. It can only be burned by the owner."
      );
    });
  });
});

describe("Visa", function () {
  let Visa, visa, tokenUri;
  beforeEach(async () => {
    Visa = await ethers.getContractFactory("Visa");
    visa = await Visa.deploy();
    visa.deployed();
    tokenUri = "";
  });
  describe("Mint", () => {
    it("Mints the visa for user", async () => {
      const visaDuration = 60 * 60 * 24 * 30;
      const [owner, user1] = await ethers.getSigners();
      await visa.safeMint(user1.address, 1, visaDuration, tokenUri);
      const address = await visa.ownerOf(1);
      await expect(address).to.equal(user1.address);
    });
    it("Emits an event when the visa is minted", async () => {
      const visaDuration = 60 * 60 * 24 * 30;
      const [owner, user1] = await ethers.getSigners();
      await expect(
        visa.safeMint(user1.address, 1, visaDuration, tokenUri)
      ).to.emit(visa, "VisaMinted");
    });
    it("Reverts if someone but the owner tries to mint a visa", async () => {
      const visaDuration = 60 * 60 * 24 * 30;
      const [owner, user1] = await ethers.getSigners();
      await expect(
        visa.connect(user1).safeMint(user1.address, 1, visaDuration, tokenUri)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
  describe("Validity", () => {
    it("Visa is unvalid if the time is before or after the visa date", async () => {
      const visaDuration = 60 * 60 * 24 * 30;
      const [owner, user1] = await ethers.getSigners();
      await visa.safeMint(
        user1.address,
        60 * 60 * 24 * 7,
        visaDuration,
        tokenUri
      );
      let validity = await visa.isValid(1);
      await expect(validity).to.equal(false);
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
      await visa.safeMint(
        user1.address,
        60 * 60 * 24 * 7,
        visaDuration,
        tokenUri
      );
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
      await visa.safeMint(
        user1.address,
        60 * 60 * 24 * 7,
        visaDuration,
        tokenUri
      );
      await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 7 + 1]);
      await network.provider.send("evm_mine");
      await visa.cancelVisa(1);
      let validity = await visa.isValid(1);
      await expect(validity).to.equal(false);
    });
    it("Will revert if someone but the owner tries to cancel", async () => {
      const visaDuration = 60 * 60 * 24 * 30;
      const [owner, user1] = await ethers.getSigners();
      await visa.safeMint(
        user1.address,
        60 * 60 * 24 * 7,
        visaDuration,
        tokenUri
      );
      await expect(visa.connect(user1).cancelVisa(1)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
    it("Emit an event is the visa is cancelled", async () => {
      const visaDuration = 60 * 60 * 24 * 30;
      const [owner, user1] = await ethers.getSigners();
      await visa.safeMint(
        user1.address,
        60 * 60 * 24 * 7,
        visaDuration,
        tokenUri
      );
      await expect(visa.cancelVisa(1)).to.emit(visa, "VisaCancelled");
    });
  });
  describe("Transfer", () => {
    it("Will revert if the user tries to transfer the token", async () => {
      const visaDuration = 60 * 60 * 24 * 30;
      const [owner, user1] = await ethers.getSigners();
      await visa.safeMint(
        user1.address,
        60 * 60 * 24 * 7,
        visaDuration,
        tokenUri
      );
      await expect(
        visa.connect(user1).transferFrom(user1.address, owner.address, 1)
      ).to.be.revertedWith(
        "This is your passport. It can't be transferred. It can only be burned by the owner."
      );
    });
  });
});
