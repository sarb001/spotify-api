import express from 'express'
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({
    path : process.env.NODE_ENV  === 'production' ? '.env.production' : '.env.development'
});

const router = express.Router();


router.get('/login' , async(req,res) => {
    try {
         const Scope = 'user-read-private user-read-email user-top-read user-read-currently-playing user-read-playback-state user-modify-playback-state';
        
         const Authurls = `${process.env.SPOTIFY_OAUTH_URL}?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=${Scope}&access_type=offline&prompt=consent`;

         console.log('auth url -',Authurls);
         res.redirect(Authurls);

    } catch (error) {
        console.log('auth url failed -',error);
        res.status(500).json({
            message : "Auth url failed"
        })
    }
})

router.get('/callback' , async(req,res) => {
        try {
            const code = req?.query?.code || ""
            console.log('query code',code);

                const Response = await axios.post(process.env.SPOTIFY_TOKENURL,{
                    code : code,
                    grant_type : 'authorization_code',
                    redirect_uri : process.env.REDIRECT_URI,
                    client_id : process.env.CLIENT_ID ,
                    client_secret : process.env.CLIENT_SECRET,
                     } , {  headers : {  'Content-Type' : 'application/x-www-form-urlencoded' } }
                );

                const Res = Response?.data;
                console.log('Response data =',Res);
                const { access_token , expires_in , refresh_token } = Response?.data;
                console.log('access token | expires-in -',{ access_token , expires_in , refresh_token });

                return res.status(200).redirect(`${process.env.ORIGIN_URL}/spotify?accesstoken=${access_token}&refreshtoken=${refresh_token}&expiresin=${expires_in}`)              

            } catch (error) {
            console.log('Failed to get token',error.response?.data?.error);
                res.status(500).json({
                message : "Failed to get Top 10  tracks"
               })
            }
})

router.get('/toptracks' , async(req,res) => {
        try {
            const Accesstoken =  req?.headers?.authorization?.split(" ")[1] ;
            console.log(' Acc token -',Accesstoken);

            if(!Accesstoken){
                return res.status(401).json({
                    success : false,
                    message : "UnAuthorized Error"
                })
            }

            const Response = await axios.get(`https://api.spotify.com/v1/me/top/tracks`,
                {
                    headers : {
                        'Content-Type' : 'application/x-www-form-urlencoded',
                        'Authorization' : `Bearer ${Accesstoken}`,           
                    },
                    params : {
                         time_range : 'medium_term',
                         limit : 10,
                         offset : 5
                    },
                }
            )


             res.status(200).json({
                message : ` Top ${Response?.data?.limit}  tracks`,
                alltracks : Response?.data?.items?.map(i => i?.name)
              })

        } catch (error) {
             console.log('top tracks error --',error?.response?.data?.error);
             res.status(500).json({
               message : "Failed to get Top 10  tracks"
            })
        }
})

router.get('/currentplaying' , async(req,res) => {
    try {

            const Accesstoken =  req?.headers?.authorization?.split(" ")[1] ;
            console.log(' acc token = ',Accesstoken);

            if(!Accesstoken){
                return res.status(401).json({
                    success : false,
                    message : "UnAuthorized Error"
                })
            }

            const Response = await axios.get(`${process.env.SPOTIFY_MAINIURL}/player/currently-playing`,{
                headers : {
                        'Authorization' : `Bearer ${Accesstoken}`,           
                        'Content-Type' : 'application/x-www-form-urlencoded',
                },
            })
            
            if(Response?.status === 204 || !Response.data){
                return res.json({ message : "No song is currently playing" })
            }
            
            const Data = Response?.data;
            return res.status(200).json({
                    name : Data?.item?.name,
                    isplaying : Data?.is_playing,
                    artists : Data?.item?.artists?.map(i => i?.name)
            })

    } catch (error) {
        console.log('current song error =',error?.response?.data.error);
          res.status(500).json({
               message : "Failed to get Current song"
            })
    }
})

router.get('/stopcurrent' , async(req,res) => {
    try {
        
            const Accesstoken =  req?.headers?.authorization?.split(" ")[1] ;
            console.log(' Token tracks -',Accesstoken);

            if(!Accesstoken){
                return res.status(401).json({
                    success : false,
                    message : "UnAuthorized Error"
                })
            }

            // const CurrentDevice = await axios.get(`${process.env.SPOTIFY_MAINIURL}/player/devices`,{
            //     headers : {
            //         'Authorization' : `Bearer ${Accesstoken}`,
            //         'Content-Type'  : 'application/json'
            //     }
            // })

            // const DeviceId = CurrentDevice?.data.devices[0]?.id;
            // console.log('Current Device  id 1 => ',DeviceId);

            // if(!DeviceId){
            //     return res.status(404).json({
            //         success : false,
            //         message : "Device Id not Present"
            //     })
            // }
            
            await axios.put(`https://api.spotify.com/v1/me/player/pause`, null ,{
                  
                       headers : {
                            'Authorization' : `Bearer ${Accesstoken}`,
                            'Content-Type'  : 'application/x-www-form-urlencoded',
                        }
            });
                    
            return res.status(200).json({
                 message : "Stopped the song",
            })

    } catch (error) {
        console.log('stop song error =',error?.response?.data.error);
          res.status(500).json({
               message : "Failed to get Current song"
            })
    }
})

 router.get('/playtopsongs' , async(req,res) => {
    try {
        
            const Accesstoken =  req?.headers?.authorization?.split(" ")[1] ;
            console.log(' Token tracks -',Accesstoken);

            if(!Accesstoken){
                return res.status(401).json({
                    success : false,
                    message : "UnAuthorized Error"
                })
            }
                // frontend -> song selected trackid and inserted here

         await axios.put('https://api.spotify.com/v1/me/player/play',
            {"uris": ["spotify:track:5UGrftqh9U3zKQUt3vs7Ob", "spotify:track:4eBvRhTJ2AcxCsbfTUjoRp"]} , 
            {
                headers : {
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${Accesstoken}`
                }
            })

            res.status(200).json({
                success : true,
                message : " Fetched & Playing All Songs "
            })

    } catch (error) {
         console.log(' play song error =',error?.response?.data.error);
          res.status(500).json({
               message : "Failed to get Current song"
        })
    }
 })

router.post('/refreshtoken' , async(req,res) => {
     try {

                const Refreshtoken = req.body;
                console.log('Refrence token =',Refreshtoken.token);
                const Reftoken = Refreshtoken.token;

                if(!Reftoken){
                    return res.status(401).json({
                        message : "UnAuthorized Error"
                    })
                }

            const Response = await axios.post(process.env.SPOTIFY_TOKENURL,{ 
                grant_type : 'refresh_token',
                refresh_token : Reftoken,
                client_id : process.env.CLIENT_ID,
                client_secret : process.env.CLIENT_SECRET,
            },{  headers : {
                    'Content-Type' : 'application/x-www-form-urlencoded'
                }
            });

            return res.status(200).json({
                accesstoken : Response?.data?.access_token,
                message : " Fetched Refresh token"
            })

     } catch (error) {
        console.log(' ref token error  =',error?.response?.data.error);
          res.status(500).json({
               message : "Failed to get Refresh token "
        })
     }
 })


export default router;