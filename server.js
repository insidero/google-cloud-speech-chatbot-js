const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
const app = express();
process.title = app;
// const upload = require('multer')({ dest: 'uploads/' });
const multer=require('multer');
const cors = require('cors');
var xhr = require('xhr');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now()+'.webm')
    }
});
var upload = multer({storage: storage});
var outputName;
// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');
// Creates a client
const client = new speech.SpeechClient();

const corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true,

}
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.post('/speechtotext', upload.single('audioFile'), function (req, res) {

// console.log('Recieved   ', req.file);

async function ConvertToOGG_OPUS(input) {
	outputName='audio-'+Date.now()+'.opus';
	const { stdout, stderr } = await exec('ffmpeg -i "'+input+'" -vn -acodec  copy "./uploads/'+outputName+'"');
	console.log('stdout:', stdout);
	console.log('stderr:', stderr);
}

ConvertToOGG_OPUS('./'+req.file.path)
  .then(function (){
    console.log(outputName);
    const config = {
      encoding: 'OGG_OPUS',
      sampleRateHertz: '48000',
      languageCode: 'en-US',
      enableWordConfidence: true,
      profanityFilter:true,
      speechContext:[{phrases:['islamabad','house','graana','properties','plot',
        'marla','kanal','crore','lac','lakh','show properties in islamabad',
        'properties for rent in islamabad']}],
    };
    
    const audio = {
      content: fs.readFileSync('./uploads/'+outputName).toString('base64'),
      // content: fs.readFileSync('./uploads/audio-1544614145153.opus').toString('base64'),
    };
  
    const request = {
      config: config,
      audio: audio,
    };
  
  // Detects speech in the audio file
    client
    .recognize(request)
    .then(data => {
      const response = data[0];
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      const confidence = response.results
        .map(result => result.alternatives[0].confidence)
        .join(`\n`);
      console.log(
        `Transcription: ${transcription} \n Confidence: ${confidence}`
      );
      
      if(response.results.alternatives.words){
      console.log(`Word-Level-Confidence:`);
      const words = response.results.map(result => result.alternatives[0]);   
      words[0].words.forEach(a => {
        console.log(` word: ${a.word}, confidence: ${a.confidence}`);
      });
    }
    res.send(''+transcription);
    })
    .catch(err => {
      console.error('ERROR:', err);
    })
  }).catch(err =>{
    console.log('err ',err);
  });
});




app.post('/speechtotextSimple', upload.single('audioFile'), function (req, res) {

  // console.log('Recieved   ', req.file);
  
  // async function ConvertToOGG_OPUS(input) {
  //   outputName='audio-'+Date.now()+'.opus';
  //   const { stdout, stderr } = await exec('ffmpeg -i "'+input+'" -vn -acodec  copy "./uploads/'+outputName+'"');
  //   console.log('stdout:', stdout);
  //   console.log('stderr:', stderr);
  // }
  

      // console.log(req.file.path);
      const config = {
        encoding: 'LINEAR16',
     
        languageCode: 'en-US',
        enableWordConfidence: true,
        profanityFilter:true,
        speechContext:[{phrases:['islamabad','house','graana','properties','plot',
          'marla','kanal','crore','lac','lakh','show properties in islamabad',
          'properties for rent in islamabad']}],
      };
      
      const audio = {
        content: fs.readFileSync('./'+req.file.path).toString('base64'),
        // content: fs.readFileSync('./uploads/audio-1544614145153.opus').toString('base64'),
      };
    
      const request = {
        config: config,
        audio: audio,
      };
    
    // Detects speech in the audio file
      client
      .recognize(request)
      .then(data => {
        const response = data[0];
        const transcription = response.results
          .map(result => result.alternatives[0].transcript)
          .join('\n');
        const confidence = response.results
          .map(result => result.alternatives[0].confidence)
          .join(`\n`);
        console.log(
          `Transcription: ${transcription} \n Confidence: ${confidence}`
        );
        if(transcription===''){
          res.send('Sorry, please try again');
        }
        else{
          res.send(transcription);
        }
    
      })
      .catch(err => {
        console.error('ERROR:', err);
      })
    });
  
//Start Appliation on the given PORT number
app.listen(PORT, () => console.log(`Listening on ${PORT}`));