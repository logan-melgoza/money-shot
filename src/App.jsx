import React from "react";
import Navbar from "./Navbar"; 
import Standings from "./Standings";

function App() {
  return (
    <div>
      <Navbar />  {/* ✅ Use Navbar in your app */}
      <main>
        <Standings />
      </main>
    </div>
  );
}

export default App;