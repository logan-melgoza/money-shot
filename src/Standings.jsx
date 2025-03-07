import React, {useEffect, useState} from 'react';
import './Standings.css';

function Standings () {
  const [easternStandings, setEasternStandings] = useState([]);
  const [westernStandings, setWesternStandings] = useState([]);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const brokenLogos = {
    "https://upload.wikimedia.org/wikipedia/fr/thumb/4/4f/Thunder_d%27Oklahoma_City_logo.svg/1200px-Thunder_d%27Oklahoma_City_logo.svg.png" : "https://logodownload.org/wp-content/uploads/2021/07/oklahoma-city-thunder-logo.png",
    "https://upload.wikimedia.org/wikipedia/fr/3/34/Bucks2015.png" : "https://upload.wikimedia.org/wikipedia/sco/4/4a/Milwaukee_Bucks_logo.svg",
    "https://upload.wikimedia.org/wikipedia/fr/thumb/1/1c/Miami_Heat_-_Logo.svg/1200px-Miami_Heat_-_Logo.svg.png" : "https://upload.wikimedia.org/wikipedia/en/f/fb/Miami_Heat_logo.svg",
    "https://upload.wikimedia.org/wikipedia/fr/b/bd/Orlando_Magic_logo_2010.png" : "https://upload.wikimedia.org/wikipedia/en/thumb/1/10/Orlando_Magic_logo.svg/2560px-Orlando_Magic_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/fr/4/48/76ers_2016.png" : "https://upload.wikimedia.org/wikipedia/commons/e/eb/Philadelphia-76ers-Logo-1977-1996.png",
    "https://upload.wikimedia.org/wikipedia/fr/0/0e/San_Antonio_Spurs_2018.png" : "https://loodibee.com/wp-content/uploads/san-antonio-spurs-logo-symbol.png"
   };

   const getValidLogo = (team) => {
    if (!team.logo || !team.logo.startsWith("http")) {
      return "/fallback-image.png"; 
    }
    return brokenLogos[team.logo] || team.logo; 
    };

  useEffect(() => {
    //Check localStorage for cached data
    const cachedData = localStorage.getItem('standingsData');
    const cachedTimestamp = localStorage.getItem('standingsTimestamp');
    const now = Date.now();

    const oneDay = 20 * 60 * 1000; // 20 mins in ms

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
    <div className="Standings">
    <h2>NBA Standings</h2>
    {error && <p>Error: {error}</p>}
    <div className="standings-container">
      {/* Eastern Conference */}
      <div className="conference eastern">
        <h3>Eastern Conference</h3>
        <ul className="standings__list">
          {(expanded ? easternStandings : easternStandings.slice(0, 10)).map((item) => (
            <li key={item.team.id} className="team-row">
              <span className="rank">{item.conference.rank}.</span>
              <img
                className="standings__logo"
                src={getValidLogo(item.team)}
                alt={item.team.nickname}
                onError={(e) => (e.target.src = "/fallback-image.png")}
              />
              <div className="team-info">
                <span className="team-name">{item.team.nickname}</span>
                <span className="team-record">{item.conference.win}W {item.conference.loss}L</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Western Conference */}
      <div className="conference western">
        <h3>Western Conference</h3>
        <ul className="standings__list">
          {(expanded ? westernStandings : westernStandings.slice(0, 10)).map((item) => (
            <li key={item.team.id} className="team-row">
              <span className="rank">{item.conference.rank}.</span>
              <img
                className="standings__logo"
                src={getValidLogo(item.team)}
                alt={item.team.nickname}
                onError={(e) => (e.target.src = "/fallback-image.png")}
              />
              <div className="team-info">
                <span className="team-name">{item.team.nickname}</span>
                <span className="team-record">{item.conference.win}W {item.conference.loss}L</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Toggle Button */}
    <button className="expand-button" onClick={() => setExpanded(!expanded)}>
      {expanded ? "Show Top 10 Teams" : "Show All 15 Teams"}
    </button>
  </div>
  );
}

export default Standings;
