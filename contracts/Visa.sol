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
        uint fromDate;
        uint endDate;
        bool isApproved;
    }

    // NFT variables

    Counters.Counter private passportNumber;

    mapping(uint => VisaData) public validity;

    /* Events */
    event VisaMinted(address holder, uint tokenId, uint fromDate, uint endDate);

    /* Functions */
    constructor() ERC721("Visa", "VSA") {}

    function safeMint(
        address to,
        uint timeToStartDate,
        uint duration
    ) public onlyOwner {
        passportNumber.increment();
        uint256 tokenId = passportNumber.current();
        _safeMint(to, tokenId);
        uint fromDate = (block.timestamp + timeToStartDate);
        uint endDate = (fromDate + duration);
        validity[tokenId] = VisaData(fromDate, endDate, true);
        emit VisaMinted(to, tokenId, fromDate, endDate);
    }

    function cancelVisa(uint tokenId) external onlyOwner {
        validity[tokenId].isApproved = false;
    }

    function isValid(uint tokenId) public view returns (bool) {
        if (
            validity[tokenId].fromDate <= block.timestamp &&
            validity[tokenId].endDate >= block.timestamp &&
            validity[tokenId].isApproved
        ) {
            return true;
        }
        return false;
    }
}
