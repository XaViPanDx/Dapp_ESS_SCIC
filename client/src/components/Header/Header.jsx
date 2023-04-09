import React, { useState, useEffect } from 'react';
import useEth from "../../contexts/EthContext/useEth";
import { Box, Flex, Text } from '@chakra-ui/react';

const Header = () => {
  const { state: { accounts } } = useEth();
  const [address, setAddress] = useState('Non connecté');

  useEffect(() => {
    if (accounts) {
      setAddress(accounts);
    } else {
      setAddress('Non connecté');
    }
  }, [accounts]);

    /*const handleAccountsChanged = (newAccounts) => {
      if (newAccounts.length === 0) {
        setAddress('Non connecté');
      } else {
        setAddress(newAccounts[0]);
      }
    };*/

  return (
  <>
    <Box as="header" bg="teal.500" p={4}>

      <Flex justifyContent="space-between" alignItems="center" width="100%">

        <Text fontSize="3xl" fontWeight="bold" color="white" ml={33}>

                Dapp ESS SCIC

        </Text>
        
        <Text color="white" mr={33}>

          Votre addresse : {address && <pre>{address}</pre>}

        </Text>

      </Flex>

    </Box>

  </> 
  );
};

export default Header;