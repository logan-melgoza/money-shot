import React, { useState, useEffect } from "react";
import logo from './assets/money-logo.png';
import "./Navbar.css";

function Navbar() {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const date = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
    setCurrentDate(date);
  }, []);

  return (
    <div className="navbar">
      {/* Left Section - Logo */}
      <div className="navbar__section navbar__left">
        <img src={logo} alt="Logo" className="navbar__logo" />
        <span className="navbar__title">Money Shot</span>
      </div>

      {/* Center Section - Current Date */}
      <div className="navbar__section navbar__center">
        {currentDate}
      </div>

      {/* Right Section - Custom Text */}
      <div className="navbar__section navbar__right">
        <span>AI Sports Insights</span>
      </div>
    </div>
  );
}

export default Navbar;