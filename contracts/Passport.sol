// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Passport is ERC721URIStorage, Ownable {
    // Type declarations
    using Counters for Counters.Counter;

    Counters.Counter private passportNumber;

    /* Events */
    event PassportMinted(address holder, uint tokenId);

    /* Functions */
    constructor() ERC721("Passport", "PSP") {}

    function safeMint(address to, string memory tokenUri) public onlyOwner {
        passportNumber.increment();
        uint256 tokenId = passportNumber.current();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);
        emit PassportMinted(to, tokenId);
    }

    function burn(uint256 tokenId) external {
        require(
            msg.sender == ownerOf(tokenId),
            "Only the holder can burn the passport"
        );
        _burn(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal pure override {
        require(
            from == address(0) || to == address(0),
            "This is your passport. It can't be transferred. It can only be burned by the owner."
        );
    }

    function _burn(uint256 tokenId) internal override(ERC721URIStorage) {
        super._burn(tokenId);
    }
}
