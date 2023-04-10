import React from 'react';
import { useState, useEffect, useCallback} from "react"; //useEffect, useContext 

import { useEth } from "../../contexts/EthContext";
import { Button, Input, Flex, Box, Heading, Text, Link } from '@chakra-ui/react';
//import Web3 from "web3";

const YourVoting = ({isOwner, setIsOwner,isMember, setIsMember, result, tokenAddress, daoAddress, votingAddress }) => {

    const {
        state: { accounts, contract4 }, //contract, artifact, artifact2, contract3, contract4 contract2, contract3,txhash, web3
      } = useEth();

      const [members, setMembers] = useState("");
      const [quorum, setQuorum] = useState("");
      const [participation, setParticipation] = useState("");

      const [proposal, setProposal] = useState("");
      const [currentStatus, setCurrentStatus] = useState(0);
      const [voteFor, setVoteFor] = useState("");

      //const [winningProposal, setWinningProposal] = useState(null);
    
    

      const newVotingInstance = contract4.clone();
      newVotingInstance.options.address = contract4.options.address;


      // OWNER

      /*const changeStatus = async () => {
        // console.log(currentStatus);
        switch (currentStatus) {
          case 0:
            await newVotingInstance.methods.startVotingSession().send({ from: accounts[0] });
            setCurrentStatus(1);
            break;
          case 1:
            await newVotingInstance.methods.endVotingSession().send({ from: accounts[0] });
            setCurrentStatus(2);
            break;
          case 2:
            setCurrentStatus(0);
            break;
          default:
            setCurrentStatus(0);
            break;
        }
      };*/

      const changeStatus = useCallback(async () => {
        switch (currentStatus) {
          case 0:
            await newVotingInstance.methods.startVotingSession().send({ from: accounts[0] });
            setCurrentStatus(1);
            break;
          case 1:
            await newVotingInstance.methods.endVotingSession().send({ from: accounts[0] });
            setCurrentStatus(2);
            break;
          case 2:
            setCurrentStatus(0);
            break;
          default:
            setCurrentStatus(0);
            break;
        }
      }, [currentStatus, newVotingInstance, accounts]);

      const getStatusString = (Wstatus) => {
        switch (Wstatus) {
          case 0:
            return "Enregistrement de la proposition séléctionée par la communauté";
          case 1:
            return "Session de vote en cours";
          case 2:
            return "Session de vote terminée";
          default:
            return "Inconnu";
        }
      };

      

      async function handleSetVote() {
        /*if (!isAddress(mintAddress)) {
          alert("L'adresse n'est pas valide."); // OWNER?
          return;
        }*/
       try {
          await newVotingInstance.methods.setVote(members, quorum, participation).send({from: accounts[0]}); //const tx =
          alert('Vote configuré avec succès !');
        } catch (error) {
          console.error('Erreur lors de la configuration du vote : ', error);
        }
      }

      async function handleSetProposal() {
        /*if (!isAddress(mintAddress)) {
          alert("L'adresse n'est pas valide.");
          return;
        }*/
        try {
          await newVotingInstance.methods.setPredeterminedProposal(proposal).send({from: accounts[0]}); //const tx =
          alert('Proposition ajoutée avec succès !');
        } catch (error) {
          console.error("Erreur lors de l'ajout de la proposition : ", error);
        }
      }

      const handleGetProposal = useCallback(async () => {
        try {
          await newVotingInstance.methods.getPredeterminedProposal().send({from: accounts[0]});
        } catch (error) {
          console.error("Erreur lors de la consultation de la proposition : ", error);
        }
      }, [newVotingInstance, accounts]);
    
      
      // VOTER //

      /*async function getWorkflowStatus() {
        if (newVotingInstance) {
           await newVotingInstance.methods.getWorkflowStatus().call({ from: accounts[0] });
          //setCurrentStatus(parseInt(workflowStatusIndex));
        }
      };
    
    
      useEffect(() => {
        getWorkflowStatus();
      }, [accounts, contract4, currentStatus, ]);*/


      const handlegetresult = useCallback(async () => {
        try {
          await newVotingInstance.methods.getResult().send({from: accounts[0]});
        } catch (error) {
          console.error('Erreur lors de la récupération du résultat : ', error);
        }
      }, [newVotingInstance, accounts]);

      const handleCheckRules = useCallback(async () => {
        try {
          await newVotingInstance.methods.checkRules().send({from: accounts[0]});
        } catch (error) {
          console.error('Erreur lors de la récupération des conditions de vote : ', error);
        }
      }, [newVotingInstance, accounts]);

      /*async function handleCheckResults() {
        /*if (!isAddress(mintAddress)) {
          alert("L'adresse n'est pas valide.");
          return;
        }*/
        /*try {
          await newVotingInstance.methods.isProposalAccepted().send({from: accounts[0]}); 
          //alert('Vote configuré avec succès !');
        } catch (error) {
          console.error('Erreur lors de la récupération des conditions de vote : ', error);
        }
      }*/

      const handleCheckResults = useCallback(async () => {
        try {
          await newVotingInstance.methods.isProposalAccepted().send({from: accounts[0]});
        } catch (error) {
          console.error('Erreur lors de la récupération des conditions de vote : ', error);
        }
      }, [newVotingInstance, accounts]);





      /*const handleVote = useCallback(async () => {
        try {
          await newVotingInstance.methods.voteForProposal(voteFor === "true").send({from: accounts[0]}); 
        } catch (error) {
          console.error('Erreur lors du vote : ', error);
        }
      }, [voteFor, newVotingInstance, accounts]);*/

      const handleVote = useCallback(async () => {
        try {
          await newVotingInstance.methods.voteForProposal(voteFor === "true").send({from: accounts[0]});
          alert('Vote ajouté avec succès !');
        } catch (error) {
          console.error('Erreur lors du vote : ', error);
        }
      }, [voteFor, newVotingInstance, accounts]);



      /*useEffect(() => {
        if (!newVotingInstance) return;
      
        async function getPastEvents() {
          const pastEvents = await newVotingInstance.getPastEvents("ProposalResult", {
            fromBlock: 0,
            toBlock: "latest",
          });
      
          if (pastEvents.length > 0) {
            const latestEvent = pastEvents[pastEvents.length - 1];
            setWinningProposal(latestEvent.returnValues.winningProposal);
          }
        }
      
        getPastEvents();
      
        const subscription = newVotingInstance.events.ProposalResult()
          .on("data", (event) => {
            setWinningProposal(event.returnValues.winningProposal);
          })
          .on("error", console.error);
      
        return () => {
          subscription.unsubscribe();
        };
      }, [newVotingInstance]);*/

  
    return (
      <>
      <Link to="/">
        <Button colorScheme="teal" variant="outline" size="md" mt={7} ml={7}>
          Retour à l'accueil
        </Button>
      </Link>
      <br/>
      <Box mb="4" mt={4}>
        <Text fontSize="xl" color="teal" mr="22" ml={22}>
        {'Statut actuel du Vote : '}
        {getStatusString(currentStatus)} (Status {currentStatus})
        </Text>
        <Text fontSize="xl" color="teal" mr="4" ml={22}>
        {'Proposition soumise au vote :'} {proposal}
        </Text>
      </Box> 

      <Flex >
        <Box flex="1" bg="white" p="6" borderRadius="md" boxShadow="lg">
          <Heading as="h2" size="lg" mb="7" color="teal">Membres voteurs</Heading>
          <br/>
          <Flex mb={4}>
          <Button colorScheme="teal" variant="outline" size="md" onClick={handleVote}>
            Voter
          </Button>
          <Input
            type="text"
            placeholder="true or false"
            value={voteFor}
            onChange={(e) => setVoteFor(e.target.value)}
            ml={2}
            width="33%"
            />
          </Flex>

          <br/>
          <br/>
          <Button colorScheme='teal' size='md' variant="outline" onClick={handleGetProposal}>
            Afficher la proposition soumise au vote
          </Button>
          <br/>
          <br/>
          <Button colorScheme='teal' size='md' variant="outline" onClick={handlegetresult}>
            Afficher le résultat
          </Button>
          <br/>
          <br/>
          <Button colorScheme='teal' size='md' variant="outline" onClick={handleCheckRules}>
            Les conditions minimales de vote ont étées respectées?
          </Button>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          {/*<Heading as="h2" size="lg" mb="7" color="teal">Résultats du vote : {winningProposal}</Heading>*/}
        </Box>


        <Box flex="1" bg="white" p="6" borderRadius="md" boxShadow="lg" ml="4">
          <Heading as="h2" size="lg" mb="4" color="teal">Administrateur</Heading>

          <Flex mb={4}>
          <Button colorScheme='teal' size='md' onClick={handleSetProposal}>
              Configurer la proposition
            </Button>
          
          <Input
            type="text"
            placeholder='proposition soumise au vote'
            id="proposition"
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            borderColor="teal"
            focusBorderColor="teal.500"
            ml={2}
            w="60%"
          />  
        </Flex>
         
          <br/>
         
              <Button colorScheme='teal' size='md' onClick={handleSetVote}>
                Configurer le vote
              </Button>

              <br/>
          <br/>
             
          <Button colorScheme='teal' variant="outline" size='md'>
          Nombre de membres:
            </Button>
          <br/>
          <Input
            type="number"
            placeholder=''
            id="members"
            value={members}
            onChange={(e) => setMembers(parseInt(e.target.value))}
            borderColor="teal"
            focusBorderColor="teal.500"
            w="33%"
          /> <br/>
          <Button colorScheme='teal' variant="outline" size='md' >
          Pourcentage du quorum:
            </Button>
          <br/>
          <Input
            type="number"
            placeholder=''
            id="quorum"
            value={quorum}
            onChange={(e) => setQuorum(parseInt(e.target.value))}
            borderColor="teal"
            focusBorderColor="teal.500"
            w="33%"
          />  <br/>
          <Button colorScheme='teal' variant="outline" size='md'>
          Pourcentage de participation minimum:
            </Button>
          <br/>
          <Input
            type="number"
            placeholder=''
            id="participation"
            value={participation}
            onChange={(e) => setParticipation(parseInt(e.target.value))}
            borderColor="teal"
            focusBorderColor="teal.500"
            w="33%"
          />  
          <br/>
          <br/>
          <Button colorScheme='teal' size='md' onClick={changeStatus}>
            Statut suivant
          </Button>
          <br/>
          <br/>
          <Button colorScheme='teal' size='md' onClick={handleCheckResults}>
            Résultats du vote
          </Button>  
        </Box>
      </Flex>
    </>    
   
    );
  };
  
  export default YourVoting;

  
