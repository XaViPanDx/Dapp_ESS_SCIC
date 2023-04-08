import React from 'react';
import { Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const CreateYourDao = () => {

  return ( 

    <div style={{ position: 'relative', minHeight: '100vh' }}>

      <Link to="/">

          <Button colorScheme="teal" variant="outline" size="md" mt={7} ml={7}>

              Retour à l'accueil

          </Button>

      </Link>

    </div> 

  );
};

export default CreateYourDao;
