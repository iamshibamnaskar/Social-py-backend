const mongoose=require("mongoose")

const connectDB= async ()=>{
    try{
       await mongoose.connect("mongodb+srv://shibamnskar:0ByKQgbI3BDsv06X@cluster0.4pkvq.mongodb.net/social-py")
       console.log("database connected successfully!")
    }
    catch(error){
       console.log("database is not connected! "+error)
    }
}

module.exports=connectDB