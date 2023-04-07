// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./NewToken.sol";

/**
 * @title NewVoting.sol
 *
 * @author Xavier BARADA / github: https://github.com/XaViPanDx
 *
 * @notice NewVoting contract allows DAO members to vote on a predetermined proposal.
 * The contract verifies if the minimum participation and quorum rules are met before
 * returning the result. Also, only voters which hold the DAO toekn can participate
 * to the vote session.
 *
 * For more transparency in this DAO, all data is public. 
 */
contract NewVoting is Ownable {

    /*
     * @dev Voting public storage:
     * 
     * -> Total number of voters.
     * -> The number of members in the DAO.
     * -> The percentage of members required to reach a quorum.
     * -> The minimum percentage of members required to participate in the vote.
     * -> The predetermined proposal to vote on.
     * -> The result of the vote.
     * -> The address of the NFT contract.
     * -> Admin check results before voters can do it.
     */
    uint32 public totalVoters;
    uint32 public members;
    uint32 public quorum;
    uint32 public minParticipation;
    string public predeterminedProposal;
    bool private proposalResult;
    address private _nftContractAddress;
    bool private resultChecked;

    
    /**
     * @dev The struct representing a voter, indicating whether they have 
     * voted and how they voted.
     */
    struct Voter {
        bool hasVoted;
        bool vote;
    }

    /**
     * @dev The public mapping of voters and their votes.
     */
    mapping(address => Voter) public voters;

    /**
     * @dev The struct representing the vote count, indicating the number 
     * of votes for and against the proposal.
     */
    struct VoteCount {
        uint32 yes;
        uint32 no;
    }

    /**
     * @dev The vote count of the predetermined proposal.
     */
    VoteCount public voteCount;

    /**
     * @dev The possible statuses of the voting process.
     * ProposalSet: The proposal has been set.
     * VotingSessionStarted: The voting session has started.
     * VotingSessionEnded: The voting session has ended.
     */
    enum WorkflowStatus {
        ProposalSet,
        VotingSessionStarted,
        VotingSessionEnded     
    }

    /**
     * @dev The current status of the voting process.
     */
    WorkflowStatus public workflowStatus;

    /**
     * @dev Event emitted when a voter casts their vote.
     * @param _voter The address of the voter.
     * @param _voteYes Whether the voter voted in favor of the proposal.
     * @param hasVoted Whether the voter has already voted.
     */
    event Voted(address _voter, bool _voteYes, bool hasVoted);

     /**
     * @dev Event emitted when the workflow status changes.
     * @param previousStatus The previous status of the voting process.
     * @param newStatus The new status of the voting process.
     */
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);

    /**
     * @dev Event emitted when the predetermined proposal is set by owner.
     * @param predeterminedProposal The predetermined proposal that DAO members will vote on.
     */
    event PredeterminedProposalSet(string predeterminedProposal);

    /**
     * @dev Event emitted when the vote is set by owner (members, quorum and minParticipation).
     */
    event VoteSettingsSet(uint32 members, uint32 quorum, uint32 minParticipation);


    /*
     * @dev Event emitted when the proposal result is determined.
     */
    event ProposalResult(bool proposalResult);

    /*
     * @dev Constructor that sets the owner and the address of the NFT contract.
     * @param _owner The address of the contract owner.
     * @param nftContractAddress_ The address of the NFT contract.
     */
    constructor(address _owner, address nftContractAddress_) {
        transferOwnership(_owner);
        _nftContractAddress = nftContractAddress_;
    }

    /*
     * @dev A modifier to restrict voting to NFT holders and the contract owner.
     */
    modifier onlyVoters() {
        require(IERC721(_nftContractAddress).balanceOf(msg.sender) > 0 || msg.sender == owner(), "You have to hold a Dao NFT to be able to vote");
        _;
    } 

    /**
     * @dev Sets the number of DAO members at the time of the vote, quorum percentage, and minimum 
     * participation percentage required for this vote.
     * @param _members The number of DAO members.
     * @param _quorum The percentage of votes required for a quorum.
     * @param _minParticipation The minimum percentage of DAO NFT holders required to vote.
     */
    function setVote(uint32 _members, uint32 _quorum, uint32 _minParticipation) external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalSet, "The workflow status must be ProposalSet");
        require(_quorum > 0 && _quorum <= 100, "Quorum percentage must be between 1 and 100");
        require(_minParticipation > 0 && _minParticipation <= 100, "Minimum participation percentage must be between 1 and 100");
        members = _members;
        quorum = _quorum;
        minParticipation = _minParticipation;
        emit VoteSettingsSet(_members, _quorum, _minParticipation);    
    }

    /*
     * @dev Owner set a predetermined proposal to be voted on (proposal chosen by members with snapshot).
     * @param _proposal The predetermined proposal to be voted on.
     */
    function setPredeterminedProposal(string memory _proposal) external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalSet, "The workflow status must be ProposalSet");
        require(bytes(_proposal).length > 0, "Proposal cannot be empty");
        predeterminedProposal = _proposal;
        emit PredeterminedProposalSet(predeterminedProposal);
    }

    /*
     * @dev Returns the voter data for a given address.
     * @param _addr The address to retrieve voter data for.
     * @return The voter data for the specified address.
     */
    function getVoter(address _addr) external view onlyOwner returns (Voter memory) {
        return voters[_addr];
    }
    
    /*
     * @dev Determines whether the predetermined proposal has been accepted based on the voting results.
     * OnlyOwner function for emit evnts just once.
     * @return A boolean indicating whether the proposal was accepted.
     */
    function isProposalAccepted() external onlyOwner returns (bool) {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Voting session is not ended yet"); 
        uint128 quorumVotes = (members * quorum) / 100;
        uint128 minParticipationVotes = (members * minParticipation) / 100;

        if (totalVoters >= minParticipationVotes) {  
            if (voteCount.yes + voteCount.no >= quorumVotes) { 

                if (voteCount.yes > voteCount.no) {
                    proposalResult = true;
                    emit ProposalResult(true);
                    resultChecked = true;
                    return true ;
                    
                } else {
                    proposalResult = false;
                    emit ProposalResult(false);
                    resultChecked = true;
                    return false;
                }
            }
        }

        revert("Minimum participation and/or quorum not reached");           
    }

    /*
     * @dev Allows a voter to vote for or against the predetermined proposal (selected by snapshot).
     * @param _voteYes A boolean indicating whether the voter is voting for the proposal (true) or against it (false).
     */
    function voteForProposal(bool _voteYes) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session havent started yet");
        require(voters[msg.sender].hasVoted != true, 'You have already voted');
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].vote = _voteYes;
        totalVoters++;

        if (_voteYes) {
            voteCount.yes++;

        } else {
            voteCount.no++;
            }

        emit Voted(msg.sender, _voteYes, voters[msg.sender].hasVoted);
    }

    /*
     * @dev Returns the predetermined proposal.
     * @return A string representing the predetermined proposal.
     */
    function getPredeterminedProposal() external view onlyVoters returns(string memory) {
        return predeterminedProposal;
    }

    /*
     * @dev Returns the current workflow status.
     * @return The current workflow status.
     */
    function getWorkflowStatus() external view onlyVoters returns (WorkflowStatus) {
        return workflowStatus;
    }

    /**
     * @dev Determines whether the predetermined proposal has been accepted based on the voting results.
     * This function returns the result of the proposal as determined by the voting process for
     * the voters.
     */
    function getResult() external view onlyVoters returns(bool) {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Voting session is not ended yet"); 
        require(resultChecked, "Result has not been checked yet");
        return proposalResult;
    }

    /**
     * @dev Check if the minimum participation and quorum rules are met. 
     * @return A boolean indicating whether the rules are met.
     */
    function checkRules() external view onlyVoters returns (bool) {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Voting session is not ended yet"); 
        uint128 quorumVotes = (members * quorum) / 100;
        uint128 minParticipationVotes = (members * minParticipation) / 100;
    
        if (totalVoters < minParticipationVotes) {
            return false;
        }
    
        if (voteCount.yes + voteCount.no < quorumVotes) {
            return false;
        }
    
        return true;
    }

    /*
     * @dev Owner starts the voting session.
     */
    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalSet, "Wrong WorkflowStatus");
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalSet, WorkflowStatus.VotingSessionStarted);
    }

    /*
     * @dev Owner ends the voting session.
     */
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Wrong WorkflowStatus");
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }  
}