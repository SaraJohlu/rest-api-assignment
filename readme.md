# API dokumentation
API - Spelrekommendation PS Spel. 
Base URL http://localhost:3002

## Endpoints (REST-API)

### 1: GET / (Hämta API status)

Retunerar startsida. I detta fall Game recommander for PS.

### 2: GET /api/games (Hämta slumpmässigt spel från databasen)

Retunerar ett rekommenderat spel utifrån den lista som är sparad i databasen. 
Exempel: "Title": "Red dead redemption", "Genre": "Action-adventure, western"

### 3: POST /api/games
För att lägga till nytt spel i databasen. 

Headers:
content-type: application/json

Body:
{
    "title": "Silent Hill",
    "genre": "Horror"
}

Vid en lyckad inmatning:
{
    "message": "Silent Hill tillagt",
    "game": {
        "title": "Silent Hill",
        "genre": "Horror"
    }
}

Vid olyckad inmatning: 
{
    "error": "Behöver titel och genre"
}

### Felhanteringar 

HTTP statuskoder: 

200: OK Lyckad förfrågan
400: Bad request, saknade fält i POST /api/games 

Om en förfrågan misslyckas retuneras ett JSON error meddelande. 

### Noteringar

