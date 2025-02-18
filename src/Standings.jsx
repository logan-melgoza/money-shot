import React, {useEffect, useState} from 'react';
import './Standings.css';

function Standings () {
  const [easternStandings, setEasternStandings] = useState([]);
  const [westernStandings, setWesternStandings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    //Check localStorage for cached data
    const cachedData = localStorage.getItem('standingsData');
    const cachedTimestamp = localStorage.getItem('standingsTimestamp');
    const now = Date.now();

    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in ms

    if (cachedData && cachedTimestamp && (now - Number(cachedTimestamp)) < oneDay) {
      // Use cached data
      const parsed = JSON.parse(cachedData);
      setEasternStandings(parsed.east);
      setWesternStandings(parsed.west);
      console.log("Using cached standings data");
    } else {
      // Fetch new data if cache is missing or expired
      fetchStandings();
    }    
  }, []);

  const fetchStandings = async () => {
    const url = 'https://api-nba-v1.p.rapidapi.com/standings?league=standard&season=2024';
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '8db8bcee80mshe14a4768570a065p17461ejsna40d19c36a19',
        'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const textResult = await response.text();
      const data = JSON.parse(textResult);
      
      let east = data.response.filter(item => item.conference.name.toLowerCase() === 'east');
      let west = data.response.filter(item => item.conference.name.toLowerCase() === 'west');

      east = [...east].sort((a, b) => a.conference.rank - b.conference.rank);
      west = [...west].sort((a, b) => a.conference.rank - b.conference.rank);

      setEasternStandings(east);
      setWesternStandings(west);

      // Cache the data
      const standingsData = { east, west };
      localStorage.setItem('standingsData', JSON.stringify(standingsData));
      localStorage.setItem('standingsTimestamp', Date.now().toString());

    } catch (error) {
      setError(error.message);
      console.error(error);
    }
  };

  return (
    <div className='Standings'>
      <h2>NBA Standings</h2>
      {error && <p>Error: {error}</p>}
      <div className='standings-container'>
        <div className='conference eastern'>
          <h3>Eastern Conference</h3>
          <ul className='standings__list'>
            {easternStandings.map((item) => (
              <li key={item.team.id}>
                {item.conference.rank}. <img className= "standings__logo" src={item.team.logo} alt={item.team.nickname}/> {item.team.nickname} - {item.conference.win}W {item.conference.loss}L
              </li>
            ))}
          </ul>
        </div>
        <div className='conference western'>
          <h3>Western Conference</h3>
          <ul className='standings__list'>
            {westernStandings.map((item) => (
              <li key={item.team.id}>
                {item.conference.rank}. <img className= "standings__logo" src={item.team.logo} alt={item.team.nickname}/> {item.team.nickname} - {item.conference.win}W {item.conference.loss}L
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Standings;
