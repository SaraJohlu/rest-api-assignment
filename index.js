import express from "express"
import cors from "cors"

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
    {title: "Tomb Rider", genre: "action-adventure, RPG"},
    {title: "Uncharted 2: Among thieves", genre: "Action-adventure"},
    {title: "Resident Evil", genre: "Survivor horror game"},
    {title: "Gran Turismo 2", genre: "Racing-simulation"},  
];


app.get("/", (req,res) => {
    res.send("Game recommander for PS")
});

// Slumpar fram ett av spelen som en rekomendation.
app.get("/api/game", (req,res) => {
    const reqGames = games[Math.floor(Math.random() * games.length)];
    res.json(reqGames)
})

app.post("/api/test", (req,res) => {
    res.json()
})
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT} currently running`);
});

