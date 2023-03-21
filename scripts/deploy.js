const { ethers } = require("hardhat");

const main = async () => {
  const Passport = await ethers.getContractFactory("Passport");
  const passport = await Passport.deploy();
  await passport.deployed();

  console.log("Passport deployed at: ", passport.address);

  const Visa = await ethers.getContractFactory("Visa");
  const visa = await Visa.deploy();
  await visa.deployed();

  console.log("Visa deployed at :", visa.address);
};

//Passport deployed at:  0x8BB632706b987CdEa29d7843686117f3784F4054
//Visa deployed at : 0x94eD87A30531E523A44153Dd43169C35FfB90c1A

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
