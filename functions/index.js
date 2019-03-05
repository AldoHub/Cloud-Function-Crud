const functions = require('firebase-functions');
const express = require("express");
const Busboy = require("busboy"); //manage Form data
const cors = require("cors");


const app = express();

//require the admin and the keyfile
const admin = require("firebase-admin");
const serviceAccount = require("./keyfile.json");

//init the app here
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "your database url"
});

//using firestore
const db = admin.firestore();
const settings = {timestampsInSnapshots: true}; // maybe not required
db.settings(settings);

//get the collection we want to use
const collection = db.collection("phrases");

//app
app.use(cors());

//retrieve data from firestore real-time database
app.get("/documents", (req, res) => {

 let phrasesArray = [];

 collection.get()
 .then((snapshot)=>{
    snapshot.forEach( doc => {
      //push an object inside the array fpr each phrase
      phrasesArray.push({
        docID: doc.id,
        phrase: doc.data()
      });

    });
    res.status(200).json({
      message: "Database fetched successfully",
      data: phrasesArray
    });
    return true;
})
 .catch(err => {
    res.send(err);
    return false;
});

});


//send data to firestore real-time database
app.post("/documents", (req, res, next) => {
    const busboy = new Busboy({ headers: req.headers });

    // all fields
    //const fields = {};

    // process each non-file field in the form.
    busboy.on('field', (fieldname, val) => {
      //store all fields in the object
      //fields[fieldname] = val;


          if(fieldname === "phrase"){
          //field value is stored in fields[field]
            let phrase = {
              phrase : val
            }
            collection.add(phrase).then(()=>{
              console.log("phrase added");
              return true;
            }).catch(err =>{
              console.log(err);
              return false;
            });


          }else{
            console.log("nothing added");
          }



      });


    busboy.on('finish', () => {

        res.status(200).json({
            message: "Busboy has finalized the form checking"
        })

    });

      // The raw bytes of the upload will be in req.rawBody.  Send it to busboy, and get
      // a callback when it's finished.
      busboy.end(req.rawBody);
});






//function
exports.fireCrud = functions.https.onRequest(app);
