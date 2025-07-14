# ⚡ Volt EV Charging v2

🚧 **Project Status: Under Construction**  

Welcome to **Volt EV Charging v2** – an open-source platform for discovering, navigating, and managing electric vehicle (EV) charging stations. This version transitions from a basic HTML/JavaScript app to a modern stack using **React** for the frontend and **Neo4j** as the backend database, offering powerful graph-based search and routing capabilities.

---

## 🚀 Features

- 🌐 **React Frontend** – Modern UI with dynamic maps and interactions
- 🗺️ **TomTom Maps API** – Display stations, routes, and user location
- 🔗 **Neo4j Backend** – Graph database used for station connectivity and route optimization
- 🧠 **Shortest Path with Dijkstra's Algorithm** – Efficient routing to nearest or optimal charging stations
- 🧩 **EV Station Management** – Add, update, and view charging station data
- 📍 **Nearby Station Discovery** – Find available stations around your location
- ⚙️ **Modular API** – Built with Express.js

---

## 🧱 Tech Stack

| Layer        | Tech                     |
|--------------|--------------------------|
| Frontend     | React, TailwindCSS, TomTom Maps |
| Backend      | Node.js, Express.js      |
| Database     | Neo4j (with Graph Data Science) |
| Map API      | TomTom Developer API     |

---

## 📦 Installation

### Prerequisites

- Node.js (v18+)
- Neo4j Desktop or Aura DB instance
- TomTom Developer API Key

### Clone & Setup

```bash
git clone https://github.com/your-username/volt-ev-charging-v2.git
cd volt-ev-charging-v2
cd client
npm install
# Add your TomTom API key to .env
npm run dev
