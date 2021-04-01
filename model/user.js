import mongoose from 'mongoose' 

//define my model 
var userSchema= mongoose.Schema({ 
    role: {type:String, default: "Normal"},
    name:{type:String}, 
    email:{type:String}, 
    password:{type:String}
}, 
{ 
    collection:"users" 
}) 


export default mongoose.model('user', userSchema)