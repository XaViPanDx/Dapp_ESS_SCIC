import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';


const Footer = () => {
  
  return (

    <Box as="footer" bg="teal.500" p={4}>

      <Flex justifyContent="center" alignItems="center">

        <Text fontSize="md" fontWeight="bold" color="white">

          © 2023 # ALYRA # - Dapp ESS SCIC - Développée par François (Consultant), Myriam (Consultant), David (DeFi), Xavier (Developpeur)

        </Text>

      </Flex>

    </Box>
  );
};

export default Footer;
