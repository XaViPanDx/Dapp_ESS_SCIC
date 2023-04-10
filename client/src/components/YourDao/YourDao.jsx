import React from 'react';
import { Button, Text, Box, VStack, Flex, Input, FormControl, FormLabel} from '@chakra-ui/react'; //Input
import { Link } from 'react-router-dom';

import { useState, useEffect } from "react";

import { useEth } from "../../contexts/EthContext";

const YourDao = ({daoAddress, daoName, daoMemberName, setDaoMemberName, daoMemberAddress, 
  setDaoMemberAddress, removeMemberAddress, setRemoveMemberAddress, result, setResult,
startDate, setStartDate, endDate, setEndDate}) => {

  const {
    state: { accounts, contract2 }, //contract, artifact, artifact2
  } = useEth();
  //const [isOwner, setIsOwner] = useState(false);
  //const [inputValue, setInputValue] = useState("");
  const [addedMembers, setAddedMembers] = useState([]);
  const [removedMembers, setRemovedMembers] = useState([]);
  const [snapshot, setSnapshot] = useState([]);
  const [removedMembersList, setRemovedMembersList] = useState([]);



  //snapshotResults:
  //const [result, setResult] = useState('');
  //const [startDate, setStartDate] = useState('');
  //const [endDate, setEndDate] = useState('');


  const newDaoInstance = contract2.clone();
  newDaoInstance.options.address = daoAddress;

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
  }, [accounts, contract2, artifact2, daoAddress]);*/

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
  }, [newDaoInstance, setAddedMembers]);

  /*const handleChange = (evt) => {
    setDaoMemberAddress(evt.currentTarget.value);
    setDaoMemberName(evt.currentTarget.value);
  };*/

  const removeMember = async () => {
    try {
      await newDaoInstance.methods.removeMember(removedMembers).send({from: accounts[0]}); //const result = 
      //console.log('Membre retiré:', result);
      alert('Membre retiré avec succès !');
      // Mettez à jour l'état des membres ajoutés ou effectuez d'autres actions après avoir retiré un membre
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
  }, [newDaoInstance, setRemovedMembersList]);
  

  

  // snapshotResult

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
  }, [newDaoInstance, setSnapshot]);
  


  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
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
      </Box>
    </Flex>
  </div>
    
  
  
  );
};

export default YourDao;

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