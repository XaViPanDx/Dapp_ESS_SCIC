import React from 'react';
import { EthProvider } from "./contexts/EthContext";
import { BrowserRouter as Router, Route, Link, Outlet, Routes } from 'react-router-dom';

import HomePage from './components/HomePage/HomePage';
import CreateYourDao from './components/CreateYourDao/CreateYourDao';
import YourDao from './components/YourDao/YourDao';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';



function App() {

  return (
    <>
      <EthProvider>
          <Router>
              <div className="App">
                <Header/>
                
                <Routes>

                    <Route index element={<HomePage />} />

                    <Route path="/create-your-dao" element={<CreateYourDao />} />

                    <Route path="/your-dao" element={<YourDao />} />

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
