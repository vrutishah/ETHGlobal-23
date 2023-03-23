// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Visa is ERC721URIStorage, Ownable {
    // Type declarations
    string public country = "Cryponya";
    string public visaName = "Visitor Visa";

    using Counters for Counters.Counter;

    struct VisaData {
        address holder;
        uint fromDate;
        uint expireDate;
        bool isApproved;
    }

    // NFT variables

    Counters.Counter private passportNumber;

    mapping(uint => VisaData) public validity;

    /* Events */
    event VisaMinted(
        address holder,
        uint tokenId,
        uint fromDate,
        uint endDate,
        string tokenURI
    );
    event VisaCancelled(
        address holder,
        uint tokenId,
        uint fromDate,
        uint endDate
    );

    /* Functions */
    constructor() ERC721("Visa", "VSA") {}

    function safeMint(
        address to,
        uint timeToStartDate,
        uint duration,
        string memory tokenUri
    ) public onlyOwner {
        passportNumber.increment();
        uint256 tokenId = passportNumber.current();
        _safeMint(to, tokenId);
        uint fromDate = (block.timestamp + timeToStartDate);
        uint endDate = (fromDate + duration);
        validity[tokenId] = VisaData(to, fromDate, endDate, true);
        _setTokenURI(tokenId, tokenUri);
        emit VisaMinted(to, tokenId, fromDate, endDate, tokenUri);
    }

    function cancelVisa(uint tokenId) external onlyOwner {
        validity[tokenId].isApproved = false;
        emit VisaCancelled(
            validity[tokenId].holder,
            tokenId,
            validity[tokenId].fromDate,
            validity[tokenId].expireDate
        );
    }

    function isValid(uint tokenId) public view returns (bool) {
        if (
            validity[tokenId].fromDate <= block.timestamp &&
            validity[tokenId].expireDate >= block.timestamp &&
            validity[tokenId].isApproved
        ) {
            return true;
        }
        return false;
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
}
