
import express from 'express';
import dotenv from 'dotenv'
import SpotifyRouter from './Routes/SpotifyRoute.js';
import cookieParser from 'cookie-parser';
import cors  from 'cors';

dotenv.config({
    path : process.env.NODE_ENV  === 'production' ? '.env.production' : '.env.development'
});

console.log('cur env =',process.env.NODE_ENV);

const app  = express();

const AllowedOrigin =  process.env.ORIGIN_URL;
console.log(' Origin url =',AllowedOrigin);

app.use(cors({
    credentials : true,
    origin : process.env.ORIGIN_URL,
    methods:['GET','POST','PUT','DELETE']
}))

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
