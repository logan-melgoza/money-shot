# 🏀 Money Shot  
**ACM Winter 2025 Project Series Submission**  

## 📌 Overview  
**Money Shot** is an interactive web application designed to provide NBA fans with real-time matchup data, team statistics, and visual comparisons of team performance. The project uses data from the **NBA API** to display upcoming games, team standings, and historical performance metrics in an engaging and user-friendly format.  

## 🚀 Features  
✔️ **Daily NBA Matchups** – View upcoming games with team records and locations.  
✔️ **Interactive Matchup Cards** – Click on a game to reveal in-depth stats.  
✔️ **Dynamic Bar Charts** – Compare teams’ season averages with an easy-to-read visualization.  
✔️ **Stat Filtering** – Toggle between key statistics such as Points, Rebounds, Assists, Steals, and Blocks.  
✔️ **Cached API Data** – Stores API responses locally to reduce unnecessary API calls.  
✔️ **Optimized UI/UX** – Dark-themed interface with smooth animations for an immersive experience.  

## 🛠 Tech Stack  
- **Frontend:** React.js, Chart.js, CSS  
- **Backend/Data:** NBA API (RapidAPI)  
- **State Management:** React Hooks (useState, useEffect)  
- **Caching:** LocalStorage  

## 📥 Installation & Setup  
Follow these steps to get the project running locally:

### **1. Clone the Repository**  
```bash
git clone https://github.com/your-username/money-shot.git
cd money-shot
```
### **2. Install Dependecies**

```bash
npm install
```

### **3. Set Up API Keys**
- Sign up for an API key from [RapidAPI - NBA API](https://rapidapi.com/)
- Create a .env file in the root directory and add:
```env
REACT_APP_NBA_API_KEY=your_api_key_here
```

### **4. Start the Development Server**
```bash
npm start
```
This will launch the project at http://localhost:5173/.

## 🎮 Usage Guide
- **Homescreen:** Displays NBA standings and upcoming matchups.  
- **Click a Matchup Card:** Opens a detailed modal with team comparisons  
- **Switch Stats:** Use the stat seleciton tabs to toggle between different metrics  
- **Close Modal:** Click anywhere outside the popup or press the "Close" button.

## 🔮 Future Improvements
### 🚀 Possible enhancements include:
- **Live Score Updates** during matches.  
- **Player-Specific Stats** for deeper insights.  
- **Game Predictions & AI Analysis** for betting and fantasy sports insights.

## 👥 Contributors
- **Logan Melgoza -** [GitHub](https://github.com/logan-melgoza)  
- **Luis Mendoza -** [GitHub](https://github.com/luismendoza25) 
- **Aryan Vashishta -** [GitHub](https://github.com/avash124)
