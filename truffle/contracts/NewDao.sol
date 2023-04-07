// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./NewToken.sol";
import "./NewVoting.sol";

/**
 * @title NewDao.sol
 *
 * @author Xavier BARADA / github: https://github.com/XaViPanDx
 *
 * @notice NewDao.sol smart contract allow DAO admin chosen by the SCIC to configure
 * DAO with parameters (members datas and count up to date).
 * Also, on condition that DAO at least count 3 members, admin will be able to deploy
 * two new Smart Contract to manage DAO governance (NewToken.sol and NewVoting.sol).
 * Proposals for voting will be chosen by the community via a snapshot system.
 */
contract NewDao is Ownable {

    /**
     * @dev Number of members currently in the DAO.
     */
    uint128 private _memberCount;

    /**
     * @dev Count of proposals snapshots taken so far.
     */
    uint128 private _proposalCount; 
    
    /**
     * @dev The name of the DAO.
     */ 
    string private _daoName; 

    /**
     * @dev Struct to store information about each member.
     */
    struct Member {
        address memberAddress;
        uint256 memberIndex;
        bool isMember;
        string memberName;
    }

    /**
     * @dev A mapping to store information about each member of the DAO.
     */
    mapping(address => Member) private _member;

    /**
     * @dev An array to store all members of the DAO.
     */
    Member[] private _members;

    /**
     * @dev A struct to store information about a proposal.
     * 
     * @param id The ID of the proposal.
     * @param result The result of the proposal.
     * @param startDate The start date of the proposal.
     * @param endDate The end date of the proposal.
     */
    struct Proposal {
        uint256 id;
        string result;
        string startDate;
        string endDate;
    }

    /**
     * @dev A mapping to store information about each proposal.
     */
    mapping(uint256 => Proposal) private _proposals;

    /**
     * @dev Struct to store the token and voting contract addresses for a DAO admin.
     */
    struct TokenAndVotingContracts {  
        address token;
        address[] votingContracts;
    }

    /**
     * @dev A mapping to store the token and voting contract addresses for each DAO admin.
     */
    mapping(address => TokenAndVotingContracts) private _tokenAndVotingContracts;

    /**
     * @dev Struct to store information about a contribution made by a member.
     */
    struct Contribution {
        address memberAddress;
        uint256 amount;
        uint256 timestamp;
    }

    /**
     * @dev A mapping to store contributions made by members.
     */
    mapping(address => Contribution[]) private _contributions;

    /**
     * @dev A mapping to store information about each newToken contract created.
     */
    mapping(address => address[]) private _userTokenContracts;

    /**
     * @dev A mapping to store information about each newVoting contract created.
     */
    mapping(address => address[]) private _userVotingContracts;
 
    /**
     * @dev NewDao events which allows to retrieve important information about DAO
     * on the Dapp (members added end removed, new token and voting Smart Contracts, 
     * snapshot community result, contributions and payment received).
     */
    event MemberAdded(address memberAddress, uint memberIndex, bool isMember, string memberName, uint memberCount);
    event MemberRemoved(address memberAddress, bool isMember, uint memberCount);
    event TokenCreated(address tokenAddress, address creator);
    event SnapshotResult(uint256 id, string result, string startDate, string endDate);
    event VotingCreated(address indexed votingContract, address indexed creator, uint256 indexed contractIndex);
    event ContributionReceived(address indexed memberAddress, uint256 amount, uint256 timestamp);
    event PaymentReceived(address from, uint256 amount);
    event ThankYou(address from, uint256 amount, string message);
    
    /**
     * @dev NewDao constructor whitch allow to retrieve DAO's choesed name and
     * wallet address of the DAO creator (msg.sender of the createDao() function)
     * to be able to transfert Ownership to the DAO admin.
     */
    constructor(address _owner, string memory _name) {
        transferOwnership(_owner);
        _daoName = _name;
    }
 
    /**
     * @dev addMember() function allows the owner to add a new member by their address and name.
     * The function checks if the member is not already in the list, and then adds the new member
     * to the members array, updates the member count, and emits a MemberAdded event.
     *
     * @param member_ and _name Member address and member name.
     */
    function addMember(address member_, string calldata _name) external onlyOwner {
        require(!_member[member_].isMember, "Member already exists");
        _member[member_].memberAddress = member_;
        _member[member_].memberIndex = _members.length;
        _member[member_].isMember = true;
        _member[member_].memberName = _name;
        _members.push(_member[member_]);
        _memberCount++;
        emit MemberAdded(member_, _members.length, _member[member_].isMember, _name, _memberCount);
    }

    /**
     * @dev removeMember() function allows the owner to remove a member by their address.
     * The function will replace the member to be removed with the last member in the members array,
     * update the last member's index, and then decrease the member count.
     *
     * @param member_ Member address to remove.
     */
    function removeMember(address member_) external onlyOwner {
        require(_member[member_].isMember, "Member does not exist");
        uint256 indexToRemove = _member[member_].memberIndex;
        Member storage lastMember = _members[_memberCount - 1];
        _members[indexToRemove] = lastMember;
        _member[lastMember.memberAddress].memberIndex = indexToRemove;
        _members.pop();
        delete _member[member_];
        _member[member_].isMember = false;
        _memberCount--;
        emit MemberRemoved(member_, false, _memberCount);
    }

    /**
     * @dev This function is called by the DAO admin to announce the results of a snapshot and to create a new proposal for voting.
    * The function takes as input a string containing the result of the snapshot and the start and end dates of the voting period.
    * The function increments the proposal ID and creates a new proposal with the given parameters.
    * 
    * @param _result The result of the snapshot.
    * @param _startDate The start date of the voting period.
    * @param _endDate The end date of the voting period.
    */
    function snapshotResult(string memory _result, string memory _startDate, string memory _endDate) external onlyOwner returns(string memory) {
        uint256 proposalId = _proposalCount;
        _proposalCount++;
        Proposal storage proposal = _proposals[proposalId];
        proposal.id = proposalId;
        proposal.result = _result;
        proposal.startDate = _startDate;
        proposal.endDate = _endDate; 
        emit SnapshotResult(proposal.id, proposal.result, proposal.startDate, proposal.endDate);
        return _result;
    }

    /**
     * @dev Returns whether an address is a member of the DAO.
     * @param member_ Address of the member to check.
     * @return A boolean indicating whether the address is a member.
     */
    function isMember(address member_) external view onlyOwner returns (bool) {
        return _member[member_].isMember;
    }

    /**
     * @dev Returns the DAO member at a given index.
     * @param index Index of the member to retrieve.
     * @return A Member struct containing the member's data.
     */
    function getMemberByIndex(uint64 index) external view onlyOwner returns (Member memory) {
        require(index < _memberCount, "Index out of bounds");
        return _members[index];
    }

    /**
     * @dev Returns the total number of DAO members.
     * @return An integer representing the number of members.
     */
    function getMemberCount() external view onlyOwner returns (uint) {
        return _memberCount;
    }

    /**
     * @dev Returns the name of the DAO.
     * @return A string representing the DAO name.
     */
    function getDaoName() external view onlyOwner returns (string memory) {
        return _daoName;
    }

    /**
     * @dev CreateToken() function and its getter() are onlyOwner.
     * This function allows the DAO admin to create a token Smart Contract that can mint and distribute
     * tokens to members. These tokens will allow members to participate in DAO's voting sessions.
     *
     * @notice SCIC must have at least 3 registered members to be able to create a DAO token.
     */
    function createToken(string memory _name, string memory _symbol) external onlyOwner {
        require(address(_tokenAndVotingContracts[msg.sender].token) == address(0), "Token contract already created");
        require(_memberCount >= 3,"SCIC must at least have 3 members");
        NewToken newToken = new NewToken(owner(), _name, _symbol);
        _tokenAndVotingContracts[msg.sender].token = address(newToken);
        _userTokenContracts[msg.sender].push(address(newToken));
        emit TokenCreated(address(newToken), msg.sender);
    }
    
    /**
     * @dev This function allows the admin to retrieve a newToken Smart Contract address by index.
     */
    function getTokenContract(address _user) external view onlyOwner returns (address) {
        require(_userTokenContracts[_user].length > 0, "No token contract found for this user");
        return _userTokenContracts[_user][0];
    }

    /**
     * @dev createvoting() function and getters() are onlyOwner.
     * This first function will allow DAO admin to create voting Smarts Contracts
     * to organize a vote for any proposal selected by members
     * (proposal selected through a snapshot).
     * TokenAddress is send to the newVoting contract constructor to
     * verify that members are holding a DAO NFT to be able to access voting session.
     * 
     * @notice SCIC must have at least 3 registered members to be able to create a DAO voting contract.
     */
    function createVoting() external onlyOwner {
        TokenAndVotingContracts storage contracts = _tokenAndVotingContracts[msg.sender];
        require(contracts.token != address(0), "Token contract does not exist");
        require(_memberCount >= 3, "SCIC must have at least 3 members");
        address tokenAddress = contracts.token;
        NewVoting newVoting = new NewVoting(owner(), tokenAddress);
        contracts.votingContracts.push(address(newVoting));
        emit VotingCreated(address(newVoting), msg.sender, contracts.votingContracts.length);
    }

    /**
     * @dev This function allows the admin to retrieve a newVoting Smart Contract address by index.
     */
    function getVotingContractByIndex(uint256 index) external view onlyOwner returns (address) {
        TokenAndVotingContracts storage contracts = _tokenAndVotingContracts[msg.sender];
        require(index < contracts.votingContracts.length, "Index out of bounds");
        return contracts.votingContracts[index];
    }

    /**
     * @dev This function allows the admin to retrieve voting Smart Contract counts by user address.
     */
    function getVotingContractCount() external view onlyOwner returns (uint) {
        return _tokenAndVotingContracts[msg.sender].votingContracts.length;
    }

    /**
     * @dev makeContribution() allows DAO's members to send founds to the DappESSSCIC
     * Smart Contract to pay their contributions. 
     */
    function makeContribution() external payable {
        require(_member[msg.sender].isMember, "Sender must be a DAO member"); // TESTS?
        require(msg.value > 0, "Contribution amount must be greater than 0");
        Contribution memory newContribution;
        newContribution.memberAddress = msg.sender;
        newContribution.amount = msg.value;
        newContribution.timestamp = block.timestamp;
        _contributions[msg.sender].push(newContribution);
        emit ContributionReceived(msg.sender, msg.value, block.timestamp);
        emit ThankYou(msg.sender, msg.value, "Thank you for your payment");
    }

    /**
     * @dev fallback() and receive() functions to allow Smart Contract
     * to receive funds (donations)
     */
    fallback() external payable {
        emit PaymentReceived(msg.sender, msg.value);
        emit ThankYou(msg.sender, msg.value, "Thank you for your payment");
    }

    receive() external payable {
        emit PaymentReceived(msg.sender, msg.value);
        emit ThankYou(msg.sender, msg.value, "Thank you for your payment");
    }
}