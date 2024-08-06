const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const MONGO_URL = 'mongodb://127.0.0.1:27017/VOYAGEVENUEs';
 async function main(){
    await mongoose.connect(MONGO_URL);
 }
main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});
const initDB = async () =>{
  await Listing.deleteMany({});
  const defaultGeometry = {
    type: 'Point',
    coordinates: [17.008, 2.003] 
};
 initData.data= initData.data.map((obj)=>
    ({
      ...obj, owner:'66a4aacf7068d8d6de2d2067',
      geometry: defaultGeometry
    }))
  
  await Listing.insertMany(initData.data);
  console.log("data was initialised");
}
initDB();