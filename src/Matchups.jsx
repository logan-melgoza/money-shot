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

  const brokenLogos = {
    "https://upload.wikimedia.org/wikipedia/fr/thumb/4/4f/Thunder_d%27Oklahoma_City_logo.svg/1200px-Thunder_d%27Oklahoma_City_logo.svg.png": "https://logodownload.org/wp-content/uploads/2021/07/oklahoma-city-thunder-logo-0.png",
    "https://upload.wikimedia.org/wikipedia/fr/3/34/Bucks2015.png": "https://upload.wikimedia.org/wikipedia/sco/4/4a/Milwaukee_Bucks_logo.svg",
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
    try {
      const response = await fetch("https://api-nba-v1.p.rapidapi.com/games", {
        method: "GET",
        headers: {
          "x-rapidapi-key": "8db8bcee80mshe14a4768570a065p17461ejsna40d19c36a19",
          "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch matchups: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (!data || !data.response) {
        throw new Error("Invalid API response");
      }
  
      // Filter only necessary matchup data
      const formattedMatchups = data.response.map((game) => ({
        id: game.id,
        teams: game.teams,
        visitorRecord: game.scores.visitors,
        homeRecord: game.scores.home,
      }));
  
      return formattedMatchups;
    } catch (error) {
      console.error("Error fetching matchups:", error);
      return [];
    }
  };

  const handleMatchupClick = async (game) => {
    setSelectedStat("points"); // ✅ Reset stat selection when opening new modal

    const fetchTeamStats = async (teamId) => {
      const cachedStats = localStorage.getItem(`teamStats-${teamId}`);
      const cachedTimestamp = localStorage.getItem(`teamStatsTimestamp-${teamId}`);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      if (cachedStats && cachedTimestamp && now - Number(cachedTimestamp) < oneDay) {
        console.log(`Using cached stats for team ${teamId}`);
        return JSON.parse(cachedStats);
      }

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

        const stats = statsData.response;
        const gamesPlayed = stats.games ?? 1;
        const perGameStats = {
          points: (stats.points / gamesPlayed).toFixed(1),
          rebounds: (stats.totReb / gamesPlayed).toFixed(1),
          assists: (stats.assists / gamesPlayed).toFixed(1),
          steals: (stats.steals / gamesPlayed).toFixed(1),
          blocks: (stats.blocks / gamesPlayed).toFixed(1),
          turnovers: (stats.turnovers / gamesPlayed).toFixed(1),
          fgPercentage: stats.fgp,
          ftPercentage: stats.ftp,
          threePtPercentage: stats.tpp,
        };

        localStorage.setItem(`teamStats-${teamId}`, JSON.stringify(perGameStats));
        localStorage.setItem(`teamStatsTimestamp-${teamId}`, now.toString());

        return perGameStats;
      } catch (error) {
        console.error(`Error fetching stats for team ${teamId}:`, error);
        return null;
      }
    };

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
                <p>({selectedGame.visitorRecord.wins}-{selectedGame.visitorRecord.losses})</p>
              </div>

              <div className="team-box">
                <img src={brokenLogos[selectedGame.teams.home?.logo] || selectedGame.teams.home.logo} alt={selectedGame.teams.home.nickname} className="team-logo" />
                <h2>{selectedGame.teams.home.nickname}</h2>
                <p>({selectedGame.homeRecord.wins}-{selectedGame.homeRecord.losses})</p>
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

            {/* Bar Chart */}
            {selectedGame?.visitorStats && selectedGame?.homeStats && (
              <Bar
                key={selectedGame.teams.visitors.id + selectedGame.teams.home.id + selectedStat}
                data={{
                  labels: [
                    selectedGame.teams.visitors.nickname,
                    selectedGame.teams.home.nickname
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
                        ({game.visitorRecord.wins}-{game.visitorRecord.losses})
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
                        ({game.homeRecord.wins}-{game.homeRecord.losses})
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="game-location">
                    {game.arena?.name ?? "Unknown Arena"}, {game.arena?.city ?? "Unknown City"}
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