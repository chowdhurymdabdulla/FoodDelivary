import { Router, json, urlencoded } from 'express'; 
import cors from 'cors' 
import user from '../model/user' 
import news from '../model/news' 
import {LocalStorage} from 'node-localstorage' 
import jwt from 'jsonwebtoken' 
import config from '../config'; 
import alert from 'alert-node'

//mos part
import sender from '../model/sender' 
import { v4 as uuidv4 } from 'uuid';

/* ADMIN */

//defining constants 
const router = Router(); 
var corsOptions={ 
    origin:'*', 
    optionsSuccessStatus:200 
} 

router.route('/register').get((request, response) => { 
    response.render('register')

}); 

router.route('/addNews').get((request, response) => { 
    
    //allow only authenticated users to access the pages
    const sourceFile = require('./authRoutes')
    var authenticated = sourceFile.authenticated

    /* login part */
    let localStorage= new LocalStorage('./Scratch') 
    let token=localStorage.getItem('authToken') 
        
    if(!token) 
        return response.redirect('/admin') 
    jwt.verify(token,config.secret,(err,decoded)=>{ 
        if(err) 
            response.redirect('/admin') 
        user.findById(decoded.id,{password:0},(err,user)=>{ 
            if(err) 
                response.redirect('/admin') 
            if(!user) 
                response.redirect('/admin') 
            if(user && authenticated == "true") {
                response.render('addNews',{ user })             
            }
            else {
                response.redirect('/admin') 
            }
        }) 
    }) 
});

//add news feed
router.route('/result').post(json(),urlencoded({extended:true}),cors(corsOptions), (request, response) => {
    
    // using mongoose model 
    news.create({
        title:request.body.title,
        description:request.body.description,
        url:request.body.url,
        urlImage:request.body.urlImage,
        date:request.body.date
      },(err,news)=>{
        if(err)
            return response.status(500).send('there was a problem in adding the news')
        alert('News was successfully added.')
        response.redirect('/api/newsList') 
    })
  });

router.route('/newsList').get((request, response) => { 
    //allow only authenticated users to access the pages
    const sourceFile = require('./authRoutes')
    var authenticated = sourceFile.authenticated
    if (authenticated == "true") {
        news.find({}, function(err, news){
            if(err) {
              throw err
            } else {
                let localStorage= new LocalStorage('./Scratch') 
                let token=localStorage.getItem('authToken') 
                
                if(!token) 
                    return response.redirect('/admin') 
                jwt.verify(token,config.secret,(err,decoded)=>{ 
                    if(err) 
                        response.redirect('/admin') 
                    user.findById(decoded.id,{password:0},(err,user)=>{ 
                        if(err) 
                            response.redirect('/admin') 
                        if(!user) 
                            response.redirect('/admin') 
                        if(user) {
                            response.render('newsList',{"news": news, user})             
                        }
                    }) 
                }) 
                // response.render('newsList',{"news": news}) 
                // console.log(news)
            }
        })
    }
    else {
    response.redirect('/admin') 
    }    
}); 

router.route('/newsList/edit/:title').get((request, response) => {
    
    news.findOne({ 'title': request.params.title }, (err, data) => {
        if (err) return handleError(err);
        response.render('updateNews', {"updateData": data, user}) 
      });  
  });

  
router.route('/update').post(json(),urlencoded({extended:true}),cors(corsOptions), (request, response) => {

    news.findOneAndUpdate({
        title:request.body.title},{$set:
        {description:request.body.description,
        url:request.body.url,
        urlImage:request.body.urlImage,
        date:request.body.date}
      }
      ,(err,news)=>{
      if(err) throw err
      response.redirect('/api/newsList')
    //       return response.status(500).send('there was a problem in adding the news')
    //   response.send(' successfully added')
    //     alert('News was successfully added.')
    })
});


router.route('/newsList/delete/:title').get((request, response) => {

    //using mongoose model
    news.deleteOne({ title: request.params.title }, function (err) {
        if (err) return handleError(err);
        
        alert('News is successfully deleted.')
        response.redirect('/api/newsList') 
      });
  
  });


/* USER */

//send email
const sgMail = require('@sendgrid/mail')
const sendGridAPI = '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';

router.route('/sendEmail').post(json(),urlencoded({extended:true}),cors(corsOptions), (request, response) => {
sgMail.setApiKey(sendGridAPI)
let fName = request.body.fName;
let lName = request.body.lName;
let email = request.body.email;
let description = request.body.description;
let generatedId = uuidv4();

sender.create({
    _id: generatedId,
    firstName:fName,
    lastName:lName,  
    description:description 
    },(err,sender)=>{
    if(err)
        return response.status(500).send('there was a problem in adding the news')
    //alert('News was successfully added.')
    console.log("user addaed successfully");
})


const msg = {
    to: email, // Change to your recipient
    from: 'chowdhurymdabdulla@gmail.com', // Change to your verified sender
    subject: 'Sending with SendGrid is Fun',
    text: description,
    html: "Your requestID is: "+ generatedId +'\r\n' + "Your message has been  sent to the authority successfully. "+ '\r\n' + "And your message is "+description,
}

sgMail
    .send(msg)
    .then(() => {
        console.log('email has send succesfully');
        alert('Email sent successfully');
        response.redirect('/contactUs') 
    })
    .catch(error => {
    // Log friendly error
    alert('Please type the right data.')
    response.redirect('/contactUs')
    // console.error(error);

    if (error.response) {
        // Extract error msg
        const {message, code, response} = error;

        // Extract response msg
        const {headers, body} = response;

        console.error(body);
    }
    });
});

export default router;