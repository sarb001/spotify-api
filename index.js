
import express from 'express';
import dotenv from 'dotenv'
import SpotifyRouter from './Routes/SpotifyRoute.js';
import cookieParser from 'cookie-parser';

dotenv.config({
    path : process.env.NODE_ENV  === 'production' ? '.env.production' : '.env.development'
});

console.log('cur env =',process.env.NODE_ENV);

const app  = express();

const AllowedOrigin =  process.env.REDIRECT_URI;
console.log(' Origin url =',AllowedOrigin);

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
