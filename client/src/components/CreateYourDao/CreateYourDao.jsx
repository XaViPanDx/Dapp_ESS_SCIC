import React from 'react';
import { Button, Input, Box, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

import { useState, useEffect } from "react";
import { useEth } from "../../contexts/EthContext";

const CreateYourDao = ({daoAddress, setDaoAddress, daoName, setDaoName}) => { // daoAddress ok!!!!

  const {
    state: { accounts, contract, artifact, web3, txhash },
  } = useEth();

  //const [daoName, setDaoName] = useState("");
  const [eventValue, setEventValue] = useState("");
  const [oldEvents, setOldEvents] = useState();

  const handleSubmit = async () => {
    if (daoName=== "") {
      alert("Veuillez entrer un nom");
      return;
    }
    await contract.methods.createDao(daoName).send({ from: accounts[0] });
    // const newVoter = await contract.methods.getVoter(inputValue).call({ from: accounts[0] });
    // console.log(newVoter);
    //location.reload();
  };

  const handleChange = (evt) => {
    setDaoName(evt.currentTarget.value);
  };

  useEffect(() => {
    (async function () {
      if (!contract) return; // PAS OBLIGE
  
      const deployTx = await web3.eth.getTransaction(txhash);
      const fromBlock = deployTx ? deployTx.blockNumber : "earliest";
      
      let oldEvents = await contract.getPastEvents("DaoCreated", {
        fromBlock,
        toBlock: "latest",
      });
      let oldies = [];
      oldEvents.forEach((event) => {
        oldies.push(event.returnValues.daoAddress);
      });
      setOldEvents(oldies);
      //setDaoAddress(oldies);
  
      const subscription = contract.events.DaoCreated({ fromBlock })
        .on("data", (event) => {
          let lesevents = event.returnValues.daoAddress;
          setEventValue(lesevents);
          setDaoAddress(lesevents);
        })
        .on("changed", (changed) => console.log(changed))
        .on("error", (err) => console.log(err))
        .on("connected", (str) => console.log(str));
  
      return () => subscription.unsubscribe(); // PAS OBLIGE
    })();
  }, [contract, web3.eth, txhash, setDaoAddress]); // test dep vide? changements non visibles //
  



  return ( 
    <Box>
    <div>
      <Link to="/">
        <Button colorScheme="teal" variant="outline" size="md" mt={7} ml={7}>
          Retour à l'accueil
        </Button>
      </Link>
      <Box mt={7} ml={7} w="25%">
        <Input
          placeholder="Nom de la nouvelle DAO"
          value={daoName}
          onChange={handleChange}
        />
        <Button
          colorScheme="teal"
          variant="solid"
          size="md"
          mt={7}
          onClick={handleSubmit}
        >
          Créer une nouvelle DAO
        </Button>
      </Box>
    </div>

    <Box mt={5}>
      {eventValue && (
        <Text color="teal.500" fontWeight="bold" mt={5} ml={7}>
          Nom de votre DAO : {daoName} <br />
          <br />
          Addresse de la DAO : {eventValue}
        </Text>
      )}

      <Text color="teal.500" fontWeight="bold" mt={5} ml={7}>
        Liste de vos DAOs:
      </Text>
      {oldEvents &&
        oldEvents.map((event, index) => (
          <Text color="teal.500" key={index} mt={2} ml={3}>
            Dao {index + 1}: {event}
          </Text>
        ))}
    </Box>
  </Box>
  
  );
};

export default CreateYourDao;


/* 2     <Box>
    <div>
      <Link to="/">
        <Button colorScheme="teal" variant="outline" size="md" mt={7} ml={7}>
          Retour à l'accueil
        </Button>
      </Link>
      <div>
        <Input
          placeholder="Nom de la nouvelle DAO"
          value={daoName}
          onChange={handleChange}
          mt={7}
        />
        <Button colorScheme="teal" variant="solid" size="md" mt={7} onClick={handleSubmit}>
          Créer une nouvelle DAO
        </Button>
      </div>
    </div>

    <Box mt={5}>
      {eventValue && (
        <Text color="teal.500" fontWeight="bold" mt={5} ml={7}>
          Nom de votre DAO : {daoName} <br/>
          <br/>
          Addresse de la DAO : {eventValue}
        </Text>
      )}

      <Text color="teal.500" fontWeight="bold" mt={5} ml={7}>
        Liste de vos DAOs:
      </Text>
      {oldEvents &&
        oldEvents.map((event, index) => (
          <Text color="teal.500" key={index} mt={2} ml={3}>
            Dao {index + 1}: {event}
          </Text>
        ))}
    </Box>
  </Box>*/


/* 1 <Box>
    <div >
      <Link to="/">
        <Button colorScheme="teal" variant="outline" size="md" mt={7} ml={7}>
          Retour à l'accueil
        </Button>
      </Link>
      <div>
        <Input
          placeholder="Nom de la nouvelle DAO"
          value={daoName}
          onChange={handleChange}
          mt={7}
        />
        <Button colorScheme="teal" variant="solid" size="md" mt={7} onClick={handleSubmit}>
          Créer une nouvelle DAO
        </Button>
      </div>
    </div>

    <div>
      {eventValue && (
        <div>
          Dao added: {eventValue}
        </div>
      )}

      <br />

      <p>List of Dao:</p>
      {oldEvents &&
        oldEvents.map((event, index) => (
          <p key={index}>
            Dao {index + 1}: {event}
          </p>
        ))}
    </div>
  </Box>*/