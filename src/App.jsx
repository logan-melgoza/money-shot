import React from "react";
import Navbar from "./Navbar"; 
import Standings from "./Standings";
import Matchups from "./Matchups";
import "./App.css"

function App() {
  return (
    <div>
      <Navbar />  {/* ✅ Use Navbar in your app */}
      <main className="main-container">
        <Standings />
        <Matchups />
      </main>
    </div>
  );
}

export default App;