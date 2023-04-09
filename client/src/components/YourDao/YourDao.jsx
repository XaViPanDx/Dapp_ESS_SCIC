import React from 'react';
import { Button, Text, Box, VStack} from '@chakra-ui/react'; //Input
import { Link } from 'react-router-dom';

import { useState, useEffect } from "react";

import { useEth } from "../../contexts/EthContext";

const YourDao = ({daoAddress, daoName, daoMemberName, setDaoMemberName, daoMemberAddress, setDaoMemberAddress}) => {

  const {
    state: { accounts, contract2 }, //contract, artifact, artifact2
  } = useEth();
  //const [isOwner, setIsOwner] = useState(false);
  //const [inputValue, setInputValue] = useState("");
  const [addedMembers, setAddedMembers] = useState([]);


  /*useEffect(() => {
    async function getOwner() {
      if (artifact2) {
        // On check si l'account courant est l'owner du contract
        const owner = await contract2.methods.owner().call({ from: accounts[0] }); //contract2
        accounts[0] === owner ? setIsOwner(true) : setIsOwner(false);
      }
    }
    getOwner();
  }, [accounts, contract, artifact, daoAddress]);*/



  /*const handleSubmit = async () => {
    if (daoMemberAddress=== "" && daoMemberName === "") {
      alert("Veuillez entrer un nom");
      return;
    }
    await contract2.methods.addMember(daoMemberAddress, daoMemberName).send({ from: accounts[0] });
    // const newVoter = await contract.methods.getVoter(inputValue).call({ from: accounts[0] });
    // console.log(newVoter);
    //location.reload();
  };*/
  const newDaoInstance = contract2.clone();
  newDaoInstance.options.address = daoAddress;


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
  
  /*const removeMember = async () => {
    try {
      const result = await newDaoInstance.methods.removeMember(daoMemberAddress).send({from: accounts[0]});
      console.log('Membre retiré:', result);
      // Mettez à jour l'état des membres ajoutés ou effectuez d'autres actions après avoir retiré un membre
    } catch (error) {
      console.error('Erreur lors du retrait du membre:', error);
    }
  };*/
  

  /*const handleChange = (evt) => {
    setDaoMemberAddress(evt.currentTarget.value);
    setDaoMemberName(evt.currentTarget.value);
  };*/


  return (

    <div style={{ position: 'relative', minHeight: '100vh' }}>
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
  </div>
  
  
  );
};

export default YourDao;

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