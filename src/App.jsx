import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from './pages/Main'
import viteLogo from '/vite.svg';
import './App.css';

function App() {
  const [count, setCount] = useState(0)
  // useEffect(() => {
  //   console.log("Call");
  //   retrieveServer();
  // })
  // const retrieveServer = async() => {
  //   const response = await fetch('http://localhost:8000');
  //   const data = await response.json();
  //   console.log(data);
  // }
  
  return (
    <Router>
    <div className="App">
      {/* <Header /> */}
        <Routes>
          <Route path="/" element={<Main />}/>
        </Routes>
    </div>
  </Router>
  )
}

export default App