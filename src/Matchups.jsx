import React, { useState, useEffect } from "react";
import "./Matchups.css";

function Matchups() {
  const [matchups, setMatchups] = useState([]);
  const [error, setError] = useState(null);

  useEffect (() => {
    const cachedData = localStorage.getItem('matchupData');
    const cachedTimestamp = localStorage.getItem('standingsTimestamp');
    const now = Date.now();

    const oneDay = 24 * 60 * 60 * 1000;

    if(cachedData && cachedTimestamp && (now - Number(cachedTimestamp)) < oneDay){
      const parsed = JSON.parse(cachedData);
      setMatchups(parsed);
      console.log("Using cached standings data");
    } else{
      fetchMatchups();
    }
  }, []);

  fetchMatchups = async () => {
    const url = 'https://api-nba-v1.p.rapidapi.com/games?date=2022-02-12';
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '8db8bcee80mshe14a4768570a065p17461ejsna40d19c36a19',
        'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com'
    }
  };

    try {
      const response = await fetch(url, options);
      if(!response.ok){
        throw new Error(`Request failed with status ${response.status}`);
      }
      const textResult = await response.text();
      const data = JSON.parse(textResult);

    } catch (error) {
      console.error(error);
    }
  }
}