import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";


function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(
    async (artifact, artifact2, artifact3, artifact4) => {
      if (artifact && artifact2 && artifact3 && artifact4) {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        const accounts = await web3.eth.requestAccounts();
        const networkID = await web3.eth.net.getId();

        // 1er contrat
        const { abi } = artifact;
        let address, contract;
        try {
          address = artifact.networks[networkID].address;
          contract = new web3.eth.Contract(abi, address);
        } catch (err) {
          console.error(err);
        }

        // 2eme contrat
        const abi2 = artifact2.abi;
        let address2, contract2;
        try {
          address2 = artifact2.networks[networkID].address;
          contract2 = new web3.eth.Contract(abi2, address2);
        } catch (err) {
          console.error(err);
        }

        // 3eme contrat
        const abi3 = artifact3.abi;
        let address3, contract3;
        try {
          address3 = artifact3.networks[networkID].address;
          contract3 = new web3.eth.Contract(abi3, address3);
        } catch (err) {
          console.error(err);
        }

        // 4eme contrat
        const abi4 = artifact4.abi;
        let address4, contract4;
        try {
          address4 = artifact4.networks[networkID].address;
          contract4 = new web3.eth.Contract(abi4, address4);
        } catch (err) {
          console.error(err);
        }

        dispatch({
          type: actions.init,
          data: {
            artifact,
            artifact2,
            artifact3,
            artifact4,
            web3,
            accounts,
            networkID,
            contract,
            contract2,
            contract3,
            contract4
          }
        });
      }
    },
    []
  );

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifact = require("../../contracts/DaoFactory.json");
        const artifact2 = require("../../contracts/NewDao.json");
        const artifact3 = require("../../contracts/NewToken.json");
        const artifact4 = require("../../contracts/NewVoting.json");
        init(artifact, artifact2, artifact3, artifact4);
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.artifact, state.artifact2, state.artifact3, state.artifact4);
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact, state.artifact2, state.artifact3, state.artifact4]);

  return (
    <EthContext.Provider value={{ state, dispatch }}>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;