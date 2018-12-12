const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
const app = express();
// const upload = require('multer')({ dest: 'uploads/' });
const multer=require('multer');
const cors = require('cors');
var xhr = require('xhr');
// var ffmpeg = require('fluent-ffmpeg');
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

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
// const encoding = 'Encoding of the audio file, e.g. LINEAR16';
// const sampleRateHertz = 16000;
// const languageCode = 'BCP-47 language code, e.g. en-US';

const config = {
    encoding: 'OGG_OPUS',
    sampleRateHertz: '48000',
    languageCode: 'en-US',
  };

app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});




app.post('/speechtotext', upload.single('audioFile'), function (req, res) {

console.log('Recieved   ', req.file.path);
var a='audio.webm';
var b= 'audio.wav';
console.log('Recieved   "'+a+'"');

async function ls(input) {
	outputName='audio-'+Date.now()+'.opus';
	const { stdout, stderr } = await exec('ffmpeg -i "'+input+'" -vn -acodec  copy "./uploads/'+outputName+'"');
	console.log('stdout:', stdout);
	console.log('stderr:', stderr);
}

ls('./'+req.file.path).then(function (){
console.log(outputName);
    const audio = {
        content: fs.readFileSync('./uploads/'+outputName).toString('base64'),
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
		console.log(`Transcription: `, transcription);
		    res.send(' '+transcription);
  })
  .catch(err => {
    console.error('ERROR:', err);
	})});


});





//Start Appliation on the given PORT number
app.listen(PORT, () => console.log(`Listening on ${PORT}`));