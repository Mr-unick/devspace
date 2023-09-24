
const mongoose=require("mongoose");
const pass="r1r0y3RbPyiPOS45";
const connection = async()=>{
    console.log("clalle");
try{

    await mongoose.connect(`mongodb+srv://nikhillende9121:${pass}@cluster1.s0yatl5.mongodb.net/`);
    console.log("connected succesfully");
}catch(error){
    console.log("something went wrong while connecting with database",error);
}
}

module.exports={connection};