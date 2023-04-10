import React from 'react';
import { Button, Text, Box, VStack, Flex, Input, FormControl, FormLabel, InputGroup,
  InputLeftAddon, HStack} from '@chakra-ui/react'; 
import { Link } from 'react-router-dom';

import { useState, useEffect, useContext } from "react";

import { useEth } from "../../contexts/EthContext";
import EthContext from '../../contexts/EthContext';
import Web3 from "web3";

const YourDao = ({daoAddress, daoName, daoMemberName, setDaoMemberName, daoMemberAddress, 
  setDaoMemberAddress, result, setResult, startDate, setStartDate, endDate, setEndDate, tokenAddress, setTokenAddress,
   }) => { //tokenAddress, setTokenAddress removeMemberAddress, setRemoveMemberAddress, votingAddress, setVotingAddress

  const {
    state: { accounts, contract2, contract3, txhash, web3 }, //contract, artifact, artifact2, contract3, contract4
  } = useEth();

  //const { state } = useContext(EthContext);
  //const { contract3 } = state;
  //const [isOwner, setIsOwner] = useState(false);
  //const [inputValue, setInputValue] = useState("");

  // MEMBERS & SNAPSHOT 

  const [addedMembers, setAddedMembers] = useState([]);
  const [removedMembers, setRemovedMembers] = useState([]);
  const [snapshot, setSnapshot] = useState([]);
  const [removedMembersList, setRemovedMembersList] = useState([]);

  // TOKEN

  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [createdTokens, setCreatedTokens] = useState([]);

  const [mintAddress, setMintAddress] = useState("");
  const [burnTokenId, setBurnTokenId] = useState("");
  //const [isAddress, setisAddress] = useState(false);

  // VOTE

  const [createdVotes, setCreatedVotes] = useState([]);
  const [votingContract, setVotingContract] = useState([]);
  
  // CONTRAT NEWDAO

  const newDaoInstance = contract2.clone();
  newDaoInstance.options.address = daoAddress;

  // CONTRAT NEWTOKEN

  const newTokenInstance = contract3.clone();
  newTokenInstance.options.address = contract3.options.address;

  //newTokenInstance.options.address = tokenAddress;
  const isAddress = (address) => {
    return Web3.utils.isAddress(address);
  };
  
  async function handleMint() {
    if (!isAddress(mintAddress)) {
      alert("L'adresse n'est pas valide.");
      return;
    }
    try {
      await newTokenInstance.methods.safeMint(mintAddress).send({from: accounts[0]}); //const tx =
      alert('NFT minté avec succès !');
    } catch (error) {
      console.error('Erreur lors du mint de NFT : ', error);
    }
  }

  async function handleBurn() {
    try {
      await newTokenInstance.methods.burn(burnTokenId).send({from: accounts[0]}); //const tx =
      alert('NFT burn avec succès !');
    } catch (error) {
      console.error('Erreur lors du burn de NFT : ', error);
    }
  }

  



  // CHECK OWNER

  /*useEffect(() => {
    async function getOwner() {
      if (newDaoInstance) {
        // On check si l'account courant est l'owner du contract
        const owner = await newDaoInstance.methods.owner().call({ from: accounts[0] }); //contract2
        accounts[0] === owner ? setIsOwner(true) : setIsOwner(false);
      }
    }
    getOwner();
  }, [accounts, contract2, artifact2, daoAddress]);*/ // + token et voting address

  // ADDMEMBER

  async function addMember() {
    try {
      await newDaoInstance.methods.addMember(daoMemberAddress, daoMemberName).send({from: accounts[0]}); //const tx =
      alert('Membre ajouté avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre : ', error);
    }
  }

  useEffect(() => {
    if (!newDaoInstance) return;
  
    async function fetchPastEvents() {
      const pastEvents = await newDaoInstance.getPastEvents('MemberAdded', {
        fromBlock: 0,
        toBlock: 'latest',
      });
  
      const pastMembers = pastEvents.map(event => {
        return {
          address: event.returnValues.memberAddress,
          name: event.returnValues.memberName,
        };
      });
  
      setAddedMembers(pastMembers);
    }
  
    fetchPastEvents();
  
    const subscription = newDaoInstance.events.MemberAdded()
      .on('data', (event) => {
        const newMember = {
          address: event.returnValues.memberAddress,
          name: event.returnValues.memberName,
        };
  
        setAddedMembers((prevMembers) => [...prevMembers, newMember]);
      })
      .on('changed', (changed) => console.log(changed))
      .on('error', (err) => console.log(err))
      .on('connected', (str) => console.log(str));
  
    return () => subscription.unsubscribe();
  }, []);  //newDaoInstance, setAddedMembers

  /*const handleChange = (evt) => {
    setDaoMemberAddress(evt.currentTarget.value);
    setDaoMemberName(evt.currentTarget.value);
  };*/

  // REMOVE MEMBER

  const removeMember = async () => {
    try {
      await newDaoInstance.methods.removeMember(removedMembers).send({from: accounts[0]}); //const result = 
      alert('Membre retiré avec succès !');
    } catch (error) {
      console.error('Erreur lors du retrait du membre:', error);
    }
  };
  
  useEffect(() => {
    if (!newDaoInstance) return;
  
    async function fetchPastEvents() {
      const pastEvents = await newDaoInstance.getPastEvents('MemberRemoved', {
        fromBlock: 0,
        toBlock: 'latest',
      });
  
      const pastRemovedMembers = pastEvents.map(event => {
        return {
          address: event.returnValues.memberAddress,
        };
      });
  
      setRemovedMembersList(pastRemovedMembers);
    }
  
    fetchPastEvents();
  
    const subscription = newDaoInstance.events.MemberRemoved()
      .on('data', (event) => {
        const removedMember = {
          address: event.returnValues.memberAddress,
        };
  
        setRemovedMembersList((prevRemovedMembers) => [...prevRemovedMembers, removedMember]);
      })
      .on('changed', (changed) => console.log(changed))
      .on('error', (err) => console.log(err))
      .on('connected', (str) => console.log(str));
  
    return () => subscription.unsubscribe();
  }, []); //newDaoInstance, setRemovedMembersList
  

  // SNAPSHOTRESULT

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await newDaoInstance.methods.snapshotResult(result, startDate, endDate).send({from: accounts[0]}); //const tx =
      alert('Résultats ajoutés avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'ajout des resulats : ', error);
    }
  };

  useEffect(() => {
    if (!newDaoInstance) return;
  
    async function fetchPastEvents() {
      const pastEvents = await newDaoInstance.getPastEvents('SnapshotResult', {
        fromBlock: 0,
        toBlock: 'latest',
      });
  
      const pastMembers = pastEvents.map(event => {
        return {
          result: event.returnValues.result,
          startDate: event.returnValues.startDate,
          endDate: event.returnValues.endDate,
        };
      });
  
      setSnapshot(pastMembers);
    }
  
    fetchPastEvents();
  
    const subscription = newDaoInstance.events.SnapshotResult()
      .on('data', (event) => {
        const newResult = {
          result: event.returnValues.result,
          startDate: event.returnValues.startDate,
          endDate: event.returnValues.endDate,
        };
  
        setAddedMembers((prevResult) => [...prevResult, newResult]); //setDaoMembers?
      })
      .on('changed', (changed) => console.log(changed))
      .on('error', (err) => console.log(err))
      .on('connected', (str) => console.log(str));
  
    return () => subscription.unsubscribe();
  }, []); //newDaoInstance, setSnapshot
  
  // SETTOKEN

  async function createToken() {
    if (!tokenName || !tokenSymbol) {
      alert('Veuillez renseigner le nom et le symbole du token.');
      return;
    }

    try {
      await newDaoInstance.methods.createToken(tokenName, tokenSymbol).send({ from: accounts[0] });

      alert('Token créé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création du token : ', error);
    }
  }

  useEffect(() => {
    if (!newDaoInstance) return;

    const deployTx =  web3.eth.getTransaction(txhash);
      const fromBlock = deployTx ? deployTx.blockNumber : "earliest";

    async function fetchEvents() {
      try {
        const pastEvents = await newDaoInstance.getPastEvents('TokenCreated', {
          fromBlock: 0,
          toBlock: 'latest',
        });

        const pastTokenCreated = pastEvents.map(event => {
          return {
            address: event.returnValues.tokenAddress,
            name: event.returnValues.tokenName,
            symbol: event.returnValues.tokenSymbol,
          };
        });

        await newDaoInstance.events.TokenCreated({ fromBlock })
        .on("data", (event) => {
        let tokenEventAddress = event.returnValues.tokenAddress;
        setTokenAddress(tokenEventAddress);
        console.log(tokenEventAddress);
        })
        .on("changed", (changed) => console.log(changed))
        .on("error", (err) => console.log(err))
        .on("connected", (str) => console.log(str));

        setCreatedTokens(pastTokenCreated);
        
      } catch (error) {
        console.error('Erreur lors de la récupération des événements : ', error);
      }
    }

    fetchEvents();
  }, []); // OU vIDE?? [newDaoInstance, setTokenAddress, txhash, web3.eth]


 // SETVOTING

 async function createVote() {
  
  try {
    await newDaoInstance.methods.createVoting().send({ from: accounts[0] });
    alert('Vote créé avec succès !');
  } catch (error) {
    console.error('Erreur lors de la création du vote : ', error);
  }
}
useEffect(() => {
  if (!newDaoInstance) return;
  const deployTx =  web3.eth.getTransaction(txhash);
  const fromBlock = deployTx ? deployTx.blockNumber : "earliest";

  async function fetchEvents() {
    try {
      const pastEvents = await newDaoInstance.getPastEvents('VotingCreated', {
        fromBlock: 0,
        toBlock: 'latest',
      });

      const pastVoteCreated = pastEvents.map(event => {
        return {
          address: event.returnValues.votingContract,
        };
      });

      await newDaoInstance.events.VotingCreated({ fromBlock })
        .on("data", (event) => {
        let votingEventAddress = event.returnValues.votingContract;
        setVotingContract(votingEventAddress);
        console.log(votingEventAddress);
        })
        .on("changed", (changed) => console.log(changed))
        .on("error", (err) => console.log(err))
        .on("connected", (str) => console.log(str));

        setCreatedVotes(pastVoteCreated);

      } catch (error) {
        console.error('Erreur lors de la récupération des événements : ', error);
      }
    }

  fetchEvents();
}, []); //[newDaoInstance, setVotingAddress, txhash, web3.eth]



  return (
    <div>
    <Link to="/">
      <Button colorScheme="teal" variant="outline" size="md" mt={7} ml={7}>
        Retour à l'accueil
      </Button>
    </Link>

    <Text color="teal.500" fontWeight="bold" mt={5} ml={7}>
      Nom de votre DAO : {daoName}
      <br />
      <br />
      Addresse de votre DAO : {daoAddress}
    </Text>
    <Flex
      direction="row"
      alignItems="flex-start"
      justifyContent="flex-start"
      minHeight="100vh"
    >
      {/* Ajouter / Retirer un membre */}
      <Box mt={7} ml={7} w="25%"  borderWidth="1px"
        borderColor="green.500"
        borderRadius="md"
        p={3}>
        <Text fontSize="2xl" color="green.700" mb={4}>
          Ajouter un membre :
        </Text>
        <VStack spacing={4} alignItems="flex-start">
          <input
            type="text"
            placeholder="Adresse du membre"
            value={daoMemberAddress}
            onChange={(e) => setDaoMemberAddress(e.target.value)}
            width="75%"
          />
          <input
            type="text"
            placeholder="Nom du membre"
            value={daoMemberName}
            onChange={(e) => setDaoMemberName(e.target.value)}
            width="75%"
          />
        </VStack>
        <Button colorScheme="teal" type="submit" mt={7} onClick={addMember}>
          Ajouter un membre
        </Button>
        <Text color="teal.500" fontWeight="bold" mt={5}>
          Liste des membres ajoutés :
        </Text>
        {addedMembers.map((member, index) => (
          <Text color="teal.500" key={index} mt={2} ml={3}>
            Membre {index + 1}: {member.name} ({member.address})
          </Text>
        ))}
        <Text fontSize="2xl" color="red.700" mb={4} mt={8}>
          Retirer un membre :
        </Text>
        <VStack spacing={4} alignItems="flex-start">
          <input
            type="text"
            placeholder="Adresse du membre"
            value={removedMembers}
            onChange={(e) => setRemovedMembers(e.target.value)}
            width="75%"
          />
        </VStack>
        <Button colorScheme="red" type="submit" mt={7} onClick={removeMember}>
          Retirer un membre
        </Button>
        <Text color="red.500" fontWeight="bold" mt={5}>
          Liste des membres retirés :
        </Text>
        {removedMembersList.map((member, index) => (
          <Text color="red.500" key={index} mt={2} ml={3}>
            Membre retiré {index + 1}: {member.address}
          </Text>
        ))}
      </Box>

          {/* Snapshot */}

      <Box mt={7} ml={16} w="25%"
        borderWidth="1px"
        borderColor="green.500"
        borderRadius="md"
        p={3}>
          <Text fontSize="2xl" color="green.700" mb={4}>
            Organisation d'une session de vote :
          </Text>
          <form onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel htmlFor="result"></FormLabel>
              <Input
                id="result"
                type="text"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="Proposition sélectionnée par snapshot"
                width="75%"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="startDate">Début du vote:</FormLabel>
              <Input
                id="startDate"
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Entrez les détails de début de vote"
                width="75%"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="endDate">Fin du vote:</FormLabel>
              <Input
                id="endDate"
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Entrez les détails de fin de vote"
                width="75%"
              />
            </FormControl>

            <Button colorScheme="teal" type="submit" mt={4}>
              Soumettre
            </Button>
            <Text color="teal.500" fontWeight="bold" mt={5}>
              Propositions selectionées et sessions de votes :
            </Text>
            {snapshot.map((result, index) => (
              <Text color="teal.500" key={index} mt={2} ml={3}>
                Snapshot {index + 1}: {result.result} <br />
                Début du vote :{result.startDate} <br />
                Fin du vote : {result.endDate}
              </Text>
            ))}
          </form>
        </Box>

        {/* Création de token et vote */}

        <Box mt={7} ml={16} w="25%" borderWidth="1px"
        borderColor="green.500"
        borderRadius="md"
        p={3}>
          <Text fontSize="2xl" color="green.700" mb={4}>
          Création de token de vote :
        </Text>
          <Text mb={3}>Nom du token :</Text>
          <Input
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="Entrez le nom du token"
            size="md"
            mb={3}
            width="75%"
          />

          <Text mb={3}>Symbole du token :</Text>
          <Input
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            placeholder="Entrez le symbole du token"
            size="md"
            mb={3}
            width="75%"
          />

          <Button colorScheme="teal" onClick={createToken}>
            Créer un token
          </Button>

          <Text color="teal.500" fontWeight="bold" mt={5}>
            Détails du token crée :
          </Text>
          {createdTokens.map((token, index) => (
            <Text color="teal.500" key={index} mt={2} ml={3}>
              Token {index + 1}: {tokenName} ({tokenSymbol}) <br/> Adresse : {token.address} {/*marche plus event tableau dependance*/}
            </Text>
          ))}
          {tokenAddress && (
            <Text color="teal.500" fontWeight="bold" mt={5} ml={7}>      {/* ENLEVER NON SI PAS EVENT//////////////////////////////*/}
              Adresse du token : {tokenAddress}
            </Text>
          )}
          <Text fontSize="2xl" color="green.700" mb={4} mt={8}>
            Création d'une session de vote :
          </Text>
          <Button colorScheme="teal" onClick={createVote}>
            Créer un vote
          </Button>

          <Text color="teal.500" fontWeight="bold" mt={5}>
            Liste des votes créés :
          </Text>
          {createdVotes.map((vote, index) => (
            <Text color="teal.500" key={index} mt={2} ml={3}>
              Vote {index + 1}: Adresse : {vote.address} <br />
              Event: {votingContract}                                     {/* ENLEVER NON SI PAS EVENT//////////////////////////////*/}
            </Text>
          ))}
          

          <Box
      borderWidth={1}
      borderRadius="lg"
      p={4}
      mt={4}
      textAlign="right"
      borderColor="gray.200"
    >
      <VStack spacing={4}>
        <Text fontSize="xl">Mint et Burn des Tokens</Text>

        <HStack>
          <InputGroup>
            <InputLeftAddon children="Adresse" />
            <Input
              type="text"
              placeholder="Adresse du membre"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
            />
          </InputGroup>
          <Button colorScheme="teal" onClick={handleMint}>
            Mint Token
          </Button>
        </HStack>

        <HStack>
          <InputGroup>
            <InputLeftAddon children="Token ID" />
            <Input
              type="number"
              placeholder="Token ID à burn"
              value={burnTokenId}
              onChange={(e) => setBurnTokenId(e.target.value)}
            />
          </InputGroup>
          <Button colorScheme="red" onClick={handleBurn}>
            Burn Token
          </Button>
        </HStack>
      </VStack>
    </Box>

        </Box>
      </Flex>
    </div>
  
  );
};

export default YourDao; 


// DER FONCTIONEL OK

/* <div>
    <Link to="/">
      <Button colorScheme="teal" variant="outline" size="md" mt={7} ml={7}>
        Retour à l'accueil
      </Button>
    </Link>

    <Text color="teal.500" fontWeight="bold" mt={5} ml={7}>
      Nom de votre DAO : {daoName}
      <br />
      <br />
      Addresse de la DAO : {daoAddress}
    </Text>
    <Flex
      direction="row"
      alignItems="flex-start"
      justifyContent="flex-start"
      minHeight="100vh"
    >
      <Box mt={7} ml={7} w="25%">
        <Text fontSize="2xl" color="green.700" mb={4}>
          Ajouter un membre :
        </Text>
        <VStack spacing={4} alignItems="flex-start">
          <input
            type="text"
            placeholder="Adresse du membre"
            value={daoMemberAddress}
            onChange={(e) => setDaoMemberAddress(e.target.value)}
            width="30"
          />
          <input
            type="text"
            placeholder="Nom du membre"
            value={daoMemberName}
            onChange={(e) => setDaoMemberName(e.target.value)}
          />
        </VStack>
        <Button colorScheme="teal" type="submit" mt={7} onClick={addMember}>
          Ajouter un membre
        </Button>
        <Text color="teal.500" fontWeight="bold" mt={5}>
          Liste des membres ajoutés :
        </Text>
        {addedMembers.map((member, index) => (
          <Text color="teal.500" key={index} mt={2} ml={3}>
            Membre {index + 1}: {member.name} ({member.address})
          </Text>
        ))}
        <Text fontSize="2xl" color="red.700" mb={4} mt={8}>
          Retirer un membre :
        </Text>
        <VStack spacing={4} alignItems="flex-start">
          <input
            type="text"
            placeholder="Adresse du membre"
            value={removedMembers}
            onChange={(e) => setRemovedMembers(e.target.value)}
            width="30"
          />
        </VStack>
        <Button colorScheme="red" type="submit" mt={7} onClick={removeMember}>
          Retirer un membre
        </Button>
        <Text color="red.500" fontWeight="bold" mt={5}>
          Liste des membres retirés :
        </Text>
        {removedMembersList.map((member, index) => (
          <Text color="red.500" key={index} mt={2} ml={3}>
            Membre retiré {index + 1}: {member.address}
          </Text>
        ))}
      </Box>

      <Box mt={7} ml={16}>
        <Text fontSize="2xl" color="green.700" mb={4}>
          Résultats du snapshot :
        </Text>
        <form onSubmit={handleSubmit}>
          <FormControl>
            <FormLabel htmlFor="result"></FormLabel>
            <Input
              id="result"
              type="text"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Entrez le résultat"
              width="100%"
              />
              </FormControl>
    
              <FormControl>
                <FormLabel htmlFor="startDate">Date de début du vote:</FormLabel>
                <Input
                  id="startDate"
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Entrez la date de début"
                />
              </FormControl>
    
              <FormControl>
                <FormLabel htmlFor="endDate">Date de fin du vote:</FormLabel>
                <Input
                  id="endDate"
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Entrez la date de fin"
                />
              </FormControl>
    
              <Button colorScheme="teal" type="submit" mt={4}>
                Soumettre
              </Button>
              <Text color="teal.500" fontWeight="bold" mt={5}>
                Liste des snapshot ajoutés :
              </Text>
              {snapshot.map((result, index) => (
                <Text color="teal.500" key={index} mt={2} ml={3}>
                  Snapshot {index + 1}: {result.result} <br />
                  Début du vote :{result.startDate} <br />
                  Fin du vote : {result.endDate}
                </Text>
              ))}
            </form>
            <Text mb={3}>Nom du token :</Text>
            <Input
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="Entrez le nom du token"
              size="md"
              mb={3}
            />
    
            <Text mb={3}>Symbole du token :</Text>
            <Input
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              placeholder="Entrez le symbole du token"
              size="md"
              mb={3}
            />
    
            <Button colorScheme="teal" onClick={createToken}>
              Créer un token
            </Button>
    
            <Text color="teal.500" fontWeight="bold" mt={5}>
              Liste des tokens créés :
            </Text>
            {createdTokens.map((token, index) => (
              <Text color="teal.500" key={index} mt={2} ml={3}>
                Token {index + 1}: {tokenName} ({tokenSymbol}) - Adresse : {token.address}
              </Text>
            ))}
            {tokenAddress && (
              <Text color="teal.500" fontWeight="bold" mt={5} ml={7}>
                Adresse du token : {tokenAddress}
              </Text>
            )}
    
            <Text fontSize="2xl" color="green.700" mb={4} mt={8}>
              Créer un vote :
            </Text>
            <Button colorScheme="teal" onClick={createVote}>
              Créer un vote
            </Button>
    
            <Text color="teal.500" fontWeight="bold" mt={5}>
              Liste des votes créés :
            </Text>
            {createdVotes.map((vote, index) => (
              <Text color="teal.500" key={index} mt={2} ml={3}>
                Vote {index + 1}: Adresse : {vote.address} <br />
                Event: {votingContract}
              </Text>
            ))}
          </Box>
        </Flex>
      </div>
  */

// DERDER TTES FCTION OK /* <div style={{ position: "relative", minHeight: "100vh" }}></div>*/

/*<div style={{ position: 'relative', minHeight: '100vh' }}>
<Link to="/">
  <Button colorScheme="teal" variant="outline" size="md" mt={7} ml={7}>
    Retour à l'accueil
  </Button>
</Link>


<Text color="teal.500" fontWeight="bold" mt={5} ml={7}>
  Nom de votre DAO : {daoName}
  <br /><br />
  Addresse de la DAO : {daoAddress}
</Text>
<Flex direction="row" alignItems="flex-start" justifyContent="flex-start" minHeight="100vh">
<Box mt={7} ml={7} w="25%">
<Text fontSize="2xl" color="green.700" mb={4}>Ajouter un membre :</Text>
<VStack spacing={4} alignItems="flex-start">
  <input
    type="text"
    placeholder="Adresse du membre"
    value={daoMemberAddress}
    onChange={(e) => setDaoMemberAddress(e.target.value)}
    width="30"
  />
  <input
    type="text"
    placeholder="Nom du membre"
    value={daoMemberName}
    onChange={(e) => setDaoMemberName(e.target.value)}
  />
</VStack>
<Button colorScheme="teal" type="submit" mt={7} onClick={addMember}>Ajouter un membre</Button>
<Text color="teal.500" fontWeight="bold" mt={5}>
  Liste des membres ajoutés :
</Text>
{addedMembers.map((member, index) => (
  <Text color="teal.500" key={index} mt={2} ml={3}>
    Membre {index + 1}: {member.name} ({member.address})
  </Text>
))}
<Text fontSize="2xl" color="red.700" mb={4} mt={8}>Retirer un membre :</Text>
      <VStack spacing={4} alignItems="flex-start">
        <input
          type="text"
          placeholder="Adresse du membre"
          value={removedMembers}
          onChange={(e) => setRemovedMembers(e.target.value)}
          width="30"
        />
      </VStack>
      <Button colorScheme="red" type="submit" mt={7} onClick={removeMember}>Retirer un membre</Button>
      <Text color="red.500" fontWeight="bold" mt={5}>
        Liste des membres retirés :
      </Text>
      {removedMembersList.map((member, index) => (
        <Text color="red.500" key={index} mt={2} ml={3}>
          Membre retiré {index + 1}: {member.address}
        </Text>
      ))}
</Box>

  <Box mt={7} ml={16}>
    <Text fontSize="2xl" color="green.700" mb={4}>Résultats du snapshot :</Text>
    <form onSubmit={handleSubmit}>
      <FormControl>
        <FormLabel htmlFor="result"></FormLabel>
        <Input
          id="result"
          type="text"
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="Entrez le résultat"
          width="100%" // Modifier la largeur de l'input ici
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="startDate">Date de début du vote:</FormLabel>
        <Input
          id="startDate"
          type="text"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Entrez la date de début"
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="endDate">Date de fin du vote:</FormLabel>
        <Input
          id="endDate"
          type="text"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="Entrez la date de fin"
        />
      </FormControl>

      <Button colorScheme="teal" type="submit" mt={4}>
        Soumettre
      </Button>
      <Text color="teal.500" fontWeight="bold" mt={5}>
      Liste des snapshot ajoutés :
    </Text>
    {snapshot.map((result, index) => (
      <Text color="teal.500" key={index} mt={2} ml={3}>
        Snapshot {index + 1}: {result.result} <br/>
        Début du vote :{result.startDate}<br/>
        Fin du vote : {result.endDate}
      </Text>
      ))}
    </form>
    <Text mb={3}>Nom du token :</Text>
  <Input
    value={tokenName}
    onChange={e => setTokenName(e.target.value)}
    placeholder="Entrez le nom du token"
    size="md"
    mb={3}
  />

  <Text mb={3}>Symbole du token :</Text>
  <Input
    value={tokenSymbol}
    onChange={e => setTokenSymbol(e.target.value)}
    placeholder="Entrez le symbole du token"
    size="md"
    mb={3}
  />

  <Button colorScheme="teal" onClick={createToken}>
    Créer un token
  </Button>

  <Text color="teal.500" fontWeight="bold" mt={5}>
    Liste des tokens créés :
  </Text>
  {createdTokens.map((token, index) => (
    <Text color="teal.500" key={index} mt={2} ml={3}>
      Token {index + 1}: {tokenName} ({tokenSymbol}) - Adresse : {token.address} 
    </Text>
  ))}
  {tokenAddress && (
<Text color="teal.500" fontWeight="bold" mt={5} ml={7}>
Adresse du token : {tokenAddress}
</Text>
)}

<Text fontSize="2xl" color="green.700" mb={4} mt={8}>Créer un vote :</Text>
<Button colorScheme="teal" onClick={createVote}>
Créer un vote
</Button>

<Text color="teal.500" fontWeight="bold" mt={5}>
Liste des votes créés :
</Text>
{createdVotes.map((vote, index) => (
<Text color="teal.500" key={index} mt={2} ml={3}>
Vote {index + 1}: Addresse :{vote.address} <br/>
Event:{votingAddress} 
</Text>
))}
  </Box>
</Flex>

</div>*/

// DERNIERS CHANGEMENTS

/*<Flex direction="row" alignItems="flex-start" justifyContent="flex-start" minHeight="100vh">
      <Box mt={7} ml={7} w="25%">
        <Text fontSize="2xl" color="green.700" mb={4}>Ajouter un membre :</Text>
        <VStack spacing={4}>
          <input
            type="text"
            placeholder="Adresse du membre"
            value={daoMemberAddress}
            onChange={(e) => setDaoMemberAddress(e.target.value)}
            width="30"
          />
          <input
            type="text"
            placeholder="Nom du membre"
            value={daoMemberName}
            onChange={(e) => setDaoMemberName(e.target.value)}
          />
        </VStack>
        <Button colorScheme="teal" type="submit" mt={7} onClick={addMember}>Ajouter un membre</Button>
        <Text color="teal.500" fontWeight="bold" mt={5}>
          Liste des membres ajoutés :
        </Text>
        {addedMembers.map((member, index) => (
          <Text color="teal.500" key={index} mt={2} ml={3}>
            Membre {index + 1}: {member.name} ({member.address})
          </Text>
        ))}
      </Box>*/

/*<div style={{ position: 'relative', minHeight: '100vh' }}>
    <Link to="/">
      <Button colorScheme="teal" variant="outline" size="md" mt={7} ml={7}>
        Retour à l'accueil
      </Button>
    </Link>
  
    <hr />
    <Text color="teal.500" fontWeight="bold" mt={5} ml={7}>
      Nom de votre DAO : {daoName}
      <br /><br />
      Addresse de la DAO : {daoAddress}
    </Text>
  
    <Box mt={7} ml={7} w="25%">
      <Text fontSize="2xl" color="green.700" mb={4}>Ajouter un membre</Text>
      <VStack spacing={4} ml={5}>
        <input
          type="text"
          placeholder="Adresse du membre"
          value={daoMemberAddress}
          onChange={(e) => setDaoMemberAddress(e.target.value)}
          width="30"
        />
        <input
          type="text"
          placeholder="Nom du membre"
          value={daoMemberName}
          onChange={(e) => setDaoMemberName(e.target.value)}
        />
      </VStack>
      <Button colorScheme="teal" type="submit" mt={7} onClick={addMember}>Ajouter un membre</Button>
    </Box>
    <Box mt={5}>
      <Text color="teal.500" fontWeight="bold" mt={5} ml={7}>
        Liste des membres ajoutés :
      </Text>
      {addedMembers.map((member, index) => (
        <Text color="teal.500" key={index} mt={2} ml={3}>
          Membre {index + 1}: {member.name} ({member.address})
        </Text>
      ))}
    </Box>
    <Flex direction="column" alignItems="center" justifyContent="center" minHeight="100vh">
    <form onSubmit={handleSubmit}>
      <FormControl>
        <FormLabel htmlFor="result">Résultat :</FormLabel>
        <Input
          id="result"
          type="text"
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="Entrez le résultat"
          width="100%" // Modifier la largeur de l'input ici
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="startDate">Date de début :</FormLabel>
        <Input
          id="startDate"
          type="text"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Entrez la date de début"
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="endDate">Date de fin :</FormLabel>
        <Input
          id="endDate"
          type="text"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="Entrez la date de fin"
        />
      </FormControl>

      <Button type="submit" mt={4}>
        Soumettre
      </Button>
    </form>
  </Flex>

  <Flex direction="column" alignItems="center" justifyContent="center" minHeight="100vh">
    <form onSubmit={handleSubmit}>
      <FormControl>
        <FormLabel htmlFor="result">Résultat :</FormLabel>
        <Input
          id="result"
          type="text"
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="Entrez le résultat"
          width="100%" // Modifier la largeur de l'input ici
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="startDate">Date de début :</FormLabel>
        <Input
          id="startDate"
          type="text"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Entrez la date de début"
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="endDate">Date de fin :</FormLabel>
        <Input
          id="endDate"
          type="text"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="Entrez la date de fin"
        />
      </FormControl>

      <Button type="submit" mt={4}>
        Soumettre
      </Button>
    </form>
  </Flex>
  </div>/*/



/*<Button colorScheme="teal" type="submit" mt={7}ml={77} onClick={addMember}>Ajouter un membre</Button>*/

/* <Input
          placeholder="Addresse du nouveau membre"
          value={daoMemberAddress}
          onChange={handleChange}
        />
        <Button
          colorScheme="teal"
          variant="solid"
          size="md"
          mt={7}
          onClick={handleSubmit}
        >
          Ajoutez un membre
        </Button>*/

        /*<h1>Ajoutez des membres à la DAO :</h1>
    <input
      type="text"
      placeholder="Adresse du membre"
      value={daoMemberAddress}
      onChange={(e) => setDaoMemberAddress(e.target.value)}
    />
    <input
      type="text"
      placeholder="Nom du membre"
      value={daoMemberName}
      onChange={(e) => setDaoMemberName(e.target.value)}
    />
    <button onClick={addMember}>Ajouter un membre</button>
      </Box>
      <Box mt={5}>
  <Text color="teal.500" fontWeight="bold" mt={5} ml={7}>
    Liste des membres ajoutés :
  </Text>
  {addedMembers.map((member, index) => (
    <Text color="teal.500" key={index} mt={2} ml={3}>
      Membre {index + 1}: {member.name} ({member.address})
    </Text>
  ))}*/


  /*<div style={{ position: 'relative', minHeight: '100vh' }}>
      <Link to="/">
        <Button colorScheme="teal" variant="outline" size="md" mt={7} ml={7}>
            Retour à l'accueil
        </Button>
      </Link>

      <hr/>
      <Text color="teal.500" fontWeight="bold" mt={5} ml={7}>
        Nom de votre DAO : {daoName}
        <br/><br/>
        Addresse de la DAO : {daoAddress}
      </Text>

      <Box mt={7} ml={7} w="25%">

       
      <Text fontSize="2xl" color="green.700" mb={4}>Ajouter un membre</Text>
      <VStack spacing={4} ml={4}>
    <input
      type="text"
      placeholder="Adresse du membre"
      value={daoMemberAddress}
      onChange={(e) => setDaoMemberAddress(e.target.value)}
    />
    <input
      type="text"
      placeholder="Nom du membre"
      value={daoMemberName}
      onChange={(e) => setDaoMemberName(e.target.value)}
    />
    </VStack>
    <Button colorScheme="teal" type="submit" mt={7} onClick={addMember }>Ajouter un membre</Button>
   
      </Box>
      <Box mt={5}>
  <Text color="teal.500" fontWeight="bold" mt={5} ml={7}>
    Liste des membres ajoutés :
  </Text>
  {addedMembers.map((member, index) => (
    <Text color="teal.500" key={index} mt={2} ml={3}>
      Membre {index + 1}: {member.name} ({member.address})
    </Text>
  ))}
</Box>

    </div> */