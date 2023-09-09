// SPDX-License-Identifier: MIT

pragma solidity 0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title ERC721 item creation contract.
contract Token721 is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    /// A counter for tracking token ids.
    Counters.Counter private tokenIds;

    /// @notice Creates a new ERC-721 item collection.
    /// @param name   Name of the collection.
    /// @param symbol Symbol of the collection.
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    /// @notice Safely mints `tokenId` and transfers it to `to`.
    /// @param to       The address to mint to.
    /// @param tokenURI The URI of the token.
    function safeMint(
        address to,
        string memory tokenURI
    ) external onlyOwner returns (uint256) {
        tokenIds.increment();

        uint256 newItemId = tokenIds.current();
        _safeMint(to, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}
