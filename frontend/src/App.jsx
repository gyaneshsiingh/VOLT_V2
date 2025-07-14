import React from "react";
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';

import Car from "./components/Car";
import Addstation from './components/AddStation';
import NearbyStations from './components/NearbyStations';

const App = () => {
  return (
  <Router>
    <div>
      <nav style={{margin: "10px"}}>
        <Link to = "/" style={{marginRight: "10px"}}>Car Input</Link>
        <Link to = "/add-station" style={{marginRight: "10px"}}>Add Station</Link>
        <Link to = "/nearby-stations">Nearby Stations</Link>
      </nav>

      <Routes>
        <Route path = "/" element = {<Car />} />
        <Route path = "/add-station" element = {<Addstation />} />
        <Route path = "/nearby-stations" element = {<NearbyStations />} />
      </Routes>
    </div>
    </Router>
  );
}

export default App;