import express from "express"
import cors from "cors"
import sqlite3 from "sqlite3"; 
import path from "path"; 
import fetch from "node-fetch";
import { fileURLToPath } from 'url'; // Importerar fileURLToPath

const filename = fileURLToPath(import.meta.url); //Tar fram filnamnet
const dirname = path.dirname(filename); // Tar fram mappen där filen ligger i.

const mydataPath = path.join(dirname, '..', 'mydatabase.db'); // går in i database.db
const db = new sqlite3.Database(mydataPath); // Skapar en databas

const app = express();
const PORT = 3002;

app.use(cors()); //Tillåter frontend att göra förfrågningar 
app.use(express.json()); //Omvandlar till JSON svar från API 

//Speldata, titlar, genre på ps. 
const games = [
    {id: "1", title: "The Last Of Us 2", genre: "action-adventure"},
    {id: "2", title: "Grand Theft Auto V", genre: "action-adventure, open world first person"},
    {id: "3", title: "Red Dead Redemption 2", genre: "survival western game, open world"},
    {id: "4", title: "God of War", genre: "action-adventure, RPG"},
    {id: "5", title: "Metal Gear Solid", genre: "Stealth game, shooter game"},
    {id: "6", title: "Final Fantasy VII", genre: "RPG fantasy"},
    {id: "7", title: "Tomb Raider", genre: "action-adventure, RPG"},
    {id: "8", title: "Uncharted 2: Among thieves", genre: "Action-adventure"},
    {id: "9", title: "Resident Evil", genre: "Survivor horror game"},
    {id: "10", title: "Gran Turismo 2", genre: "Racing-simulation"},  
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
    const query = 'INSERT INTO Games (id, title, genre) VALUES (?, ?, ?)'; // SQL query
    const { id, title, genre} = req.body; // Hämtar spel från databasen
    db.run(query, [id, name, genre], function(err) { // Lägger till en rad i databasen
        if (err) {
            res.status(500).json({ error: err.message }); // vid fel
            return;
        }
        res.json({ id: this.lastID }); // Returnerar id för den nya raden
    });
});

// ------------------ Hämta data från API REST SERVER med SQLite3 ----------------------------------------------------

app.get("/api/games", async (req, res) => {
    try {
        const response = await fetch("http://localhost:3002/games");
        const users = await response.json();

        games.forEach((game) => {
            db.run(
                "INSERT INTO Games (id, title, genre) VALUES (?, ?, ?)",
                [game.id, game.title, game.genre],
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
app.get("/games", (req, res) => {
    db.all("SELECT * FROM Games", [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: "Kunde inte hämta användare" });
        } else {
            res.json(rows);
        }
    });
});


app.listen(PORT, () => {
    console.log(`http://localhost:${PORT} currently running`);
});

