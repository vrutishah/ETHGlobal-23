const { ethers } = require("hardhat");

const main = async () => {
  /*   const Passport = await ethers.getContractFactory("Passport");
  const passport = await Passport.deploy();
  await passport.deployed();

  console.log("Passport deployed at: ", passport.address); */

  const Visa = await ethers.getContractFactory("Visa");
  const visa = await Visa.deploy();
  await visa.deployed();

  console.log("Visa deployed at :", visa.address);
};

//Passport deployed at:  0x5df89f7727e663842b5f4582776BAfb62686955c
//Visa deployed at : 0xB02BDfA084513956DAAdeC50820242EEdA6B917d

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
