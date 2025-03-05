import React from 'react'
import ParkingDisplay from './Components/ParkingDisplay'
import Form from './Components/Form'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './Components/Dashboard'
import Chatbot from './Components/Chatbot'
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ParkingDisplay />} />
        <Route path="/form" element={<Form />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chatbot" element={<Chatbot />} />
        
      </Routes>
    </BrowserRouter>
  )   
}

export default App
