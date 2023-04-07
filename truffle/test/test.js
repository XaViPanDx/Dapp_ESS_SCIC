const DaoFactory = artifacts.require("./DaoFactory");
const NewDao = artifacts.require("NewDao");
const NewToken = artifacts.require("NewToken");
const NewVoting = artifacts.require("NewVoting");
const {BN, expectRevert, expectEvent} = require('@openzeppelin/test-helpers');
const {expect} = require('chai');

contract('DaoFactory', accounts => {

    const Owner = accounts[0];
    const DaoAdmin = accounts[1]; 
    const Member1 = accounts[2]; 
    const Member2 = accounts[3]; 
    const DaoAdmin2 = accounts[4]; 
    const DaoAdmin3 = accounts[5]; 
    const Member3 = accounts[6]; 
    const NotMember = accounts[7]; 
    const Member4 = accounts[8]; 

    let MyDaoFactoryInstance;
    let MyNewDaoInstance;
    let MyNewTokenInstance;
    let MyNewVotingInstance;

    describe("DaoFactory.sol contract", function() {

        beforeEach( async function() {
            MyDaoFactoryInstance = await DaoFactory.new({from: Owner});
        });

            describe("Contract Test", function() {

                it("Should deploy DaoFactory", async function() {
                    expect(DaoFactory.address !== "");
                });

                it("should be Owner", async function() {
                    expect(await MyDaoFactoryInstance.owner()).to.be.equal(Owner);
                }); 
            });
                 
            describe("createDao function tests", function() {

                it("should revert if the provided DAO name is empty", async function () {
                    const daoName = "";
                    await expectRevert(MyDaoFactoryInstance.createDao(daoName, { from: DaoAdmin }), "DAO name cannot be empty");
                });                

                it("created DAO should have the correct owner", async function () {
                    const daoName = "Test DAO";
                    const createDaoTx = await MyDaoFactoryInstance.createDao(daoName, { from: DaoAdmin });
                    const event = createDaoTx.logs.find(e => e.event === "DaoCreated");
                    const createdDaoAddress = event.args.daoAddress;
                    MyNewDaoInstance = await NewDao.at(createdDaoAddress);
                    const createdDaoOwner = await MyNewDaoInstance.owner({ from: DaoAdmin });
                    expect(createdDaoOwner).to.equal(DaoAdmin);
                });

                it("created DAO should have the correct owner (2)", async function () {
                    const daoName = "Test DAO";
                    const daoName2 = "Test DAO2";
                    const createDaoTx = await MyDaoFactoryInstance.createDao(daoName, { from: DaoAdmin });
                    const createDaoTx2 = await MyDaoFactoryInstance.createDao(daoName2, { from: DaoAdmin3 });
                    const event2 = createDaoTx2.logs.find(e => e.event === "DaoCreated");
                    const createdDaoAddress2 = event2.args.daoAddress;
                    MyNewDaoInstance = await NewDao.at(createdDaoAddress2);
                    const createdDaoOwner2 = await MyNewDaoInstance.owner({ from: DaoAdmin3 });
                    expect(createdDaoOwner2).to.equal(DaoAdmin3);
                }); 
                  
                it("createDao should create a new DAO with the correct name", async function () {
                    const daoName = "Test DAO";
                    const createDaoTx = await MyDaoFactoryInstance.createDao(daoName, { from: DaoAdmin });
                    const event = createDaoTx.logs.find(e => e.event === "DaoCreated");
                    const createdDaoAddress = event.args.daoAddress;
                    MyNewDaoInstance = await NewDao.at(createdDaoAddress);
                    const createdDaoName = await MyNewDaoInstance.getDaoName({ from: DaoAdmin });
                    expect(createdDaoName).to.equal(daoName);
                });

                it("createDao should create a new DAO with the correct name (2)", async function () {
                    const daoName = "Test DAO";
                    const daoName2 = "Test DAO2";
                    const createDaoTx = await MyDaoFactoryInstance.createDao(daoName, { from: DaoAdmin });
                    const createDaoTx2 = await MyDaoFactoryInstance.createDao(daoName2, { from: DaoAdmin2 });
                    const createDaoTx3 = await MyDaoFactoryInstance.createDao(daoName2, { from: DaoAdmin3 });
                    const event2 = createDaoTx2.logs.find(e => e.event === "DaoCreated");
                    const createdDaoAddress2 = event2.args.daoAddress;
                    MyNewDaoInstance = await NewDao.at(createdDaoAddress2);
                    const createdDaoName2 = await MyNewDaoInstance.getDaoName({ from: DaoAdmin2 });
                    expect(createdDaoName2).to.equal(daoName2);
                });

                it("createDao should emit DaoCreated event with correct parameters", async function() {
                    const daoName = "Test DAO";
                    const result = await MyDaoFactoryInstance.createDao(daoName, { from: DaoAdmin });
                    const event = result.logs.find(e => e.event === "DaoCreated");
                    const daoAddress = event.args.daoAddress;
                    await expectEvent(result, "DaoCreated", { daoAddress: daoAddress, creator: DaoAdmin, name: daoName});
                });          
            });

            describe('getUserDaoContract function tests', function () {
            
                it('should return the address of the created DAO by index', async function () {
                    const daoName = 'Test DAO';
                    const receipt = await MyDaoFactoryInstance.createDao(daoName, { from: DaoAdmin });
                    const eventArgs = receipt.logs.find(({ event }) => event === 'DaoCreated').args;
                    this.newDaoAddress = eventArgs.daoAddress;
                    const daoAddress = await MyDaoFactoryInstance.getUserDaoContract(DaoAdmin, 0, { from: DaoAdmin });
                    expect(daoAddress).to.equal(this.newDaoAddress);
                });

                it('should return the address of the created DAO by index (2)', async function () {
                    const daoName = 'Test DAO';
                    const daoName2 = 'Test DAO2';
                    const receipt = await MyDaoFactoryInstance.createDao(daoName, { from: DaoAdmin });
                    const receipt2 = await MyDaoFactoryInstance.createDao(daoName2, { from: DaoAdmin });
                    const eventArgs = receipt.logs.find(({ event }) => event === 'DaoCreated').args;
                    this.newDaoAddress = eventArgs.daoAddress;
                    const eventArgs2 = receipt2.logs.find(({ event }) => event === 'DaoCreated').args;
                    this.newDaoAddress2 = eventArgs2.daoAddress;
                    const daoAddress = await MyDaoFactoryInstance.getUserDaoContract(DaoAdmin, 1, { from: DaoAdmin });
                    expect(daoAddress).to.equal(this.newDaoAddress2);
                });

                it("getUserDaoContract should fail if the caller is not the creator (different admin)", async function () {
                    await MyDaoFactoryInstance.createDao("Test DAO", { from: DaoAdmin });
                    await expectRevert(MyDaoFactoryInstance.getUserDaoContract(DaoAdmin, 0, { from: DaoAdmin2 }),"You are not authorized");
                });

                it("getUserDaoContract should fail if the caller is not the creator (member)", async function () {
                    await MyDaoFactoryInstance.createDao("Test DAO", { from: DaoAdmin });
                    await expectRevert(MyDaoFactoryInstance.getUserDaoContract(DaoAdmin, 0, { from: Member1 }),"You are not authorized");
                });

                it("getUserDaoContract should fail if the caller is not the creator (notMember)", async function () {
                    await MyDaoFactoryInstance.createDao("Test DAO", { from: DaoAdmin });
                    await expectRevert(MyDaoFactoryInstance.getUserDaoContract(DaoAdmin, 0, { from: NotMember }),"You are not authorized");
                });
            
                it("getUserDaoContract should fail if the index is out of bounds", async function () {
                    await MyDaoFactoryInstance.createDao("Test DAO", { from: DaoAdmin });
                    await expectRevert(MyDaoFactoryInstance.getUserDaoContract(DaoAdmin, 1, { from: DaoAdmin }),"Index out of bounds");
                });

                it("getUserDaoContract should fail if the index is out of bounds (2)", async function () {
                    await MyDaoFactoryInstance.createDao("Test DAO", { from: DaoAdmin });
                    await expectRevert(MyDaoFactoryInstance.getUserDaoContract(DaoAdmin, 2, { from: DaoAdmin }),"Index out of bounds");
                });
            });

            describe('getUserDaoCount function tests', function () {
                
                it("getUserDaoCount should return the correct number of DAOs created by a user (DaoAdmin)", async function() {
                    const daoName1 = "Test DAO 1";
                    const daoName2 = "Test DAO 2";
                    await MyDaoFactoryInstance.createDao(daoName1, { from: DaoAdmin });
                    await MyDaoFactoryInstance.createDao(daoName2, { from: DaoAdmin });
                    const userDaoCount = await MyDaoFactoryInstance.getUserDaoCount(DaoAdmin);
                    expect(userDaoCount).to.be.bignumber.equal(new BN(2));
                });  

                it("getUserDaoCount should return the correct number of DAOs created by a user (DaoAmin2)", async function() {
                    const daoName1 = "Test DAO 1";
                    const daoName2 = "Test DAO 2";
                    const daoName3 = "Test DAO 3";
                    await MyDaoFactoryInstance.createDao(daoName1, { from: DaoAdmin2 });
                    await MyDaoFactoryInstance.createDao(daoName2, { from: DaoAdmin2 });
                    await MyDaoFactoryInstance.createDao(daoName3, { from: DaoAdmin2 });
                    const userDaoCount = await MyDaoFactoryInstance.getUserDaoCount(DaoAdmin2);
                    expect(userDaoCount).to.be.bignumber.equal(new BN(3));
                });   

                it("getUserDaoCount should return the correct number of DAOs created by a user (DaoAdmin) (2)", async function() {
                    const daoName1 = "Test DAO 1";
                    const daoName2 = "Test DAO 2";
                    const daoName3 = "Test DAO 3";
                    const daoName4 = "Test DAO 4";
                    await MyDaoFactoryInstance.createDao(daoName1, { from: DaoAdmin });
                    await MyDaoFactoryInstance.createDao(daoName2, { from: DaoAdmin });
                    await MyDaoFactoryInstance.createDao(daoName3, { from: DaoAdmin });
                    await MyDaoFactoryInstance.createDao(daoName4, { from: DaoAdmin });
                    const userDaoCount = await MyDaoFactoryInstance.getUserDaoCount(DaoAdmin);
                    expect(userDaoCount).to.be.bignumber.equal(new BN(4));
                });  
                
                it("getUserDaoCount should fail if the caller is not the owner (DaoAdmin)", async function () {
                    await expectRevert(MyDaoFactoryInstance.getUserDaoCount(DaoAdmin, { from: DaoAdmin2 }),"Ownable: caller is not the owner");
                });

                it("getUserDaoCount should fail if the caller is not the owner (member)", async function () {
                    await expectRevert(MyDaoFactoryInstance.getUserDaoCount(DaoAdmin, { from: Member1 }),"Ownable: caller is not the owner");
                });

                it("getUserDaoCount should fail if the caller is not the owner (notMember)", async function () {
                    await expectRevert(MyDaoFactoryInstance.getUserDaoCount(DaoAdmin, { from: NotMember }),"Ownable: caller is not the owner");
                });
            });

            describe("getDeployedDaosCount function", function() {

                it("should return the correct number of deployed DAOs with 1 Admin", async function () {
                    const daoName1 = "Test DAO 1";
                    const daoName2 = "Test DAO 2";
                    const daoName3 = "Test DAO 3";
                    let deployedDaosCount = await MyDaoFactoryInstance.getDeployedDaosCount({ from: Owner });
                    expect(deployedDaosCount).to.be.bignumber.equal(new BN(0));
                    await MyDaoFactoryInstance.createDao(daoName1, { from: DaoAdmin });
                    deployedDaosCount = await MyDaoFactoryInstance.getDeployedDaosCount({ from: Owner });
                    expect(deployedDaosCount).to.be.bignumber.equal(new BN(1));
                    await MyDaoFactoryInstance.createDao(daoName2, { from: DaoAdmin });
                    await MyDaoFactoryInstance.createDao(daoName3, { from: DaoAdmin });
                    deployedDaosCount = await MyDaoFactoryInstance.getDeployedDaosCount({ from: Owner });
                    expect(deployedDaosCount).to.be.bignumber.equal(new BN(3));
                });

                it("should return the correct number of deployed DAOs with 3 Admin", async function () {
                    const daoName1 = "Test DAO 1";
                    const daoName2 = "Test DAO 2";
                    const daoName3 = "Test DAO 3";
                    let deployedDaosCount = await MyDaoFactoryInstance.getDeployedDaosCount({ from: Owner });
                    expect(deployedDaosCount).to.be.bignumber.equal(new BN(0));
                    await MyDaoFactoryInstance.createDao(daoName1, { from: DaoAdmin });
                    deployedDaosCount = await MyDaoFactoryInstance.getDeployedDaosCount({ from: Owner });
                    expect(deployedDaosCount).to.be.bignumber.equal(new BN(1));
                    await MyDaoFactoryInstance.createDao(daoName2, { from: DaoAdmin2 });
                    await MyDaoFactoryInstance.createDao(daoName3, { from: DaoAdmin3 });
                    deployedDaosCount = await MyDaoFactoryInstance.getDeployedDaosCount({ from: Owner });
                    expect(deployedDaosCount).to.be.bignumber.equal(new BN(3));
                });   
                
                it("getDeployedDaosCount should revert if the caller is not the owner (admin)", async function () {
                    await MyDaoFactoryInstance.createDao("Test DAO", { from: DaoAdmin });
                    await expectRevert(MyDaoFactoryInstance.getDeployedDaosCount( { from: DaoAdmin } ),"Ownable: caller is not the owner");
                });

                it("getDeployedDaosCount should revert if the caller is not the owner (member)", async function () {
                    await MyDaoFactoryInstance.createDao("Test DAO", { from: DaoAdmin });
                    await expectRevert(MyDaoFactoryInstance.getDeployedDaosCount( { from: Member1 } ),"Ownable: caller is not the owner");
                });

                it("getDeployedDaosCount should revert if the caller is not the owner (notMember)", async function () {
                    await MyDaoFactoryInstance.createDao("Test DAO", { from: DaoAdmin });
                    await expectRevert(MyDaoFactoryInstance.getDeployedDaosCount( { from: NotMember } ),"Ownable: caller is not the owner");
                });
            });

            describe("getDeployedDaoByIndex function", function() {

                it("should return the correct deployed DAO at a given index", async function () {
                    const daoName1 = "Test DAO 1";
                    const daoName2 = "Test DAO 2";
                    const daoName3 = "Test DAO 3";
                    await MyDaoFactoryInstance.createDao(daoName1, { from: DaoAdmin });
                    await MyDaoFactoryInstance.createDao(daoName2, { from: DaoAdmin });
                    await MyDaoFactoryInstance.createDao(daoName3, { from: DaoAdmin });  
                    const daoAddress1 = (await MyDaoFactoryInstance.getDeployedDaoByIndex(0, { from: Owner })).dao;
                    const daoAddress2 = (await MyDaoFactoryInstance.getDeployedDaoByIndex(1, { from: Owner })).dao;
                    const daoAddress3 = (await MyDaoFactoryInstance.getDeployedDaoByIndex(2, { from: Owner })).dao;
                    const daosCount = await MyDaoFactoryInstance.getDeployedDaosCount({ from: Owner });
                    let allDeployedDaos = [];
                    for (let i = 0; i < daosCount; i++) {
                        allDeployedDaos.push((await MyDaoFactoryInstance.getDeployedDaoByIndex(i, { from: Owner })).dao);
                    }
                    expect(daoAddress1).to.equal(allDeployedDaos[0]);
                    expect(daoAddress2).to.equal(allDeployedDaos[1]);
                    expect(daoAddress3).to.equal(allDeployedDaos[2]);
                });

                it("should return the correct deployed DAO address at a given index", async function () {
                    const daoName1 = "Test DAO 1";
                    const daoName2 = "Test DAO 2";
                    const daoName3 = "Test DAO 3";
                    const createDaoTx1 = await MyDaoFactoryInstance.createDao(daoName1, { from: DaoAdmin });
                    const createDaoTx2 = await MyDaoFactoryInstance.createDao(daoName2, { from: DaoAdmin });
                    const createDaoTx3 = await MyDaoFactoryInstance.createDao(daoName3, { from: DaoAdmin });
                    const expectedDaoAddress1 = createDaoTx1.logs[0].args.dao;
                    const expectedDaoAddress2 = createDaoTx2.logs[0].args.dao;
                    const expectedDaoAddress3 = createDaoTx3.logs[0].args.dao;
                    const actualDaoAddress1 = (await MyDaoFactoryInstance.getDeployedDaoByIndex(0, { from: Owner })).dao;
                    const actualDaoAddress2 = (await MyDaoFactoryInstance.getDeployedDaoByIndex(1, { from: Owner })).dao;
                    const actualDaoAddress3 = (await MyDaoFactoryInstance.getDeployedDaoByIndex(2, { from: Owner })).dao;
                    expect(actualDaoAddress1).to.equal(expectedDaoAddress1);
                    expect(actualDaoAddress2).to.equal(expectedDaoAddress2);
                    expect(actualDaoAddress3).to.equal(expectedDaoAddress3);
                });
                  
                it("getDeployedDaoByIndex should revert if the index is out of bounds", async function () {
                    await MyDaoFactoryInstance.createDao("Test DAO", { from: DaoAdmin });
                    await expectRevert(MyDaoFactoryInstance.getDeployedDaoByIndex(3, { from: Owner } ),"Index out of bounds");
                });

                it("getDeployedDaoByIndex should revert if the caller is not the owner (admin)", async function () {
                    await MyDaoFactoryInstance.createDao("Test DAO", { from: DaoAdmin });
                    await expectRevert(MyDaoFactoryInstance.getDeployedDaoByIndex(1, { from: DaoAdmin } ),"Ownable: caller is not the owner");
                });

                it("getDeployedDaoByIndex should revert if the caller is not the owner (member)", async function () {
                    await MyDaoFactoryInstance.createDao("Test DAO", { from: DaoAdmin });
                    await expectRevert(MyDaoFactoryInstance.getDeployedDaoByIndex(0, { from: Member1 } ),"Ownable: caller is not the owner");
                });

                it("getDeployedDaoByIndex should revert if the caller is not the owner (notMember)", async function () {
                    await MyDaoFactoryInstance.createDao("Test DAO", { from: DaoAdmin });
                    await expectRevert(MyDaoFactoryInstance.getDeployedDaoByIndex(2, { from: NotMember } ),"Ownable: caller is not the owner");
                });
            });   
    });

    describe("NewDao.sol Contract", function() {
        let daoName = "MyDao";
      
        beforeEach(async function() {
          MyDaoFactoryInstance = await DaoFactory.new({from: Owner});
          MyNewDaoInstance = await NewDao.new(DaoAdmin, daoName, {from: DaoAdmin});
        });     

            describe("Contract Deployment", function() {
      
                it("should deploy a NewDao contract", async function() {
                expect(MyNewDaoInstance.address).to.not.equal(undefined);
                });
        
                it("should have the correct DAO name", async function() {
                const name = await MyNewDaoInstance.getDaoName({from:DaoAdmin});
                expect(name).to.equal(daoName);
                });
            
                it("should have the correct DAO creator", async function() {
                const creator = await MyNewDaoInstance.owner();
                expect(creator).to.equal(DaoAdmin);
                });

            });

            describe("AddMember function", function() {

                it("addMember should add a new member to the DAO", async function() {
                    const newMember = Member1;
                    await MyNewDaoInstance.addMember(newMember,"name", {from: DaoAdmin});
                    const isMember = await MyNewDaoInstance.isMember(newMember, {from: DaoAdmin});
                    expect(isMember).to.be.true;
                });
                  
                it("addMember should should revert if the caller is not the owner(member)", async function() {
                    const newMember = Member1;
                    await expectRevert(MyNewDaoInstance.addMember(newMember, {from: Member1}),"Ownable: caller is not the owner");
                });

                it("addMember should should revert if the caller is not the owner(notMmember)", async function() {
                    const newMember = Member1;
                    await expectRevert(MyNewDaoInstance.addMember(newMember, {from: NotMember}),"Ownable: caller is not the owner");
                });
                  
                it("addMember should fail if the member already exists", async function() {
                    await MyNewDaoInstance.addMember(Member1,"newmember", {from: DaoAdmin});
                    const existingMember = Member1;
                    await expectRevert(MyNewDaoInstance.addMember(existingMember,"newMember", {from: DaoAdmin}),"Member already exists");
                });

                it("addMember should increment the member count", async function() {
                    const newMember = Member1;
                    const memberCountBefore = await MyNewDaoInstance.getMemberCount({from:DaoAdmin});
                    await MyNewDaoInstance.addMember(newMember,"name", {from: DaoAdmin});
                    const memberCountAfter = await MyNewDaoInstance.getMemberCount({from:DaoAdmin});
                    expect(memberCountAfter - memberCountBefore).to.be.equal(1);
                });

                it("addMember event", async function() {
                    const event = await MyNewDaoInstance.addMember(Member1, "name", {from:DaoAdmin});
                    expectEvent(event, "MemberAdded", {memberAddress:Member1, isMember:true, memberIndex:new BN(1), memberName: "name", memberCount:new BN(1)});
                });   
            });

            describe("removeMember function", function() {

                it("removeMember should remove a member from the DAO", async function() {
                    const newMember = Member1;
                    await MyNewDaoInstance.addMember(newMember, "name", {from: DaoAdmin});
                    await MyNewDaoInstance.removeMember(newMember, {from: DaoAdmin});
                    const isMember = await MyNewDaoInstance.isMember(newMember, {from: DaoAdmin});
                    expect(isMember).to.be.false;
                });
                
                it("removeMember should should revert if the caller is not the owner(member)", async function() {
                    const newMember = Member1;
                    await MyNewDaoInstance.addMember(newMember, "name", {from: DaoAdmin});
                    await expectRevert(MyNewDaoInstance.removeMember(newMember, {from: Member1}), "Ownable: caller is not the owner");
                });

                it("removeMember should revert if the caller is not the owner(notMmember)", async function() {
                    const newMember = Member1;
                    await MyNewDaoInstance.addMember(newMember, "name", {from: DaoAdmin});
                    await expectRevert(MyNewDaoInstance.removeMember(newMember, {from: NotMember}), "Ownable: caller is not the owner");
                });
                
                it("removeMember should fail if the member does not exist", async function() {
                    const nonExistingMember = Member1;
                    await expectRevert(MyNewDaoInstance.removeMember(nonExistingMember, {from: DaoAdmin}), "Member does not exist");
                });

                it("removemember should decrement the member count", async function() {
                    const newMember = Member1;
                    const newMember2 = Member2;
                    await MyNewDaoInstance.addMember(newMember,"name", {from: DaoAdmin});
                    await MyNewDaoInstance.addMember(newMember2,"Name", {from: DaoAdmin});
                    const memberCountBefore = await MyNewDaoInstance.getMemberCount({from:DaoAdmin});
                    await MyNewDaoInstance.removeMember(newMember, {from: DaoAdmin});
                    const memberCountAfter = await MyNewDaoInstance.getMemberCount({from:DaoAdmin});
                    expect(memberCountBefore - memberCountAfter).to.be.equal(1);
                });

                it("removeMember event", async function() {
                    await MyNewDaoInstance.addMember(Member1, "name", {from:DaoAdmin});
                    const event = await MyNewDaoInstance.removeMember(Member1, {from:DaoAdmin});
                    expectEvent(event, "MemberRemoved", {memberAddress:Member1, memberCount:new BN(0)});
                });
            });

            describe("snapshotResult function", function() {
              
                it("snapshotResult should should revert if the caller is not the owner(member)", async function() {
                    const result = "result";
                    await expectRevert(MyNewDaoInstance.snapshotResult(result, "start", "end", {from: Member1}),"Ownable: caller is not the owner");
                });

                it("snapshotResult should revert if the caller is not the owner(notMmember)", async function() {
                    const result = "result";
                    await expectRevert(MyNewDaoInstance.snapshotResult(result, "start", "end", {from: NotMember}),"Ownable: caller is not the owner");
                });

                it("snapshotResult event", async function() { 
                    const result = await MyNewDaoInstance.snapshotResult("result", "start", "end", {from: DaoAdmin});
                    expectEvent(result,"SnapshotResult", ({id:new BN(0), result: "result", startDate: "start", endDate: "end"}));   
                });
            });

            describe("isMember function", function() {

                it("isMember should revert if the caller is not the owner(member)", async function() { 
                    await expectRevert(MyNewDaoInstance.isMember(Member2, {from:Member1}), "Ownable: caller is not the owner");   
                });

                it("isMember should revert if the caller is not the owner(notMmember)", async function() { 
                    await expectRevert(MyNewDaoInstance.isMember(Member2, {from:NotMember}), "Ownable: caller is not the owner");   
                });
                it("isMember function check 1(isMember)", async function() { 
                    await MyNewDaoInstance.addMember(Member1,"name", {from:DaoAdmin});
                    const member = await MyNewDaoInstance.isMember(Member1, {from: DaoAdmin});
                    expect(member).to.be.equal(true);   
                });
                it("isMember function check 2(notMember)", async function() { 
                    const member = await MyNewDaoInstance.isMember(Member1, {from: DaoAdmin});
                    expect(member).to.be.equal(false);   
                });
                it("isMember should revert if the caller is not the owner(notMmember)", async function() { 
                    await 
                    expectRevert(MyNewDaoInstance.isMember(Member2, {from:NotMember}), "Ownable: caller is not the owner");   
                });
            });

            describe("getMemberCount function", function() {

                it("getMemberCount should revert if the caller is not the owner(member)", async function() { 
                    await expectRevert(MyNewDaoInstance.getMemberCount({from:Member1}), "Ownable: caller is not the owner");   
                });

                it("getMemberCount should revert if the caller is not the owner(notMmember)", async function() { 
                    await expectRevert(MyNewDaoInstance.getMemberCount({from:NotMember}), "Ownable: caller is not the owner");   
                });

                it("getMemberCount function check 1", async function() { 
                    const member = await MyNewDaoInstance.getMemberCount({from: DaoAdmin});
                    expect(member).to.be.bignumber.equal(new BN(0)); 
                });

                it("getMemberCount function check 2(addMember)", async function() { 
                    await MyNewDaoInstance.addMember(Member1,"name", {from:DaoAdmin});
                    const member = await MyNewDaoInstance.getMemberCount({from: DaoAdmin});
                    expect(member).to.be.bignumber.equal(new BN(1));   
                });

                it("getMemberCount function check 3(addMember+removeMember)", async function() { 
                    await MyNewDaoInstance.addMember(Member1,"name", {from:DaoAdmin});
                    await MyNewDaoInstance.addMember(Member2,"name2", {from:DaoAdmin});
                    await MyNewDaoInstance.removeMember(Member1, {from: DaoAdmin});
                    const member = await MyNewDaoInstance.getMemberCount({from: DaoAdmin});
                    expect(member).to.be.bignumber.equal(new BN(1));   
                });
            });

            describe("getMemberByIndex function", function() {

                it("getMemberByIndex should revert if the caller is not the owner(member)", async function() { 
                    await expectRevert(MyNewDaoInstance.getMemberByIndex(1, {from:Member1}), "Ownable: caller is not the owner");   
                });

                it("getMemberByIndex should revert if the caller is not the owner(notMmember)", async function() { 
                    await expectRevert(MyNewDaoInstance.getMemberByIndex(1, {from:NotMember}), "Ownable: caller is not the owner");   
                });

                it("getMemberByIndex should revert if index is out of bounds", async function() {
                    await MyNewDaoInstance.addMember(Member1,"name", {from:DaoAdmin}); 
                    await expectRevert(MyNewDaoInstance.getMemberByIndex(1, {from:DaoAdmin}), "Index out of bounds");      
                });

                it("getMemberByIndex should return the correct member index", async function() {
                    const newMember = Member1;
                    await MyNewDaoInstance.addMember(newMember, "name", {from: DaoAdmin});
                    const memberCount = await MyNewDaoInstance.getMemberCount({from:DaoAdmin});
                    const memberInfo = await MyNewDaoInstance.getMemberByIndex(memberCount - 1, {from:DaoAdmin});
                    expect(memberInfo.memberAddress).to.be.equal(newMember);
                });

                it("getMemberByIndex should return the correct member name", async function() {
                    const newMember = Member1;
                    const memberName = "name";
                    await MyNewDaoInstance.addMember(newMember, memberName, {from: DaoAdmin});
                    const memberCount = await MyNewDaoInstance.getMemberCount({from:DaoAdmin});
                    const memberInfo = await MyNewDaoInstance.getMemberByIndex(memberCount - 1, {from:DaoAdmin});
                    expect(memberInfo.memberName).to.be.equal(memberName);
                });

                it("getMemberByIndex should return the correct member address", async function() {
                    const newMember = Member1;
                    const memberName = "name";
                    await MyNewDaoInstance.addMember(newMember, memberName, {from: DaoAdmin});
                    const memberCount = await MyNewDaoInstance.getMemberCount({from:DaoAdmin});
                    const memberInfo = await MyNewDaoInstance.getMemberByIndex(memberCount - 1, {from:DaoAdmin});
                    expect(memberInfo.memberAddress).to.be.equal(newMember);
                });  
            });

            describe("getDaoName function", function() {

                it("getDaoName should revert if the caller is not the owner(member)", async function() { 
                    await expectRevert(MyNewDaoInstance.getDaoName({from:Member1}), "Ownable: caller is not the owner");   
                });

                it("getDaoName should revert if the caller is not the owner(notMmember)", async function() { 
                    await expectRevert(MyNewDaoInstance.getDaoName({from:NotMember}), "Ownable: caller is not the owner");   
                });

                it("getDaoName function check", async function() { 
                    const getname = await MyNewDaoInstance.getDaoName( {from: DaoAdmin});
                    expect(getname).to.be.equal(daoName);   
                });        
            });

            describe("createToken function", function() {

                it("createToken should emit a TokenCreated event with the correct tokenAddress and creator", async function() {
                    await MyNewDaoInstance.addMember(Member1, "name1", { from: DaoAdmin });
                    await MyNewDaoInstance.addMember(Member2, "name2", { from: DaoAdmin });
                    await MyNewDaoInstance.addMember(Member3, "name3", { from: DaoAdmin });
                    const result = await MyNewDaoInstance.createToken("name", "symbol", { from: DaoAdmin });
                    const event = result.logs.find(e => e.event === "TokenCreated");
                    const tokenAddress = event.args.tokenAddress;
                    await expectEvent(result, "TokenCreated", { tokenAddress: tokenAddress, creator: DaoAdmin });
                });        

                it("createToken should revert if the caller is not the owner(member)", async function() { 
                    await expectRevert(MyNewDaoInstance.createToken("name", "symbol",{from:Member1}), "Ownable: caller is not the owner");   
                });

                it("createToken should revert if the caller is not the owner(notMmember)", async function() { 
                    await expectRevert(MyNewDaoInstance.createToken("name", "symbol",{from:NotMember}), "Ownable: caller is not the owner");   
                });

                it("createToken should revert if the caller is not the owner(notMmember)", async function() {
                    await MyNewDaoInstance.addMember(Member1,"name1", {from:DaoAdmin}); 
                    await MyNewDaoInstance.addMember(Member2,"name2", {from:DaoAdmin}); 
                    await MyNewDaoInstance.addMember(Member3,"name3", {from:DaoAdmin}); 
                    await MyNewDaoInstance.createToken("name", "symbol",{from:DaoAdmin}); 
                    await expectRevert(MyNewDaoInstance.createToken("name2", "symbol2",{from:DaoAdmin}), "Token contract already created");   
                });

                it("createToken should revert if the DAO don't have 3 members", async function() { 
                    await expectRevert(MyNewDaoInstance.createToken("name", "symbol",{from:DaoAdmin}), "SCIC must at least have 3 members");   
                });
            });

            describe("getTokenContract function", function() {

                it("should return the correct token contract address for a member", async function() {
                    await MyNewDaoInstance.addMember(Member1, "name1", { from: DaoAdmin });
                    await MyNewDaoInstance.addMember(Member2, "name2", { from: DaoAdmin });
                    await MyNewDaoInstance.addMember(Member3, "name3", { from: DaoAdmin });
                    const result = await MyNewDaoInstance.createToken("name", "symbol", { from: DaoAdmin });
                    const event = result.logs.find(e => e.event === "TokenCreated");
                    const tokenAddress = event.args.tokenAddress; 
                    const retrievedTokenAddress = await MyNewDaoInstance.getTokenContract(DaoAdmin, { from: DaoAdmin });
                    expect(tokenAddress).to.be.equal(retrievedTokenAddress);
                });

                it("should return the correct token contract address for a member", async function() {
                    await MyNewDaoInstance.addMember(Member1, "name1", { from: DaoAdmin });
                    await MyNewDaoInstance.addMember(Member2, "name2", { from: DaoAdmin });
                    await MyNewDaoInstance.addMember(Member3, "name3", { from: DaoAdmin });
                    await expectRevert(MyNewDaoInstance.getTokenContract(DaoAdmin, {from:DaoAdmin}), "No token contract found for this user"); 
                });

                it("getTokenContract should revert if the caller is not the owner(member)", async function() { 
                    await expectRevert(MyNewDaoInstance.getTokenContract(DaoAdmin, {from:Member1}), "Ownable: caller is not the owner");   
                });

                it("getTokenContract should revert if the caller is not the owner(notMmember)", async function() { 
                    await expectRevert(MyNewDaoInstance.getTokenContract(DaoAdmin, {from:NotMember}), "Ownable: caller is not the owner");   
                });
            });
            
            describe("createVoting function", function() {

                it("createVoting should emit a VotingCreated event with the correct votingAddress, creator, and votingContracts length", async function() {
                    await MyNewDaoInstance.addMember(Member1, "name1", { from: DaoAdmin });
                    await MyNewDaoInstance.addMember(Member2, "name2", { from: DaoAdmin });
                    await MyNewDaoInstance.addMember(Member3, "name3", { from: DaoAdmin });
                    await MyNewDaoInstance.createToken("name", "symbol", { from: DaoAdmin });
                    const result = await MyNewDaoInstance.createVoting({ from: DaoAdmin });
                    const event = result.logs.find(e => e.event === 'VotingCreated');
                    const { votingAddress, votingContractsLength } = event.args;
                    assert.equal(votingAddress, event.args.votingAddress, "Incorrect votingAddress");
                    assert.equal(DaoAdmin, event.args.creator, "Incorrect creator");
                    assert.equal(votingContractsLength, event.args.votingContractsLength, "Incorrect votingContracts length");
                });

                it("createVoting should revert if the caller is not the owner(member)", async function() { 
                    await expectRevert(MyNewDaoInstance.createVoting({from:Member1}), "Ownable: caller is not the owner");   
                });

                it("createVoting should revert if the caller is not the owner(notMmember)", async function() { 
                    await expectRevert(MyNewDaoInstance.createVoting({from:NotMember}), "Ownable: caller is not the owner");   
                });

                it("createVoting should revert if the DAO don't have 3 members", async function() { 
                    await expectRevert(MyNewDaoInstance.createVoting({from:DaoAdmin}), "Token contract does not exist");
                });
                it("createVoting should revert if the DAO don't have 3 members", async function() {
                    await MyNewDaoInstance.addMember(Member1,"name1", {from:DaoAdmin}); 
                    await MyNewDaoInstance.addMember(Member2,"name2", {from:DaoAdmin}); 
                    await expectRevert(MyNewDaoInstance.createVoting({from:DaoAdmin}), "Token contract does not exist");   
                });
            });

            describe("getVotingContractByIndex function", function() {

                it("getVotingContractByIndex should revert if the caller is not the owner(member)", async function() { 
                    await expectRevert(MyNewDaoInstance.getVotingContractByIndex(1, {from:Member1}), "Ownable: caller is not the owner");   
                });

                it("getVotingContractByIndex should revert if the caller is not the owner(notMmember)", async function() { 
                    await expectRevert(MyNewDaoInstance.getVotingContractByIndex(2, {from:NotMember}), "Ownable: caller is not the owner");   
                });

                it("should revert when trying to get a voting contract at an invalid index", async function() {
                    await MyNewDaoInstance.addMember(Member1, "name1", { from: DaoAdmin });
                    await MyNewDaoInstance.addMember(Member2, "name2", { from: DaoAdmin });
                    await MyNewDaoInstance.addMember(Member3, "name3", { from: DaoAdmin });
                    await MyNewDaoInstance.createToken("name", "symbol", { from: DaoAdmin });
                    await MyNewDaoInstance.createVoting({ from: DaoAdmin });
                    await expectRevert(MyNewDaoInstance.getVotingContractByIndex(1, { from: DaoAdmin }),"Index out of bounds");
                });   
            });

            describe("makeContribution function", function() {

                it("should emit ContributionReceived and ThankYou events on successful contribution", async function () {
                    await MyNewDaoInstance.addMember(Member1, "name1", { from: DaoAdmin });
                    const contributionAmount = web3.utils.toWei("1", "ether");
                    const tx = await MyNewDaoInstance.makeContribution({from: Member1, value: contributionAmount,});
                    const contributionReceivedEvent = tx.logs.find((e) => e.event === "ContributionReceived");
                    assert(contributionReceivedEvent.args.memberAddress === Member1);
                    assert(contributionReceivedEvent.args.amount.toString() === contributionAmount);
                    const thankYouEvent = tx.logs.find((e) => e.event === "ThankYou");
                    assert(thankYouEvent.args.from === Member1);
                    assert(thankYouEvent.args.amount.toString() === contributionAmount);
                    assert(thankYouEvent.args.message === "Thank you for your payment");
                });

                it("makeContribution should revert if sender is not a DAO member", async function () {
                    const contributionAmount = web3.utils.toWei("1", "ether");
                    await expectRevert(MyNewDaoInstance.makeContribution({from: Member1, value: contributionAmount,}),
                    "Sender must be a DAO member");   
                });

                it("makeContribution should revert if sender is not a DAO member", async function () {
                    await MyNewDaoInstance.addMember(Member1, "name1", { from: DaoAdmin });
                    const contributionAmount = web3.utils.toWei("0", "ether");
                    await expectRevert(MyNewDaoInstance.makeContribution({from: Member1, value: contributionAmount,}), 
                    "Contribution amount must be greater than 0");   
                });      
            });

            describe("Fallback() and Receive() Tests for NewDao contract", function() {

                it("fallback and receive functions should emit PaymentReceived event with correct parameters", async function() {
                    const sentAmount = web3.utils.toWei("1", "ether");
                    const receipt = await MyNewDaoInstance.sendTransaction({from: Member1,value: sentAmount});
                    const event = expectEvent.inLogs(receipt.logs, "PaymentReceived");
                    expect(event.args.from).to.equal(Member1);
                    expect(event.args.amount.toString()).to.equal(sentAmount);
                });
                
                it("fallback and receive functions should emit ThankYou event with correct parameters", async function() {
                    const sentAmount = web3.utils.toWei("1", "ether");
                    const receipt = await MyNewDaoInstance.sendTransaction({from: Member1,value: sentAmount});
                    const event = expectEvent.inLogs(receipt.logs, "ThankYou");
                    expect(event.args.from).to.equal(Member1);
                    expect(event.args.amount.toString()).to.equal(sentAmount);
                    expect(event.args.message).to.equal("Thank you for your payment");
                });
            });    
    });

    describe("NewToken.sol Contract", function() {
        let daoName = "MyDao";
        let tokenName = "MyToken";
        let tokenSymbol = "MyTokenSymbol";
      
        beforeEach(async function() {
            MyDaoFactoryInstance = await DaoFactory.new({from: Owner});
            MyNewDaoInstance = await NewDao.new(DaoAdmin, daoName, {from: DaoAdmin});
            await MyNewDaoInstance.addMember(Member1, "name1", { from: DaoAdmin });
            await MyNewDaoInstance.addMember(Member2, "name2", { from: DaoAdmin });
            await MyNewDaoInstance.addMember(Member3, "name3", { from: DaoAdmin });
            MyNewTokenInstance = await NewToken.new(DaoAdmin, tokenName, tokenSymbol, { from: DaoAdmin });    
        }); 

        describe("Contract Deployment", function() {
      
            it("should deploy a NewToken contract", async function() {
            expect(MyNewTokenInstance.address !== "");
            });

            it("should be Owner", async function() {
                expect(await MyNewTokenInstance.owner()).to.be.equal(DaoAdmin);
            });
        });


        describe("safeMint function", function() {

            it("should increase the token balance of the member", async function() {
                await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
                const balance = await MyNewTokenInstance.balanceOf(Member1);
                expect(balance).to.be.bignumber.equal(new BN(1));
            });

            it("should set the correct owner for the minted token", async function() {
                await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
                const owner = await MyNewTokenInstance.ownerOf(1);
                expect(owner).to.equal(Member1);
            });

            it("should increment token ID correctly after multiple safeMint calls", async function() {
                await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
                await MyNewTokenInstance.safeMint(Member2, {from: DaoAdmin});
                await MyNewTokenInstance.safeMint(Member3, {from: DaoAdmin});
                const balance1 = await MyNewTokenInstance.balanceOf(Member1);
                const balance2 = await MyNewTokenInstance.balanceOf(Member2);
                const balance3 = await MyNewTokenInstance.balanceOf(Member3);
                expect(balance1).to.be.bignumber.equal(new BN(1));
                expect(balance2).to.be.bignumber.equal(new BN(1));
                expect(balance3).to.be.bignumber.equal(new BN(1));
                const owner1 = await MyNewTokenInstance.ownerOf(1);
                const owner2 = await MyNewTokenInstance.ownerOf(2);
                const owner3 = await MyNewTokenInstance.ownerOf(3);
                expect(owner1).to.equal(Member1);
                expect(owner2).to.equal(Member2);
                expect(owner3).to.equal(Member3);
            });

            it("should emit NftMinted event when safeMint is called", async function() {
                const event = await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
                expectEvent(event, "NftMinted", {newOwner: Member1, nftId: new BN(1)});
            });

            it("safeMint should revert if the caller is not the owner(member)", async function() { 
                await expectRevert(MyNewTokenInstance.safeMint(Member2, {from:Member1}), "Ownable: caller is not the owner");   
            });

            it("safeMint should revert if the caller is not the owner(notMmember)", async function() { 
                await expectRevert(MyNewTokenInstance.safeMint(NotMember, {from:NotMember}), "Ownable: caller is not the owner");   
            });
        });

        describe("approveByMember function", function() {

            it("should grant approval successfully and set the approved operator for the token", async function() {
                await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
                await MyNewTokenInstance.approveByMember(Member2, 1, {from: Member1});
                const approvedOperator = await MyNewTokenInstance.getApproved(1);
                expect(approvedOperator).to.equal(Member2);
            });

            it("should emit Approval event when a member approves a token successfully", async function() {
                await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
                const receipt = await MyNewTokenInstance.approveByMember(Member2, 1, {from: Member1});
                expectEvent(receipt, "Approval", {owner: Member1, approved: Member2, tokenId: new BN(1)});
            });

            it("should allow approved operator to transfer the approved token using transferFrom", async function() {
                await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
                await MyNewTokenInstance.approveByMember(DaoAdmin, 1, {from: Member1});
                await expectRevert.unspecified(MyNewTokenInstance.transferFrom(Member1, Member3, 1, {from: DaoAdmin}));
            });

            it("should emit Approval event when a member approves a token successfully", async function() {
                await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
                const receipt = await MyNewTokenInstance.approveByMember(DaoAdmin, 1, {from: Member1});
                expectEvent(receipt, "MemberApproval", {nftOwner: Member1, approved: DaoAdmin, tokenId: new BN(1)});
            });
            
            it("approveByMember should revert if the caller is not the owner(member)", async function() { 
                await expectRevert(MyNewTokenInstance.approveByMember(Member2, 1, {from:Member1}), "You don't have token to burn.");   
            });

            it("approveByMember should revert if the caller is not the owner(NotMember)", async function() { 
                await expectRevert(MyNewTokenInstance.approveByMember(Member2, 1, {from:NotMember}), "You don't have token to burn.");   
            });

            it("approveByMember should revert if the caller is not the owner of the token to approve", async function() { 
                await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
                await MyNewTokenInstance.safeMint(Member2, {from: DaoAdmin});
                await expectRevert(MyNewTokenInstance.approveByMember(DaoAdmin, 1, {from:Member2}), "Caller is not the owner of the token");   
            });
        });

        describe("burn function", function() {

            it("should burn the token successfully and the tokenId should not exist anymore", async function() {
                await MyNewTokenInstance.safeMint(DaoAdmin, {from: DaoAdmin});
                await MyNewTokenInstance.burn(1, {from: DaoAdmin});
                await expectRevert(MyNewTokenInstance.ownerOf(1), "ERC721: invalid token ID");
            });

            it("should emit Transfer event when a token is burned successfully", async function() {
                const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
                await MyNewTokenInstance.safeMint(DaoAdmin, {from: DaoAdmin});
                const receipt = await MyNewTokenInstance.burn(1, {from: DaoAdmin});
                expectEvent(receipt, "Transfer", {from: DaoAdmin, to: ZERO_ADDRESS, tokenId: new BN(1)});
            });

            it("should decrease the balance of a member after a successful burn", async function() {
                await MyNewTokenInstance.safeMint(DaoAdmin, {from: DaoAdmin});
                const initialBalance = await MyNewTokenInstance.balanceOf(DaoAdmin);
                await MyNewTokenInstance.burn(1, {from: DaoAdmin});
                const finalBalance = await MyNewTokenInstance.balanceOf(DaoAdmin);
                expect(finalBalance).to.be.bignumber.equal(initialBalance.sub(new BN(1)));
            });

            it("should revert if trying to burn a token that the caller does not own", async function() {
                await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
                await expectRevert(MyNewTokenInstance.burn(1, {from: DaoAdmin}),"ERC721: caller is not token owner or approved.");
            });
        
            it("should emit NftBurned event when burn is called", async function() {
                await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
                await MyNewTokenInstance.approveByMember(DaoAdmin, 1, {from: Member1});
                const tx = await MyNewTokenInstance.burn(1, {from: DaoAdmin});
                expectEvent(tx, "NftBurned", {tokenOwner: Member1, nftId: new BN(1)});
            });
            
            it("burn should revert if the caller is not the owner(member)", async function() { 
                await expectRevert(MyNewTokenInstance.burn(1, {from:Member1}), "Ownable: caller is not the owner");   
            });

            it("burn should revert if the caller is not the owner(notMmember)", async function() { 
                await expectRevert(MyNewTokenInstance.burn(0, {from:NotMember} ), "Ownable: caller is not the owner");   
            });
        });

        describe("getNftIdByOwner function", function() {

            it("should return the Id of the owned Nft", async function() {
                const tokenIds = await MyNewTokenInstance.getNftIdByOwner(Member1, {from: DaoAdmin});
                expect(tokenIds.length).to.equal(1);
            });

            it("should return the correct token IDs when the owner has 1 token", async function() {
                await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
                await MyNewTokenInstance.safeMint(Member2, {from: DaoAdmin});
                const tokenIds = await MyNewTokenInstance.getNftIdByOwner(Member1, {from: DaoAdmin});
                expect(tokenIds).to.be.bignumber.equal(new BN(1));
            });

            it("should return the correct token IDs when the owner has 2 tokens", async function() {
                await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
                await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
                const tokenIds = await MyNewTokenInstance.getNftIdByOwner(Member1, {from: DaoAdmin});
                expect(tokenIds).to.be.bignumber.equal(new BN(2));
            });

            it("should return token IDs for owner after a token is burned", async function() {
                await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
                await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
                await MyNewTokenInstance.approveByMember(DaoAdmin, 1, {from: Member1});
                await MyNewTokenInstance.burn(1, {from: DaoAdmin});
                const tokenIds = await MyNewTokenInstance.getNftIdByOwner(Member1, {from: DaoAdmin});
                expect(tokenIds).to.be.bignumber.equal(new BN(2));
            });

            it("getNftIdByOwner should revert if the caller is not the owner(member)", async function() { 
                await expectRevert(MyNewTokenInstance.getNftIdByOwner(Member2, {from:Member1} ), "Ownable: caller is not the owner");   
            });

            it("getNftIdByOwner should revert if the caller is not the owner(notMmember)", async function() { 
                await expectRevert(MyNewTokenInstance.getNftIdByOwner(Member1, {from:NotMember} ), "Ownable: caller is not the owner");   
            });
        });

        describe("name function", function() {

            it("should have the correct token name", async function() {
                const name = await MyNewTokenInstance.name({from:DaoAdmin});
                expect(name).to.equal(tokenName);
            });

            it("name should revert if the caller is not the owner(member)", async function() { 
                await expectRevert(MyNewTokenInstance.name( {from:Member1} ), "Ownable: caller is not the owner");   
            });

            it("name should revert if the caller is not the owner(notMmember)", async function() { 
                await expectRevert(MyNewTokenInstance.name( {from:NotMember} ), "Ownable: caller is not the owner");   
            });
        });

        describe("symbol function", function() {

            it("should have the correct token symbol", async function() {
                const symbol = await MyNewTokenInstance.symbol({from:DaoAdmin});
                expect(symbol).to.equal(symbol);
            });

            it("symbol should revert if the caller is not the owner(member)", async function() { 
                await expectRevert(MyNewTokenInstance.symbol( {from:Member1} ), "Ownable: caller is not the owner");   
            });

            it("symbol should revert if the caller is not the owner(notMmember)", async function() { 
                await expectRevert(MyNewTokenInstance.symbol( {from:NotMember} ), "Ownable: caller is not the owner");   
            });
        });

        describe("Transfert reverts", function() {

            it("transferFrom should revert", async function() {
                expectRevert(MyNewTokenInstance.transferFrom(DaoAdmin, Member1, 1), "Transfers are not allowed in this contract.");
            });

            it("safeTransferFrom should revert", async function() {
                expectRevert(MyNewTokenInstance.safeTransferFrom(DaoAdmin, Member1, 1), "Transfers are not allowed in this contract.");
            });

            it("safeTransferFrom with bytes should revert", async function() {
                expectRevert(MyNewTokenInstance.safeTransferFrom(DaoAdmin, Member1, 1, ), "Transfers are not allowed in this contract.");
            });

            it("setApprovalForAll should revert", async function() {
                expectRevert(MyNewTokenInstance.setApprovalForAll(Member1, true), "Transfers are not allowed in this contract.");
            });
        });
    });

    describe("NewVoting.sol Contract", function() {
        let daoName = "MyDao";
        let tokenName = "MyToken";
        let tokenSymbol = "MyTokenSymbol";
        
        beforeEach(async function() {
            MyDaoFactoryInstance = await DaoFactory.new({from: Owner});
            MyNewDaoInstance = await NewDao.new(DaoAdmin, daoName, {from: DaoAdmin});
            MyNewTokenInstance = await NewToken.new(DaoAdmin, tokenName, tokenSymbol, { from: DaoAdmin });
            await MyNewDaoInstance.addMember(Member1, "name1", { from: DaoAdmin });
            await MyNewDaoInstance.addMember(Member2, "name2", { from: DaoAdmin });
            await MyNewDaoInstance.addMember(Member3, "name3", { from: DaoAdmin });
            await MyNewTokenInstance.safeMint(Member1, {from: DaoAdmin});
            await MyNewTokenInstance.safeMint(Member2, {from: DaoAdmin});
            await MyNewTokenInstance.safeMint(Member3, {from: DaoAdmin}); 
            MyNewVotingInstance = await NewVoting.new(DaoAdmin, MyNewTokenInstance.address, { from: DaoAdmin });
        }); 

            describe("Contract Deployment", function() {
        
                it("should deploy a NewVoting contract", async function() {
                expect(MyNewVotingInstance.address !== "");
                });

                it("should be good Owner", async function() {
                    expect(await MyNewVotingInstance.owner()).to.be.equal(DaoAdmin);
                });    
            });

            describe("setVote function", function() {
                
                it("setVote event test", async function() { 
                    const vote =await MyNewVotingInstance.setVote(3, 33, 20, {from:DaoAdmin} );
                    expectEvent(vote, "VoteSettingsSet", ({members: new BN(3), quorum: new BN(33), minParticipation: new BN(20)})); 
                });

                it("setVote should revert if wrong workflowstatus", async function() { 
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await expectRevert(MyNewVotingInstance.setVote(3, 33, 20, {from:DaoAdmin} ), "The workflow status must be ProposalSet");   
                });

                it("setVote should revert if wrong workflowstatus", async function() { 
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.endVotingSession({from: DaoAdmin});
                    await expectRevert(MyNewVotingInstance.setVote(3, 33, 20, {from:DaoAdmin} ), "The workflow status must be ProposalSet");   
                });
            
                it("setVote should revert if quorum is not correct", async function() {  
                    await expectRevert(MyNewVotingInstance.setVote(3, 333, 20, {from:DaoAdmin} ), "Quorum percentage must be between 1 and 100");   
                });

                it("setVote should revert if minParticipation is not correct", async function() {  
                    await expectRevert(MyNewVotingInstance.setVote(3, 33, 207, {from:DaoAdmin} ), "Minimum participation percentage must be between 1 and 100");   
                });
                
                it("setVote should revert if the caller is not the owner(member)", async function() { 
                    await expectRevert(MyNewVotingInstance.setVote(3, 33, 20, {from:Member1} ), "Ownable: caller is not the owner");   
                });
    
                it("setVote should revert if the caller is not the owner(notMmember)", async function() { 
                    await expectRevert(MyNewVotingInstance.setVote(3, 33, 20, {from:NotMember} ), "Ownable: caller is not the owner");   
                });
            });

            describe("setPredeterminedProposal function", function() {

                it("should revert if the provided predetermindedProposal is empty", async function () {
                    const proposal = "";
                    await expectRevert(MyNewVotingInstance.setPredeterminedProposal(proposal, { from: DaoAdmin }), "Proposal cannot be empty");
                });  

                it("should set the predetermined proposal correctly", async function() {
                    const predeterminedProposal = "proposal1";
                    await MyNewVotingInstance.setPredeterminedProposal(predeterminedProposal, { from: DaoAdmin });
                    const currentPredeterminedProposal = await MyNewVotingInstance.getPredeterminedProposal({ from: DaoAdmin });
                    expect(currentPredeterminedProposal).to.equal(predeterminedProposal);
                });
 
                it("should emit PredeterminedProposalSet event with the correct parameters", async function() {
                    const predeterminedProposal = "proposal";
                    const tx = await MyNewVotingInstance.setPredeterminedProposal(predeterminedProposal, { from: DaoAdmin });
                    expectEvent(tx, "PredeterminedProposalSet", {predeterminedProposal: predeterminedProposal});
                });
                
                it("setPredeterminedProposal should revert if wrong workflowstatus", async function() { 
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await expectRevert(MyNewVotingInstance.setPredeterminedProposal("proposal", {from:DaoAdmin} ), "The workflow status must be ProposalSet");   
                });

                it("setVote should revert if wrong workflowstatus", async function() { 
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.endVotingSession({from: DaoAdmin});
                    await expectRevert(MyNewVotingInstance.setPredeterminedProposal("proposal", {from:DaoAdmin} ), "The workflow status must be ProposalSet");   
                });

                it("setPredeterminedProposal should revert if the caller is not the owner(member)", async function() { 
                    await expectRevert(MyNewVotingInstance.setPredeterminedProposal("proposal", {from:Member1} ), "Ownable: caller is not the owner");   
                });
    
                it("setPredeterminedProposal should revert if the caller is not the owner(notMmember)", async function() { 
                    await expectRevert(MyNewVotingInstance.setPredeterminedProposal("porposal", {from:NotMember} ), "Ownable: caller is not the owner");   
                });
            });

            describe("isProposalAccepted function", function() {

                it("should return true if the proposal is accepted", async function() {
                    const predeterminedProposal = "proposal1";
                    await MyNewVotingInstance.setPredeterminedProposal(predeterminedProposal, { from: DaoAdmin });
                    await MyNewVotingInstance.setVote(3, 33, 20, {from: DaoAdmin});
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.voteForProposal(true, {from: Member1});
                    await MyNewVotingInstance.voteForProposal(false, {from: Member2});
                    await MyNewVotingInstance.voteForProposal(true, {from: Member3});
                    await MyNewVotingInstance.endVotingSession({from: DaoAdmin});
                    const result = await MyNewVotingInstance.isProposalAccepted({ from: DaoAdmin });
                    expectEvent(result, "ProposalResult", {proposalResult: true});
                });

                it("should return false if the proposal is rejected", async function() {
                    const predeterminedProposal = "proposal1";
                    await MyNewVotingInstance.setPredeterminedProposal(predeterminedProposal, { from: DaoAdmin });
                    await MyNewVotingInstance.setVote(3, 33, 20, {from: DaoAdmin});
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.voteForProposal(false, {from: Member1});
                    await MyNewVotingInstance.voteForProposal(false, {from: Member2});
                    await MyNewVotingInstance.voteForProposal(true, {from: Member3});
                    await MyNewVotingInstance.endVotingSession({from: DaoAdmin});
                    const result = await MyNewVotingInstance.isProposalAccepted({ from: DaoAdmin });
                    expectEvent(result, "ProposalResult", {proposalResult: false});
                });

                it("should revert if the quorum is not reatched", async function() {
                    const predeterminedProposal = "proposal1";
                    await MyNewVotingInstance.setPredeterminedProposal(predeterminedProposal, { from: DaoAdmin });
                    await MyNewVotingInstance.setVote(5, 90, 50, {from: DaoAdmin});
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.voteForProposal(false, {from: Member1});
                    await MyNewVotingInstance.voteForProposal(false, {from: Member2});
                    await MyNewVotingInstance.endVotingSession({from: DaoAdmin});
                    await expectRevert(MyNewVotingInstance.isProposalAccepted({ from: DaoAdmin }), "Minimum participation and/or quorum not reached");
                });

                it("should revert if the minParticipation is not reatched", async function() {
                    const predeterminedProposal = "proposal1";
                    await MyNewVotingInstance.setPredeterminedProposal(predeterminedProposal, { from: DaoAdmin });
                    await MyNewVotingInstance.setVote(5, 50, 90, {from: DaoAdmin});
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.voteForProposal(false, {from: Member1});
                    await MyNewVotingInstance.voteForProposal(false, {from: Member2});
                    await MyNewVotingInstance.endVotingSession({from: DaoAdmin});
                    await expectRevert(MyNewVotingInstance.isProposalAccepted({ from: DaoAdmin }), "Minimum participation and/or quorum not reached");
                });

                it("isProposalAccepted should revert if wrong workflowstatus", async function() { 
                    await expectRevert(MyNewVotingInstance.isProposalAccepted( {from:DaoAdmin} ), "Voting session is not ended yet");   
                });

                it("isProposalAccepted should revert if wrong workflowstatus", async function() { 
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await expectRevert(MyNewVotingInstance.isProposalAccepted( {from:DaoAdmin} ), "Voting session is not ended yet");   
                });

                it("isProposalAccepted should revert if the caller is not the owner(member)", async function() { 
                    await expectRevert(MyNewVotingInstance.isProposalAccepted( {from:Member1} ), "Ownable: caller is not the owner");   
                });
    
                it("isProposalAccepted should revert if the caller is not the owner(notMmember)", async function() { 
                    await expectRevert(MyNewVotingInstance.isProposalAccepted( {from:NotMember} ), "Ownable: caller is not the owner");   
                });
            });

            describe("voteForProposal function", function() {

                it("voteForProposal should revert if member already voted", async function() { 
                    await MyNewVotingInstance.setPredeterminedProposal("proposal", { from: DaoAdmin });
                    await MyNewVotingInstance.setVote(5, 50, 90, {from: DaoAdmin});
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.voteForProposal(false, {from: Member1});
                    await expectRevert(MyNewVotingInstance.voteForProposal (true, {from:Member1} ), "You have already voted");   
                });

                it("voteForProposal should emit an event Voted", async function() { 
                    await MyNewVotingInstance.setPredeterminedProposal("proposal", { from: DaoAdmin });
                    await MyNewVotingInstance.setVote(5, 50, 90, {from: DaoAdmin});
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    const vote = await MyNewVotingInstance.voteForProposal(false, {from: Member1});
                    expectEvent(vote, "Voted", ({_voter: Member1, _voteYes: false, hasVoted: true}));   
                });

                it("voteForProposal should revert if wrong workflowstatus", async function() { 
                    await expectRevert(MyNewVotingInstance.voteForProposal (true, {from:Member1} ), "Voting session havent started yet");   
                });

                it("voteForProposal should revert if wrong workflowstatus", async function() { 
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.endVotingSession({from: DaoAdmin});
                    await expectRevert(MyNewVotingInstance.voteForProposal (true, {from:Member1} ), "Voting session havent started yet");   
                });

                it("voteForProposal should revert if the caller is not a voter", async function() { 
                    await expectRevert(MyNewVotingInstance.voteForProposal(true, {from:Member4} ), "You have to hold a Dao NFT to be able to vote");   
                });
    
                it("voteForProposal should revert if the caller is not a voter", async function() { 
                    await expectRevert(MyNewVotingInstance.voteForProposal(false, {from:NotMember} ), "You have to hold a Dao NFT to be able to vote");   
                });
            });

            describe("getPredeterminedProposal function", function() {

                it("should set the predetermined proposal correctly", async function() {
                    const predeterminedProposal = "proposal";
                    await MyNewVotingInstance.setPredeterminedProposal(predeterminedProposal, { from: DaoAdmin });
                    const currentPredeterminedProposal = await MyNewVotingInstance.getPredeterminedProposal({ from: DaoAdmin });
                    expect(currentPredeterminedProposal).to.equal(predeterminedProposal);
                });

                it("should return an empty string if no predetermined proposal is set", async function() {
                    const currentPredeterminedProposal = await MyNewVotingInstance.getPredeterminedProposal({ from: DaoAdmin });
                    expect(currentPredeterminedProposal).to.equal("");
                });
                
                it("getPredeterminedProposal should revert if the caller is not a voter (member without nft)", async function() { 
                    await expectRevert(MyNewVotingInstance.getPredeterminedProposal( {from:Member4} ), "You have to hold a Dao NFT to be able to vote");   
                });
    
                it("getPredeterminedProposal should revert if the caller is not a voter (not member)", async function() { 
                    await expectRevert(MyNewVotingInstance.getPredeterminedProposal( {from:NotMember} ), "You have to hold a Dao NFT to be able to vote");   
                });
            });

            describe("getWorkflowStatus function", function() {

                it("should return the good workflowstatus (0)", async function() {
                    const status = await MyNewVotingInstance.getWorkflowStatus({from: DaoAdmin});
                    expect(status).to.be.bignumber.equal(new BN(0));
                });

                it("should return the good workflowstatus (1)", async function() {
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    const status = await MyNewVotingInstance.getWorkflowStatus({from: DaoAdmin});
                    expect(status).to.be.bignumber.equal(new BN(1));
                });

                it("should return the good workflowstatus (2)", async function() {
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.endVotingSession({from: DaoAdmin});
                    const status = await MyNewVotingInstance.getWorkflowStatus({from: DaoAdmin});
                    expect(status).to.be.bignumber.equal(new BN(2));
                });

                it("getWorkflowStatus should revert if the caller is not a voter", async function() { 
                    await expectRevert(MyNewVotingInstance.getWorkflowStatus( {from:Member4} ), "You have to hold a Dao NFT to be able to vote");   
                });
    
                it("getWorkflowStatus should revert if the caller is not a voter", async function() { 
                    await expectRevert(MyNewVotingInstance.getWorkflowStatus( {from:NotMember} ), "You have to hold a Dao NFT to be able to vote");   
                });
            });

            describe("getResult function", function() {

                it("should return correct result after some members voted", async function() {
                    await MyNewVotingInstance.setPredeterminedProposal("proposal", { from: DaoAdmin });
                    await MyNewVotingInstance.setVote(3, 33, 33, {from: DaoAdmin});
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.voteForProposal(false, {from: Member1});
                    await MyNewVotingInstance.voteForProposal(true, {from: Member2});
                    await MyNewVotingInstance.voteForProposal(false, {from: Member3});
                    await MyNewVotingInstance.endVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.isProposalAccepted( {from:DaoAdmin} );
                    const result = await MyNewVotingInstance.getResult({from: Member1});
                    expect(result).to.be.equal(false);
                });

                it("getResult should revert if the caller is not a voter", async function() { 
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.endVotingSession({from: DaoAdmin});
                    await expectRevert(MyNewVotingInstance.getResult( {from:Member1} ), "Result has not been checked yet");   
                });

                it("getResult should revert if wrong workflowstatus", async function() { 
                    await expectRevert(MyNewVotingInstance.getResult ( {from:Member1} ), "Voting session is not ended yet");   
                });

                it("getResult should revert if wrong workflowstatus", async function() { 
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await expectRevert(MyNewVotingInstance.getResult ( {from:Member1} ), "Voting session is not ended yet");   
                });

                it("getResult should revert if the caller is not a voter", async function() { 
                    await expectRevert(MyNewVotingInstance.getResult( {from:Member4} ), "You have to hold a Dao NFT to be able to vote");   
                });
    
                it("getResult should revert if the caller is not a voter", async function() { 
                    await expectRevert(MyNewVotingInstance.getResult( {from:NotMember} ), "You have to hold a Dao NFT to be able to vote");   
                });
            });

            describe("checkRules function", function() {

                it("should return true if the rules are met after voting", async function() {
                    await MyNewVotingInstance.setPredeterminedProposal("proposal", { from: DaoAdmin });
                    await MyNewVotingInstance.setVote(3, 50, 90, {from: DaoAdmin});
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.voteForProposal(true, {from: Member1});
                    await MyNewVotingInstance.voteForProposal(true, {from: Member2});
                    await MyNewVotingInstance.voteForProposal(true, {from: Member3});
                    await MyNewVotingInstance.endVotingSession({from: DaoAdmin});
                    const rules = await MyNewVotingInstance.checkRules({from: Member1});
                    expect(rules).to.be.equal(true);
                });

                it("should return false if the rules are met after voting (quorum)", async function() {
                    await MyNewVotingInstance.setPredeterminedProposal("proposal", { from: DaoAdmin });
                    await MyNewVotingInstance.setVote(10, 50, 10, {from: DaoAdmin});
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.voteForProposal(true, {from: Member1});
                    await MyNewVotingInstance.voteForProposal(true, {from: Member2});
                    await MyNewVotingInstance.voteForProposal(true, {from: Member3});
                    await MyNewVotingInstance.endVotingSession({from: DaoAdmin});
                    const rules = await MyNewVotingInstance.checkRules({from: Member1});
                    expect(rules).to.be.equal(false);
                });

                it("should return false if the rules are met after voting (minParticipation)", async function() {
                    await MyNewVotingInstance.setPredeterminedProposal("proposal", { from: DaoAdmin });
                    await MyNewVotingInstance.setVote(10, 10, 50, {from: DaoAdmin});
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.voteForProposal(true, {from: Member1});
                    await MyNewVotingInstance.voteForProposal(true, {from: Member2});
                    await MyNewVotingInstance.voteForProposal(true, {from: Member3});
                    await MyNewVotingInstance.endVotingSession({from: DaoAdmin});
                    const rules = await MyNewVotingInstance.checkRules({from: Member1});
                    expect(rules).to.be.equal(false);
                });
            
                it("checkRules should revert if wrong workflowstatus", async function() { 
                    await expectRevert(MyNewVotingInstance.checkRules ( {from:Member1} ), "Voting session is not ended yet");   
                });

                it("checkRules should revert if wrong workflowstatus", async function() { 
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await expectRevert(MyNewVotingInstance.checkRules ( {from:Member1} ), "Voting session is not ended yet");   
                });

                it("checkRules should revert if the caller is not a voter", async function() { 
                    await expectRevert(MyNewVotingInstance.checkRules( {from:Member4} ), "You have to hold a Dao NFT to be able to vote");   
                });
    
                it("checkRules should revert if the caller is not a voter", async function() { 
                    await expectRevert(MyNewVotingInstance.checkRules( {from:NotMember} ), "You have to hold a Dao NFT to be able to vote");   
                });
            });

            describe("startVotingSession function", function() {

                it("startVotingSession event", async function() { 
                    const status = await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await expectEvent(status, "WorkflowStatusChange",((status.ProposalSet,status.VotingSessionStarted)));   
                });

                it("startVotingSession should revert if wrong workflowstatus", async function() { 
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await expectRevert(MyNewVotingInstance.startVotingSession ( {from:DaoAdmin} ), "Wrong WorkflowStatus");   
                });

                it("startVotingSession should revert if wrong workflowstatus", async function() { 
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.endVotingSession({from: DaoAdmin});
                    await expectRevert(MyNewVotingInstance.startVotingSession ( {from:DaoAdmin} ), "Wrong WorkflowStatus");   
                });

                it("startVotingSession should revert if the caller is not the owner(member)", async function() { 
                    await expectRevert(MyNewVotingInstance.startVotingSession( {from:Member1} ), "Ownable: caller is not the owner");   
                });
    
                it("startVotingSession should revert if the caller is not the owner(notMmember)", async function() { 
                    await expectRevert(MyNewVotingInstance.startVotingSession( {from:NotMember} ), "Ownable: caller is not the owner");   
                });
            });

            describe("endVotingSession function", function() {

                it("endVotingSession event", async function() { 
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    const status = await MyNewVotingInstance.endVotingSession({from: DaoAdmin});
                    await expectEvent(status, "WorkflowStatusChange",((status.VotingSessionStarted,status.VotingSessionEnded)));   
                });

                it("endVotingSession should revert if wrong workflowstatus", async function() { 
                    await expectRevert(MyNewVotingInstance.endVotingSession ( {from:DaoAdmin} ), "Wrong WorkflowStatus");   
                });

                it("endVotingSession should revert if wrong workflowstatus", async function() { 
                    await MyNewVotingInstance.startVotingSession({from: DaoAdmin});
                    await MyNewVotingInstance.endVotingSession({from: DaoAdmin});
                    await expectRevert(MyNewVotingInstance.endVotingSession ( {from:DaoAdmin} ), "Wrong WorkflowStatus");   
                });

                it("endVotingSession should revert if the caller is not the owner(member)", async function() { 
                    await expectRevert(MyNewVotingInstance.endVotingSession( {from:Member1} ), "Ownable: caller is not the owner");   
                });
    
                it("endVotingSession should revert if the caller is not the owner(notMmember)", async function() { 
                    await expectRevert(MyNewVotingInstance.endVotingSession( {from:NotMember} ), "Ownable: caller is not the owner");   
                });
            });
    }); 
});

                    
                    