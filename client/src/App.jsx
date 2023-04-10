import React from 'react';
import { EthProvider } from "./contexts/EthContext";
import { BrowserRouter as Router, Route, Outlet, Routes } from 'react-router-dom'; //Link

import HomePage from './components/HomePage/HomePage';
import CreateYourDao from './components/CreateYourDao/CreateYourDao';
import YourDao from './components/YourDao/YourDao';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

import { useState } from "react";



function App() {

  const [daoAddress, setDaoAddress] = useState([]);
  const [daoName, setDaoName] = useState("");
  const [daoMemberName, setDaoMemberName] = useState("");
  const [daoMemberAddress, setDaoMemberAddress] = useState([]); //""
  const [removeMemberAddress, setRemoveMemberAddress] = useState([]);
  const [result, setResult] = useState([]);
  const [startDate, setStartDate] = useState([]);
  const [endDate, setEndDate] = useState([]);
  const [tokenAddress, setTokenAddress] = useState([]);

  //const [nftAddress, setNftAddress] = useState([]);
  //const [votingAddress, setVotingAddress] = useState([]);


  return (
    <>
      <EthProvider>
          <Router>
              <div className="App">
                <Header/>
                
                <Routes>

                    <Route index element={<HomePage />} />

                    <Route path="/create-your-dao" element={<CreateYourDao daoName={daoName} setDaoName={setDaoName} daoAddress={daoAddress} setDaoAddress={setDaoAddress}/>} />

                    <Route path="/your-dao" element={<YourDao daoAddress={daoAddress} daoName={daoName} daoMemberName={daoMemberName}
                    setDaoMemberName={setDaoMemberName} daoMemberAddress={daoMemberAddress} setDaoMemberAddress={setDaoMemberAddress}
                    removeMemberAddress={removeMemberAddress} setRemoveMemberAddress={setRemoveMemberAddress} result={result}
                    setResult={setResult} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}
                    tokenAddress={tokenAddress} setTokenAddress={setTokenAddress}/>} />

                </Routes>

                <Outlet />

                <Footer/> 
              </div>
          </Router>
      
      </EthProvider>
    </>
  );
}

export default App;
