import React, {useEffect, useState} from 'react';
import './Standings.css';

function Standings () {
  const [easternStandings, setEasternStandings] = useState([]);
  const [westernStandings, setWesternStandings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStandings();
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
      
      const east = data.response.filter(item => item.conference.name.toLowerCase() === 'east');
      const west = data.response.filter(item => item.conference.name.toLowerCase() === 'west');
      
      setEasternStandings(east.sort((a, b) => a.conference.rank - b.conference.rank));
      setWesternStandings(west.sort((a, b) => a.conference.rank - b.conference.rank));

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
          <ul>
            {easternStandings.map((item) => (
              <li key={item.team.id}>
                {item.conference.rank}. <img className= "standings__logo" src={item.team.logo} alt={item.team.nickname}/> {item.team.nickname} - {item.conference.win}W {item.conference.loss}L
              </li>
            ))}
          </ul>
        </div>
        <div className='conference western'>
          <h3>Western Conference</h3>
          <ul>
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
