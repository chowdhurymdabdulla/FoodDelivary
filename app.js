import express from 'express' 
import mongoose from 'mongoose' 
import userRoutes from './routes/userRoutes' 
import authRoutes from './routes/authRoutes' 

import http from 'http'
import path from 'path'
import socketIO from 'socket.io'
import {LocalStorage} from 'node-localstorage'
import iplocate from 'node-iplocate'
import publicIP from 'public-ip'
import news from './model/news'

/* App */
const app=express()
// const port = 5000
app.set('port', process.env.PORT||5000)
app.use(express.static(path.join(__dirname,'views/partials')))
const fs = require('fs');

let server = http.createServer(app).listen(app.get('port'), ()=>{
    console.log("express app is up on ", app.get('port'))
})

/* Mongoose */
mongoose.connect('mongodb://127.0.0.1:27017/edureka',{useUnifiedTopology:true,useNewUrlParser:true}) 
const connection=mongoose.connection; 
connection.once('open',()=>{ 
console.log("MongoDB is connected") 
}) 

/* user location (using IP) */
//ref: https://www.npmjs.com/package/node-iplocate
publicIP.v4()
.then(ip=>{
    iplocate(ip)
        .then((results)=>{
            localstorage.setItem('userCity', results.city)
        })
})

/* App Configurations */
app.use('/api',userRoutes)  
app.use('/auth',authRoutes) 
app.use(express.static('public'));
app.set('view engine','ejs') 

app.get('/',(request,response)=>{ 

    /* Weather API */
    // reference: https://codeburst.io/build-a-simple-weather-app-with-node-js-in-just-16-lines-of-code-32261690901d
    const req = require('request');

    let city = localstorage.getItem('userCity')
    
    let apiKey = '35a80d795120787907186d4ed2c82cac'
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`

    req(url, function (err, res, body) {
        if(err){
            console.log('error:', error);
        } else {
            // Weather API Info: https://openweathermap.org/current
            let weather = JSON.parse(body)       

            // Weather tempearture
            let temp = weather.main.temp
            temp = ((temp - 273.15) * 9/5 + 32).toFixed(1)

            // Weather background image
            let icon = weather.weather[0].icon //list of icons: https://openweathermap.org/weather-conditions
            let backgroundUrl = 'https://images.unsplash.com/photo-1494243762909-b498c7e440a9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
            switch (icon) {
                case '01d':
                    backgroundUrl = 'https://images.unsplash.com/photo-1527722123791-ac58199069df?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1051&q=80'
                    break;
                case '02d':
                    backgroundUrl = 'https://images.unsplash.com/photo-1544829728-e5cb9eedc20e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
                    break;
                case '03d':
                    backgroundUrl = 'https://images.unsplash.com/photo-1543226862-39202f29696f?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
                    break;
                case '04d':
                    backgroundUrl = 'https://images.unsplash.com/photo-1608237937006-7ca85a8973d9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1051&q=80'
                    break;
                case '09d':
                    backgroundUrl = 'https://images.unsplash.com/photo-1433863448220-78aaa064ff47?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80'
                    break;
                case '10d':
                    backgroundUrl = 'https://images.unsplash.com/photo-1486016006115-74a41448aea2?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1047&q=80'
                    break;
                case '11d':
                    backgroundUrl = 'https://images.unsplash.com/photo-1561485132-59468cd0b553?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=948&q=80'
                    break;
                case '13d':
                    backgroundUrl = 'https://images.unsplash.com/photo-1487383298905-ee8a6b373ff9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
                    break;
                case '50d':
                    backgroundUrl = 'https://images.unsplash.com/photo-1564639580159-74150c717f25?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1050&q=80'
                    break;
                case '01n':
                    backgroundUrl = 'https://images.unsplash.com/photo-1477005264461-b0e201668d92?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
                    break;
                case '02n':
                    backgroundUrl = 'https://images.unsplash.com/photo-1573328708455-0969ec5b0efa?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1051&q=80'
                    break;
                case '03n':
                    backgroundUrl = 'https://images.unsplash.com/photo-1499578124509-1611b77778c8?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1055&q=80'
                    break;
                case '04n':
                    backgroundUrl = 'https://images.unsplash.com/photo-1594156596782-656c93e4d504?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=375&q=80'
                    break;
                case '09n':
                    backgroundUrl = 'https://images.unsplash.com/photo-1536598315365-c7bae6fd4328?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
                    break;
                case '10n':
                    backgroundUrl = 'https://images.unsplash.com/photo-1428592953211-077101b2021b?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=967&q=80'
                    break;
                case '11n':
                    backgroundUrl = 'https://images.unsplash.com/photo-1566996675874-f00a61522322?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1028&q=80'
                    break;
                case '13n':
                    backgroundUrl = 'https://images.unsplash.com/photo-1478265409131-1f65c88f965c?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=375&q=80'
                    break;
                case '50n':
                    backgroundUrl = 'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=333&q=80'
                    break;
                default:
                    break;      
            }
            
            /* 3 Latest News */
            var lastest3 = news.find().sort({date:-1}).limit(3)
            lastest3.find({}, function(err, result) {
                if(err) throw err
                response.render('index', {error: request.query.valid?request.query.valid:'', "news": result, weather, backgroundUrl, temp})
            })
        }
    });  
}) 


app.get('/sports',(request,response)=>{ 
    fs.readFile('./data/soccerData.json', (err, sportData) =>{
        if (err) 
            throw err;
        let leagueInfo = JSON.parse(sportData);

        fs.readFile('./data/soccerNews.json', (err, newsData) =>{
        if (err)
            throw err;
        let sportNews = JSON.parse(newsData);
            console.log(leagueInfo.soccer_results.games[1].logo)
            response.render('sports', {'league': leagueInfo, 'news': sportNews})
        });
    }); 
}) 

app.get('/aboutUs',(request,response)=>{ 
    response.render('aboutUs') 
}) 

app.get('/contactUs',(request,response)=>{ 
    response.render('contactUs') 
}) 


/* Chat Window */

let localstorage = new LocalStorage('./Scratch')
let io = socketIO(server)

io.sockets.on('connection', (socket)=>{
    let list = socket.client.conn.server.clients
    let users = Object.keys(list)

    // Consume my events with labels
    socket.on('nick', (nick)=>{
        socket.nickname = nick
        socket.emit('userList', users)
    })

    socket.on('send', (data)=>{
        publicIP.v4()
            .then(ip=>{
                iplocate(ip)
                    .then((result)=>{
                        let city = JSON.stringify(result.city, null, 2)
                        localstorage.setItem('userLocal', city)
                    })
            })

        let nickname = socket.nickname?socket.nickname:'';
        if(nickname){
            let payload = {
                message:data.message,
                nick:nickname,
                location:localstorage.getItem('userLocal')
            }
    
            socket.emit('send', payload)
            socket.broadcast.emit('send', payload)
        }
    })
})


/* Admin */


app.get('/admin',(request,response)=>{ 
    response.render('index2', {error: request.query.valid?request.query.valid:''}) 
}) 

app.get('/register',(request,response)=>{ 
    response.render('register') 
}) 

