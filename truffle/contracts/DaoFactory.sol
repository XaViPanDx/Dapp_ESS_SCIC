// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./NewDao.sol";

/**
 * @title DaoFactory.sol
 *
 * @author Xavier BARADA / github: https://github.com/XaViPanDx
 *
 * @notice DaoFactory Smart Contract allows users to create DAOs for their SCIC.
 * The Ownable OpenZeppelin contract makes the deployer the owner of the DApp contract.
 * A user admin designated by a SCIC will interact with this Smart Contract to deploy
 * a new DAO named NewDao.sol using the createDao() function.
 */
contract DaoFactory is Ownable {

    /**
     * @dev DeployedDao struct to store date about DAO
     * It includes the DAO address, the creator(owner) address
     * and the DAO name.
     */
    struct DeployedDao {
        address dao;
        address creator;
        string name;
    }

    /**
     * @dev Mapping to store the DAOs created by each user. The key is the user's address and the value is an array of DeployedDao structs.
     */
    mapping(address => DeployedDao[]) private _userDeployedDaos;

    /**
     * @dev Array to store the addresses of all the DAOs created on the DApp.
     */
    address[] private _allDeployedDaos;

    /**
     * @dev NewDao events that allow retrieving important information from the DApp
     */
    event DaoCreated(address indexed daoAddress, address indexed creator, string name);

    /**
     * @dev User will be the new owner of this new DAO Smart Contract with the Ownable.sol 
     * Openzeppelin Smart Contract by sharing the msg.sender address with the new Smart Contract.
     * DaoFactory storage will be updated.
     *
     * @notice admin will be able to create a new DAO with a chosen name.
     *
     * @param _name = name of new DAO.
     */
    function createDao(string memory _name) external {
        require(bytes(_name).length > 0, "DAO name cannot be empty");
        NewDao newDao = new NewDao(msg.sender, _name);
        DeployedDao memory newDeployedDao;
        newDeployedDao.dao = address(newDao);
        newDeployedDao.name = _name;
        newDeployedDao.creator = msg.sender;
        _userDeployedDaos[msg.sender].push(newDeployedDao);
        _allDeployedDaos.push(address(newDao));
        emit DaoCreated(address(newDao), msg.sender, _name);
    }

    /**
     * @dev Function to retrieve the DAO Smart Contract address created by its index.
     *
     * @param _creator The address of the DAO creator.
     * @param _index The index of the DAO in the creator's list.
     * @return The address of the DAO Smart Contract.
     */
    function getUserDaoContract(address _creator, uint _index) external view returns (address) {
        require(msg.sender == _creator, "You are not authorized");
        require(_index < _userDeployedDaos[_creator].length, "Index out of bounds");
        return _userDeployedDaos[_creator][_index].dao;
    }

    /**
     * @dev getUserDaoCount() allows Smart Contract Owner to check the number of DAOs 
     * created by one user by his address.
     * @param _user the address of the DAO' creator.
     * @return The number of DAOs deployed by this user.
     */
    function getUserDaoCount(address _user) external view onlyOwner returns (uint) {
        return _userDeployedDaos[_user].length;
    }

    /**
     * @dev getDeployedDaosCount() allows Smart Contract Owner to check the number of
     * all the DAOs created on the Smart Contract.
     $ @return The number of all deployed DAOs by the contract.
     */
    function getDeployedDaosCount() external view onlyOwner returns (uint) {
        return _allDeployedDaos.length;
    }

    /**
     * @dev getDeployedDaosCount() allows Smart Contract Owner to check one DAO among
     * all the DAOs created on the Smart Contract by its index.
     * @param _index The index of DAO search in all DAOs created list.
     * @return The DAO address by index in total DAOs array.
     */
    function getDeployedDaoByIndex(uint _index) external view onlyOwner returns (address) {
        require(_index < _allDeployedDaos.length, "Index out of bounds");
        return _allDeployedDaos[_index];
    }
}