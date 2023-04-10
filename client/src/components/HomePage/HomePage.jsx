import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@chakra-ui/react';
import { Flex } from '@chakra-ui/react';
import { Heading } from '@chakra-ui/react';


const HomePage = () => {

  return (

    <div>
      
      <Flex justifyContent="flex-end" alignItems="center" mt={4} mr={4} flexDirection="row" flexWrap="wrap">

        <Link to="/create-your-dao">

        <Button colorScheme="teal" variant="solid" mr={21} size="lg" mt={33}>

              Créez votre DAO

        </Button>
         </Link>

        <Link to="/your-dao">

        <Button colorScheme="teal" variant="solid" size="lg" mt={33} mr={21}> {/**mr={77} */}

              Votre DAO

        </Button>
        </Link>

        <Link to="/your-voting">

        <Button colorScheme="teal" variant="solid" size="lg" mr={77} mt={33}>

              Votre espace vote

        </Button>
        </Link>

      </Flex>

      <Heading as="h1" fontSize="7xl" color="teal.500" textAlign="left" mb={33} ml={77} mt={77}>
              Construire ensemble,<br/>
              tout simplement
      </Heading>

    </div>

  );
};

export default HomePage;
