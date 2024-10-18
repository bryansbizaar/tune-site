import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./useAuth";
import Home from "./components/Home";
import TuneList from "./components/TuneList";
import TuneDetail from "./components/TuneDetail";
import ChordList from "./components/ChordList";
import Resources from "./components/Resources";
import ChordDetail from "./components/ChordDetail";

import "./index.css";

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;
