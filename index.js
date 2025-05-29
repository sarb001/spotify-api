import express from 'express';
import dotenv from 'dotenv'
import SpotifyRouter from './Routes/SpotifyRoute.js';
import cookieParser from 'cookie-parser';

const app  = express();

dotenv.config();

app.use(cookieParser());
app.use(express.json());

app.get('/' , (req,res) => {
    res.send(`<a href = ${'/login'}> Login with Spotify </a>`)
})

app.use('/',SpotifyRouter);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT} `)
})
