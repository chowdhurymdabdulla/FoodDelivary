import mongoose from 'mongoose' 

//define my model 
var senderSchema= mongoose.Schema({ 
    _id:{type:String},
    firstName:{type:String},
    lastName:{type:String},  
    description:{type:String} 
    
}, 
{ 
    collection:"senders" 
}) 


export default mongoose.model('sender', senderSchema)