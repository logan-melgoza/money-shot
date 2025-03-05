import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import "./Matchups.css";

function Matchups() {
  const [matchups, setMatchups] = useState([]);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState("points");
  const [teamStatsCache, setTeamStatsCache] = useState(() => {
    const storedStats = localStorage.getItem("teamStatsCache");
    return storedStats ? JSON.parse(storedStats) : {};
  });

  const brokenLogos = {
    "https://upload.wikimedia.org/wikipedia/fr/thumb/4/4f/Thunder_d%27Oklahoma_City_logo.svg/1200px-Thunder_d%27Oklahoma_City_logo.svg.png" : "https://logodownload.org/wp-content/uploads/2021/07/oklahoma-city-thunder-logo.png",
    "https://upload.wikimedia.org/wikipedia/fr/3/34/Bucks2015.png" : "https://upload.wikimedia.org/wikipedia/sco/4/4a/Milwaukee_Bucks_logo.svg",
    "https://upload.wikimedia.org/wikipedia/fr/thumb/1/1c/Miami_Heat_-_Logo.svg/1200px-Miami_Heat_-_Logo.svg.png" : "https://upload.wikimedia.org/wikipedia/en/f/fb/Miami_Heat_logo.svg",
    "https://upload.wikimedia.org/wikipedia/fr/b/bd/Orlando_Magic_logo_2010.png" : "https://upload.wikimedia.org/wikipedia/en/thumb/1/10/Orlando_Magic_logo.svg/2560px-Orlando_Magic_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/fr/4/48/76ers_2016.png" : "https://upload.wikimedia.org/wikipedia/commons/e/eb/Philadelphia-76ers-Logo-1977-1996.png",
    "https://upload.wikimedia.org/wikipedia/fr/0/0e/San_Antonio_Spurs_2018.png" : "https://loodibee.com/wp-content/uploads/san-antonio-spurs-logo-symbol.png"
   };


  useEffect(() => {
    const cachedData = localStorage.getItem("matchupData");
    const cachedTimestamp = localStorage.getItem("matchupsTimestamp");
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
  
    if (cachedData && cachedTimestamp && now - Number(cachedTimestamp) < oneDay) {
      setMatchups(JSON.parse(cachedData));
      console.log("Using cached matchups data");
    } else {
      fetchMatchups().then((data) => {
        if (data) {
          localStorage.setItem("matchupData", JSON.stringify(data));
          localStorage.setItem("matchupsTimestamp", now.toString());
          setMatchups(data);
        }
      });
    }
  }, []);

  const fetchMatchups = async () => {
    // const tomorrow = new Date();
    // tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = new Date().toISOString().split("T")[0];

    const matchupsURL = `https://api-nba-v1.p.rapidapi.com/games?date=${formattedDate}`;
    const standingsURL = 'https://api-nba-v1.p.rapidapi.com/standings?league=standard&season=2024';
    const options = {
      method: 'GET',
	    headers: {
		    'x-rapidapi-key': '8db8bcee80mshe14a4768570a065p17461ejsna40d19c36a19',
		    'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com'
	    }
    };
    try {
      const [matchupsResponse, standingsResponse] = await Promise.all([
        fetch(matchupsURL, options),
        fetch(standingsURL, options),
      ]);
  
      if (!matchupsResponse.ok || !standingsResponse.ok) {
        throw new Error(`Failed to fetch data: ${matchupsResponse.status}, ${standingsResponse.status}`);
      }
  
      const matchupsData = await matchupsResponse.json();
      const standingsData = await standingsResponse.json();
  
      if (!matchupsData || !matchupsData.response || matchupsData.response.length === 0) {
        console.warn("No matchups found for the given date.");
        return [];
      }
      if (!standingsData || !standingsData.response || standingsData.response.length === 0) {
        console.warn("No standings data available.");
        return [];
      }
      
      console.log("Matchups API Data:", matchupsData.response);
      console.log("Standings API Data:", standingsData.response);

      // Create a map of team IDs to their records
      const teamRecords = {};
      standingsData.response.forEach(team => {
          teamRecords[team.team.id] = `${team.win.total}W ${team.loss.total}L`;
      });
  
      // Filter only necessary matchup data
      const formattedMatchups = matchupsData.response.map((game) => ({
        id: game.id,
        teams: game.teams,
        visitorRecord: teamRecords[game.teams.visitors.id] ?? "-",
        homeRecord: teamRecords[game.teams.home.id] ?? "-",
        arena: game.arena?.name ?? "Unknown Arena",
        city: game.arena?.city ?? "Unknown City"
    }));
  
      return formattedMatchups;
    } catch (error) {
      console.error("Error fetching matchups:", error);
      return [];
    }
  };

  const fetchTeamStats = async (teamId) => {
    console.log(`fetchTeamStats called for team: ${teamId}`);
    if (teamStatsCache[teamId]) {
      console.log(`Using cached stats for team ${teamId}`);
      return teamStatsCache[teamId];
    }

    const cachedStats = localStorage.getItem(`teamStats-${teamId}`);
    const cachedTimestamp = localStorage.getItem(`teamStatsTimestamp-${teamId}`);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (cachedStats && cachedTimestamp && now - Number(cachedTimestamp) < oneDay) {
      const parsedStats = JSON.parse(cachedStats);
      setTeamStatsCache((prev) => {
        const updatedCache = { ...prev, [teamId]: parsedStats };
        localStorage.setItem("teamStatsCache", JSON.stringify(updatedCache)); // ✅ Save entire cache
        return updatedCache;
      }); // ✅ Store in state
      return parsedStats;;
    }

    console.log(`Fetching fresh stats for team ${teamId} from API...`);

    const statsUrl = `https://api-nba-v1.p.rapidapi.com/teams/statistics?id=${teamId}&season=2024`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "8db8bcee80mshe14a4768570a065p17461ejsna40d19c36a19",
        "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
      },
    };

    try {
      const response = await fetch(statsUrl, options);
      if (!response.ok) {
        throw new Error(`Stats request failed with status ${response.status}`);
      }
      const statsData = await response.json();
      
      if (!statsData || !statsData.response || Object.keys(statsData.response).length === 0) {
        console.warn(`No stats found for team ${teamId}`);
        return null; // ✅ Return null instead of breaking the app
      }

      const stats = statsData.response?.[0];

      console.log(`Raw Stats Data for Team ${teamId}:`, stats);

      if (!stats || !stats.games) {
        console.warn(`No valid stats found for team ${teamId}`);
        return null;  // Prevents NaN values from being passed
      }
      
      const gamesPlayed = stats.games > 0 ? stats.games : 1;  // Ensures no division by zero
      const perGameStats = {
        points: stats.points ? parseFloat((stats.points / gamesPlayed).toFixed(1)) : 0,
        rebounds: stats.totReb ? parseFloat((stats.totReb / gamesPlayed).toFixed(1)) : 0,
        assists: stats.assists ? parseFloat((stats.assists / gamesPlayed).toFixed(1)) : 0,
        steals: stats.steals ? parseFloat((stats.steals / gamesPlayed).toFixed(1)) : 0,
        blocks: stats.blocks ? parseFloat((stats.blocks / gamesPlayed).toFixed(1)) : 0,
      };
      
      console.log(`Processed Stats for Team ${teamId}:`, perGameStats);

      localStorage.setItem(`teamStats-${teamId}`, JSON.stringify(perGameStats));
      localStorage.setItem(`teamStatsTimestamp-${teamId}`, Date.now().toString());

      console.log("Final Processed Stats for Selected Game:", {
        visitorStats,
        homeStats
      });

      setTeamStatsCache((prev) => {
        const updatedCache = { ...prev, [teamId]: perGameStats };
        localStorage.setItem("teamStatsCache", JSON.stringify(updatedCache)); // ✅ Save updated cache
        return updatedCache;
      });

      return perGameStats;
    } catch (error) {
      console.error(`Error fetching stats for team ${teamId}:`, error);
      return null;
    }
  };


  const handleMatchupClick = async (game) => {
    if (selectedGame && selectedGame.id === game.id) {
      setIsModalOpen(true);
      return;
    }
  
    setSelectedStat("points"); // ✅ Reset stat selection when opening new modal
  
    console.log("Calling fetchTeamStats for teams:", game.teams.visitors.id, game.teams.home.id);
  
    const [visitorStats, homeStats] = await Promise.all([
      fetchTeamStats(game.teams.visitors.id),
      fetchTeamStats(game.teams.home.id),
    ]);
  
    if (!visitorStats || !homeStats) {
      console.error("Stats missing, not updating modal.");
      return;
    }
  
    setSelectedGame({
      ...game,
      visitorStats,
      homeStats,
    });
  
    setIsModalOpen(true);
  };

  return (
    <>
      {isModalOpen && selectedGame && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content">
            <div className="modal-teams">
              <div className="team-box">
                <img src={brokenLogos[selectedGame.teams.visitors?.logo] || selectedGame.teams.visitors.logo} alt={selectedGame.teams.visitors.nickname} className="team-logo" />
                <h2>{selectedGame.teams.visitors.nickname}</h2>
                <p>({selectedGame.visitorRecord})</p>
              </div>

              <div className="team-box">
                <img src={brokenLogos[selectedGame.teams.home?.logo] || selectedGame.teams.home.logo} alt={selectedGame.teams.home.nickname} className="team-logo" />
                <h2>{selectedGame.teams.home.nickname}</h2>
                <p>({selectedGame.homeRecord})</p>
              </div>
            </div>

            {/* Stat Selection Tabs */}
            <div className="stat-tabs">
              {["points", "rebounds", "assists", "steals", "blocks"].map((stat) => (
                <button
                  key={stat}
                  className={`stat-tab ${selectedStat === stat ? "active" : ""}`}
                  onClick={() => setSelectedStat(stat)}
                >
                  {stat.toUpperCase()}
                </button>
              ))}
            </div>
            
            {/* Debugging Logs */}
            {console.log("Selected Game Stats:", selectedGame)}
            {console.log("Visitor Stats:", selectedGame?.visitorStats)}
            {console.log("Home Stats:", selectedGame?.homeStats)}
            {console.log("Selected Stat:", selectedStat)}
            {console.log("Visitor Stat Value:", selectedGame?.visitorStats?.[selectedStat])}
            {console.log("Home Stat Value:", selectedGame?.homeStats?.[selectedStat])}

            {/* Bar Chart */}
            {selectedGame?.visitorStats && selectedGame?.homeStats && (
                <>
                  {/* 🔍 Debugging: Log the final chart data */}
                  {console.log("Final Chart Data:", {
                    labels: [
                      selectedGame.teams.visitors.nickname,
                      selectedGame.teams.home.nickname,
                    ],
                    datasets: [
                      {
                        label: selectedStat.toUpperCase(),
                        data: [
                          selectedGame.visitorStats[selectedStat] ?? 0,
                          selectedGame.homeStats[selectedStat] ?? 0,
                        ],
                      },
                    ],
                  })}

                  <Bar
                    key={`${selectedGame.id}-${selectedStat}`}  // Forces re-render when stat changes
                    data={{
                      labels: [
                        selectedGame.teams.visitors.nickname,
                        selectedGame.teams.home.nickname,
                      ],
                      datasets: [
                        {
                          label: selectedStat.toUpperCase(),
                          data: [
                            selectedGame.visitorStats[selectedStat] ?? 0,
                            selectedGame.homeStats[selectedStat] ?? 0,
                          ],
                          backgroundColor: ["#36A2EB", "#FF6384"],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </>
              )}
            <button className="close-button" onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}

      <div className="matchups-container">
          <h2>nba matchups</h2>
          {matchups.length > 0 ? (
            <div className="matchups-grid">
              {matchups.map((game) => (
                <div key={game.id} className="matchup-card" onClick={() => handleMatchupClick(game)}>
                  {/* Away Team */}
                  <div className="team">
                    <img
                      src={brokenLogos[game.teams.visitors?.logo] || game.teams.visitors?.logo || "/placeholder.png"}
                      alt={game.teams.visitors?.nickname ?? "Unknown Team"}
                      className="team-logo"
                    />
                    <div className="team-info">
                      <span className="team-name">{game.teams.visitors?.nickname ?? "Unknown Team"}</span>
                      <span className="team-record">
                        ({game.visitorRecord})
                      </span>
                    </div>
                  </div>

                  {/* Home Team */}
                  <div className="team">
                    <img
                      src={brokenLogos[game.teams.home?.logo] || game.teams.home?.logo || "/placeholder.png"}
                      alt={game.teams.home?.nickname ?? "Unknown Team"}
                      className="team-logo"
                          />
                    <div className="team-info">
                      <span className="team-name">{game.teams.home?.nickname ?? "Unknown Team"}</span>
                      <span className="team-record">
                        ({game.homeRecord})
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="game-location">
                  {game.arena}, {game.city}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-games">No games available</p>
          )}
      </div>
    </>
  );
}

export default Matchups;