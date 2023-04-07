// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

/**
 * @title NewToken.sol
 *
 * @author Xavier BARADA / github: https://github.com/XaViPanDx
 *
 * @notice NewTokencontract allows the owner to mint new NFTs and burn existing ones by approval.
 * (case of remove a member from DAO). 
 * Transfers and approval functions are disabled.
 * The contract owner can also retrieve the ID of an NFT owned by a specific address.
 */
contract NewToken is Ownable, ERC721, ERC721Burnable {
    
    /*
     * @dev Token ID counter.
     */
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    
    /*
     * @dev Name and symbol of the token.
     */
    string private _tokenName;
    string private _tokenSymbol;
    
    /*
     * @dev Struct to store NFT owner's address and ID in a private mapping.
     */
    struct NftOwner {
        address newOwner;
        uint256 nftId;
    }

    mapping(address => NftOwner) private _nftOwner;

    /*
     * @dev NewToken events which allows to retrieve important information about DAO
     * on the Dapp (NFT minted by member address and tokenId, approvals by tokenOwner
     * to DAO admin to permit the burn of specific token by member address and tokenID). 
     */
    event NftMinted(address newOwner, uint nftId);
    event MemberApproval(address indexed nftOwner, address indexed approved, uint256 indexed tokenId);
    event NftBurned(address tokenOwner, uint256 nftId);

    /**
     * @dev Constructor that sets the owner, token name, and token symbol.
     * @param _owner The address of the contract owner.
     * @param _name The name of the token.
     * @param _symbol The symbol of the token.
     */
    constructor(address _owner, string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        transferOwnership(_owner);
        _tokenName = _name;
        _tokenSymbol = _symbol;
    }

    /**
     * @dev Mints a new NFT and assigns ownership to the given address.
     * @param _to The address that will receive the newly minted NFT.
     * @return The ID of the newly minted NFT.
     */
    function safeMint(address _to) external onlyOwner returns (uint) {
        _tokenIds.increment();
        uint newTokenId = _tokenIds.current();
        _safeMint(_to, newTokenId);
        _nftOwner[_to].newOwner = _to;
        _nftOwner[_to].nftId = newTokenId;
        emit NftMinted(_to, newTokenId);
        return newTokenId;
    }  

    /**
     * @dev Approves a transfer of the NFT from the owner's address to the given address.
     * @param to The address to which the NFT is being transferred.
     * @param tokenId The ID of the NFT.
     */
    function approveByMember(address to, uint256 tokenId) external {
        require(balanceOf(msg.sender) > 0, "You don't have token to burn");
        require(ownerOf(tokenId) == msg.sender, "Caller is not the owner of the token");
        approve(to, tokenId);
        emit MemberApproval(msg.sender, to, tokenId);
    }

    /**
     * @dev Burns the NFT with the given ID.
     * @param tokenId The ID of the NFT to burn.
     */
    function burn(uint256 tokenId) public override onlyOwner {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");
        address tokenOwner = ownerOf(tokenId); 
        _burn(tokenId);
        emit NftBurned(tokenOwner, tokenId); 
    }

    /**
     * @dev Returns the ID of the NFT owned by a given address.
     * @param _address The address of the NFT owner.
     * @return The ID of the NFT owned by the given address.
     */   
    function getNftIdByOwner(address _address) external view onlyOwner returns (uint) { // POUR BRULER BON NFT FCTION ADDRESS
        return _nftOwner[_address].nftId;
    }

    /**
     * @dev Returns the name of the token.
     * @return A string representing the name of the token.
     */
    function name() public view override onlyOwner returns (string memory) {
        return _tokenName;
    }

    /**
     * @dev Returns the symbol of the token.
     * @return A string representing the symbol of the token.
     */
    function symbol() public view override onlyOwner returns (string memory) {
        return _tokenSymbol;
    }
    
    /**
     * @dev Disables the transfer functions in this contract.
     * Overrides the transfer functions in ERC721 to revert when called.
     */
    function transferFrom(address , address , uint256) public pure override {
        revert("Transfers are not allowed in this contract.");
    }
        
   function safeTransferFrom(address, address, uint256) public pure override {
        revert("Transfers are not allowed in this contract.");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("Transfers are not allowed in this contract.");
    }

    function _safeTransfer(address, address, uint256, bytes memory) internal pure override {
        revert("Transfers are not allowed in this contract.");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("Transfers are not allowed in this contract.");
    }    
}