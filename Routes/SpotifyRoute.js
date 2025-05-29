import express from 'express'
import axios from 'axios';

const router = express.Router();

router.get('/api/v1/testing' , (req,res) => {
    console.log('testing Inside API is -');
    res.status(200).json({
        message : "Testing Inside API"
    })
})


    // login => client side only id is show  | login => wil press now 


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


router.get('/api/callback' , async(req,res) => {
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

                return res.status(200).redirect(`http://localhost:3000/toptracks?accesstoken=${access_token}&expiresin=${expires_in}`)              

            } catch (error) {
            console.log('Failed to get token',error.response?.data?.error);
                res.status(500).json({
                message : "Failed to get Top 10  tracks"
               })
            }
})

router.get('/toptracks' , async(req,res) => {
        try {
            const Accesstoken = await req?.headers?.Authorization?.split(" ")[1] ;
            console.log(' Token tracks are -',Accesstoken);

            if(!Accesstoken){
                return res.status(401).json({
                    success : false,
                    message : "UnAuthorized Error"
                })
            }

            const Response = await axios.get(`https://api.spotify.com/v1/me/top/tracks`,
                {
                    headers : {
                        'Authorization' : `Bearer ${Accesstoken}`,           
                        'Content-Type' : 'application/x-www-form-urlencoded',
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
             console.log('acces_token error --',error?.response?.data?.error);
             res.status(500).json({
               message : "Failed to get Top 10  tracks"
            })
        }
})

router.get('/currentplaying' , async(req,res) => {
    try {
        
            const Accesstoken = await req?.headers?.Authorization?.split(" ")[1] || req.cookies?.accesstoken ;
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

            console.log('Resp current song -',Response?.data?.item?.name);
            console.log('Resp current artist name -',Response?.data?.item?.artists?.map(i => i?.name));

            return res.status(200).json({
                message : "Currently Playing song",
                currentsong : Response?.data?.item?.name,
                artistname : Response?.data?.item?.artists?.map(i => i?.name)
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
            const Accesstoken = await req?.headers?.Authorization?.split(" ")[1] || req.cookies?.accesstoken ;
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
        const Accesstoken = await req?.headers?.Authorization?.split(" ")[1] || req.cookies?.accesstoken ;
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

export default router;