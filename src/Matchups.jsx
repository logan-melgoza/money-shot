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
    "https://upload.wikimedia.org/wikipedia/fr/thumb/4/4f/Thunder_d%27Oklahoma_City_logo.svg/1200px-Thunder_d%27Oklahoma_City_logo.svg.png" : "https://logodownload.org/wp-content/uploads/2021/07/oklahoma-city-thunder-logo-0.png",
    "https://upload.wikimedia.org/wikipedia/fr/3/34/Bucks2015.png" : "https://upload.wikimedia.org/wikipedia/sco/4/4a/Milwaukee_Bucks_logo.svg",
    "https://upload.wikimedia.org/wikipedia/fr/thumb/1/1c/Miami_Heat_-_Logo.svg/1200px-Miami_Heat_-_Logo.svg.png" : "https://upload.wikimedia.org/wikipedia/en/f/fb/Miami_Heat_logo.svg",
    "https://upload.wikimedia.org/wikipedia/fr/b/bd/Orlando_Magic_logo_2010.png" : "https://upload.wikimedia.org/wikipedia/en/thumb/1/10/Orlando_Magic_logo.svg/2560px-Orlando_Magic_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/fr/4/48/76ers_2016.png" : "https://upload.wikimedia.org/wikipedia/commons/e/eb/Philadelphia-76ers-Logo-1977-1996.png"
   };


  useEffect (() => {
    const cachedData = localStorage.getItem('matchupData');
    const cachedTimestamp = localStorage.getItem('matchupsTimestamp');
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

  const handleMatchupClick = async (game) => {
    const fetchTeamStats = async (teamId) => {
      const cachedStats = localStorage.getItem(`teamStats-${teamId}`);
      const cachedTimestamp = localStorage.getItem(`teamStatsTimestamp-${teamId}`);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
  
      if (cachedStats && cachedTimestamp && (now - Number(cachedTimestamp)) < oneDay) {
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
        const stats = statsData.response;
  
        if (!stats || !stats.games) {
          throw new Error("Invalid stats response");
        }
  
        const gamesPlayed = stats.games;
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
  
    // Fetch stats for both teams
    const [visitorStats, homeStats] = await Promise.all([
      fetchTeamStats(game.teams.visitors.id),
      fetchTeamStats(game.teams.home.id),
    ]);
  
    setSelectedGame({
      ...game,
      visitorStats,
      homeStats,
    });
  
    setIsModalOpen(true);
  };

  const fetchMatchups = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedDate = yesterday.toISOString().split("T")[0];
  
    const gamesUrl = `https://api-nba-v1.p.rapidapi.com/games?date=${formattedDate}`;
    const standingsUrl = `https://api-nba-v1.p.rapidapi.com/standings?league=standard&season=2024`;
  
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "8db8bcee80mshe14a4768570a065p17461ejsna40d19c36a19",
        "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
      },
    };
  
    try {
      // Fetch game matchups
      const gamesResponse = await fetch(gamesUrl, options);
      if (!gamesResponse.ok) {
        throw new Error(`Games request failed with status ${gamesResponse.status}`);
      }
      const gamesData = await gamesResponse.json();
  
      // Fetch team standings
      const standingsResponse = await fetch(standingsUrl, options);
      if (!standingsResponse.ok) {
        throw new Error(`Standings request failed with status ${standingsResponse.status}`);
      }
      const standingsData = await standingsResponse.json();
  
      // Create a lookup table for team records
      const teamRecords = {};
      standingsData.response.forEach((team) => {
        teamRecords[team.team.id] = {
          wins: team.conference.win,
          losses: team.conference.loss,
        };
      });
  
      // Merge standings data into game matchups
      const enrichedMatchups = gamesData.response.map((game) => ({
        ...game,
        visitorRecord: teamRecords[game.teams.visitors.id] || { wins: "N/A", losses: "N/A" },
        homeRecord: teamRecords[game.teams.home.id] || { wins: "N/A", losses: "N/A" },
      }));
  
      setMatchups(enrichedMatchups);
      localStorage.setItem("matchupData", JSON.stringify(enrichedMatchups));
      localStorage.setItem("matchupsTimestamp", Date.now().toString());
  
      console.log("Fetched new matchups and standings for:", formattedDate);
    } catch (error) {
      console.error("Error fetching matchups or standings:", error);
      setError(error.message);
    }
  };

  return (
    <>
      {isModalOpen && selectedGame && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content">
            <div className="modal-teams">
              {/* Away Team */}
              <div className="team-box">
                <img src={brokenLogos[selectedGame.teams.visitors?.logo] || selectedGame.teams.visitors.logo} alt={selectedGame.teams.visitors.nickname} className="team-logo"/>
                <h2>{selectedGame.teams.visitors.nickname}</h2>
                <p>({selectedGame.visitorRecord.wins}-{selectedGame.visitorRecord.losses})</p>
              </div>

              {/* Home Team */}
              <div className="team-box">
                <img src={brokenLogos[selectedGame.teams.home?.logo] || selectedGame.teams.home.logo} alt={selectedGame.teams.home.nickname} className="team-logo"/>
                <h2>{selectedGame.teams.home.nickname}</h2>
                <p>({selectedGame.homeRecord.wins}-{selectedGame.homeRecord.losses})</p>
              </div>
            </div>

            {/* Insert Bar */}
            {selectedGame.visitorStats && selectedGame.homeStats && (
              <Bar
                data={{
                  labels: [selectedGame.teams.visitors.nickname, selectedGame.teams.home.nickname],
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