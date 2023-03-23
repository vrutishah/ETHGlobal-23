const { ethers } = require("hardhat");
const {
  storeTokenUriMetadata,
  storeImages,
} = require("../utils/uploadToPinata");

const visaDuration = "60*60*24*21";
const imageLocation = "./imageVisa";

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      visaType: "Tourist Visa",
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
    "Visa",
    "0xB02BDfA084513956DAAdeC50820242EEdA6B917d"
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
    tokenUriMetadata.description = `Cryptonia Visa of ${tokenUriMetadata.name}!`;
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
