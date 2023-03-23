const { ethers } = require("hardhat");
const {
  storeTokenUriMetadata,
  storeImages,
} = require("../utils/uploadToPinata");

const imageLocation = "./image";

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      passportType: "Onchain Passport",
      birhdate: "18.01.1977",
      nationality: "Chinese",
      Authority: "Hongkong",
      gender: "male",
      surname: "Smith",
    },
  ],
};

const main = async () => {
  if (process.env.UPLOAD_TO_PINATA == "true") {
    tokenUris = await handleTokenUris();
    tokenUri = tokenUris[0];
  }
  const user = "0x7e6e41BA05FdBE4e1617cfB521154550537255df";
  const contract = await ethers.getContractAt(
    "Passport",
    "0x5df89f7727e663842b5f4582776BAfb62686955c"
  );
  await contract.safeMint(user, tokenUri);
  console.log("Nft got minted");
};

const handleTokenUris = async () => {
  tokenUri = [];

  const { responses: imageUploadResponses, files } = await storeImages(
    imageLocation
  );
  //console.log(imageUploadResponses);
  for (imageUploadResponseIndex in imageUploadResponses) {
    let tokenUriMetadata = { ...metadataTemplate };
    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");
    tokenUriMetadata.description = `Passport of ${tokenUriMetadata.name}!`;
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
    console.log(`Uploading ${tokenUriMetadata.name}...`);
    const metadataUploadResponse = await storeTokenUriMetadata(
      tokenUriMetadata
    );
    tokenUri.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
  }
  console.log("Token URIs Uploaded! They are:");
  console.log(tokenUri);
  return tokenUri;
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
