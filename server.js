const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
const app = express();
const upload = require('multer')({ dest: 'uploads/' });
const cors = require('cors');
var toWav = require('audiobuffer-to-wav')
var xhr = require('xhr')

const fs = require('fs');

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

const request = {
  config: {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  },
  interimResults: false, // If you want interim results, set this to true
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

console.log('Recieved   ', req.file);

res.send('recieved by server');
});





//Start Appliation on the given PORT number
app.listen(PORT, () => console.log(`Listening on ${PORT}`));