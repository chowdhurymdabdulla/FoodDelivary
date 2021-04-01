import { Router, json ,urlencoded} from 'express';
import cors from 'cors' 
import user from '../model/user' 
import news from '../model/news' 
import bcrypt from 'bcryptjs' 
import jwt from 'jsonwebtoken' 
import config from '../config' 
import {LocalStorage} from 'node-localstorage' 
import alert from 'alert-node'

//defining constants 
const router = Router(); 
var corsOptions={ 
    origin:'*', 
    optionsSuccessStatus:200 
} 

router.route('/register').post(json(),urlencoded({extended:false}),cors(corsOptions), (request, response) => { 

    // var findUser = user.findOne({name:request.body.name},(err,user)=>{ 
    //     if(err) 
    //     return response.status(500).send('Oops!') 
    //     if(user){
    //         alert('Username already exists!')
    //         response.redirect('/register')
    //     }
    // })
    // console.log(findUser)
//     if(findUser == null){ 
        let hashedPassword = bcrypt.hashSync(request.body.password,8) 

        //using mongoose model 
        user.create({ 
            name:request.body.name, 
            email:request.body.email, 
            password:hashedPassword 
        },(err,user)=>{ 
        if(err) 
            return response.status(500).send('found a problem in registering user') 
        //create token 
        let token= jwt.sign({id:user.id},config.secret,{expiresIn:86400}) 
        alert('Congratulations! You are successfully registered!')
        response.redirect('/admin') 
        }) 
//     }

}); 

router.route('/login').post(json(),urlencoded({extended:false}),cors(corsOptions), (request, response) => { 
    //find from db if that user exists 
    user.findOne({name:request.body.name},(err,user)=>{ 
        if(err) 
            return response.status(500).send('found a problem in searching for user') 
        if(user == null)
            alert('Username does not exists!')
        else{ 
            const passIsValid=bcrypt.compareSync(request.body.password,user.password) 
            if(!passIsValid){
                alert('Password incorrect!')
            } 
            else {
                let token = jwt.sign({id:user.id},config.secret,{expiresIn:86400}) 
                //return response.status(200).send({auth:true,token:token}) 
                //save the token in localstorage: 
                let localStorage=new LocalStorage('./Scratch') 
                localStorage.setItem('authToken',token)
    
                //allow only authorized users to access pages
                module.exports = { authenticated: "true" };
                //direct users to the page addNews
                response.redirect('/api/addNews')
            }
        }
    })

});

router.route('/newsList').post(json(),urlencoded({extended:false}),cors(corsOptions), (request, response) => { 

    response.redirect('/api/newsList') 
}); 

export default router;