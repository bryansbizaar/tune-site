import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import TuneList from "./components/TuneList";
import TuneDetail from "./components/TuneDetail";
import ChordList from "./components/ChordList";
import Resources from "./components/Resources";
import ChordDetail from "./components/ChordDetail";

import "./index.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tuneList" element={<TuneList />} />
          <Route path="/tune/:id" element={<TuneDetail />} />
          <Route path="/chords" element={<ChordList />} />
          <Route path="/chords/:id" element={<ChordDetail />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
