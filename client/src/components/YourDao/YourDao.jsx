import React from 'react';
import { Button, Text, Box, Input } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

import { useState, useEffect } from "react";

import { useEth } from "../../contexts/EthContext";

const YourDao = ({daoAddress, daoName, daoMemberName, setDaoMemberName, daoMemberAddress, setDaoMemberAddress}) => {

  const {
    state: { accounts, contract, contract2, artifact, artifact2 },
  } = useEth();
  const [isOwner, setIsOwner] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    async function getOwner() {
      if (artifact) {
        // On check si l'account courant est l'owner du contract
        const owner = await contract2.methods.owner().call({ from: accounts[0] }); //contract2
        accounts[0] === owner ? setIsOwner(true) : setIsOwner(false);
      }
    }
    getOwner();
  }, [accounts, contract, artifact, daoAddress]);



  const handleSubmit = async () => {
    if (daoMemberAddress=== "" && daoMemberName === "") {
      alert("Veuillez entrer un nom");
      return;
    }
    await contract2.methods.addMember(daoMemberAddress, daoMemberName).send({ from: accounts[0] });
    // const newVoter = await contract.methods.getVoter(inputValue).call({ from: accounts[0] });
    // console.log(newVoter);
    //location.reload();
  };

  const handleChange = (evt) => {
    setDaoMemberAddress(evt.currentTarget.value);
    setDaoMemberName(evt.currentTarget.value);
  };


  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
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
        <Input
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
        </Button>
      </Box>
    </div> 
  );
};

export default YourDao;
