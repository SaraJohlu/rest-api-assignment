import express from "express"
import cors from "cors"
import sqlite3 from "sqlite3"; 
import path from "path"; 
import fetch from "node-fetch";
import { fileURLToPath } from 'url'; // Importerar fileURLToPath

const filename = fileURLToPath(import.meta.url); //Tar fram filnamnet
const dirname = path.dirname(filename); // Tar fram mappen där filen ligger i.

const mydataPath = path.join(dirname, 'mydatabase.db'); // Skapar eller öppnar databasen i samma mapp som index.js

const db = new sqlite3.Database(mydataPath, (err) => { // Skapar och öppnar databasen
    if (err) {
        console.error("Kunde inte öppna databasen:", err.message);
    } else {
        console.log("Databasen är öppen och klar!");
    }
});


const app = express();
const PORT = 3002;

app.use(cors()); //Tillåter frontend att göra förfrågningar 
app.use(express.json()); //Omvandlar till JSON svar från API 

//Speldata, titlar, genre på ps. 
const games = [
    {title: "The Last Of Us 2", genre: "action-adventure"},
    {title: "Grand Theft Auto V", genre: "action-adventure, open world first person"},
    {title: "Red Dead Redemption 2", genre: "survival western game, open world"},
    {title: "God of War", genre: "action-adventure, RPG"},
    {title: "Metal Gear Solid", genre: "Stealth game, shooter game"},
    {title: "Final Fantasy VII", genre: "RPG fantasy"},
    {title: "Tomb Raider", genre: "action-adventure, RPG"},
    {title: "Uncharted 2: Among thieves", genre: "Action-adventure"},
    {title: "Resident Evil", genre: "Survivor horror game"},
    {title: "Gran Turismo 2", genre: "Racing-simulation"},  
];

// ---------------REST API MED EXPRRSS---------------------------------------
//Hem
app.get("/", (req,res) => {
    res.send("Game recommander for PS")
});

// Slumpar fram ett av spelen som en rekomendation.
app.get("/api/game", (req,res) => {
    const reqGames = games[Math.floor(Math.random() * games.length)];
    res.json(reqGames)
});

// Hämta hela listan med rekommenderade spel 

app.get("/api/allGames", (req,res) => {
    const allGames = games;
    res.json(allGames)
})

// POST för att lägga till ett spel 
app.post("/api/game", (req,res) => {
    const {title, genre} = (req.body);

    //Om man inte skrivit in en titel eller genre får man ett felmeddelande. 
        if (!title || !genre){
            return res.status(400).json({error: "Behöver en titel och genre"});
        }
    
    // Deklarerar en variabel för att lägga till nytt spel i rekommendations-listan. 
        const addNewGame = {title, genre};
        games.push(addNewGame);
    
    console.log(req.body);
    res.json({message:`${req.body.title} tillagt`})
    console.log('Spel tillagt:', { title, genre });
});


// ------------------ För att hämta från databasen ----------------------------------------------------
//Hämta från databasen
app.get('/api/game', (req, res) => {
    const query = 'SELECT * FROM games'; // SQL query
    db.all(query, (err, rows) => { // Hämtar alla rader från databasen
        if (err) {
            res.status(500).json({ error: err.message }); // vid fel
            return ("Kunde inte hämta");
        }
        res.json(rows); // Returnerar alla rader
    });
});

// Göra en post request
app.post('/games', (req, res) => {
    const query = 'INSERT INTO Games (title, genre) VALUES (?, ?, ?)'; // SQL query
    const {title, genre} = req.body; // Hämtar spel från databasen
    db.run(query, [title, genre], function(err) { // Lägger till en rad i databasen
        if (err) {
            res.status(500).json({ error: err.message }); // vid fel
            return;
        }
        res.json({ id: this.lastID }); // Returnerar id för den nya raden
    });
});

// ------------------ Hämta data från API REST SERVER med SQLite3 ----------------------------------------------------

app.get("/api/fetch-games", async (req, res) => {
    try {
        const response = await fetch("http://localhost:3002/games");
        const games = await response.json();

        games.forEach((game) => {
            db.run(
                "INSERT INTO Games (title, genre) VALUES (?, ?, ?)",
                [game.title, game.genre],
                (err) => {
                    if (err) {
                        console.error("Fel vid insättning:", err.message);
                    }
                }
            );
        });

        res.json({ message: "Data har hämtats och sparats i databasen!" });
    } catch (error) {
        console.error("Fel vid API-hämtning:", error);
        res.status(500).json({ error: "Kunde inte hämta data" });
    }
});

// ------------------ Hämta datan från SQLite ----------------------------------------------------
app.get("/games-from-db", (req, res) => {
    db.all("SELECT * FROM Games", games, (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: "Kunde inte hämta användare" });
        } else {
            res.json(rows);
        }
    });
});


// --------------- Skapa Tabellen i databasen -------------------------------------------------
db.run(
    `CREATE TABLE IF NOT EXISTS Games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    genre TEXT NOT NULL
);`, (err) => {
    if (err) {
        console.error("Kunde inte skapa tabellen:", err.message);
    } else {
        console.log("Tabellen 'Games' är skapad eller redan finns.");
    }
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT} currently running`);
});

