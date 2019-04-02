const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
const app = express();
process.title = app;
// const upload = require('multer')({ dest: 'uploads/' });
const multer = require('multer');
const cors = require('cors');
var xhr = require('xhr');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '.webm');
  }
});
var upload = multer({ storage: storage });
var outputName;
// Imports the Google Cloud speechClient library
const speechToText = require('@google-cloud/speech');
// Creates a speechClient
const speechClient = new speechToText.SpeechClient();
const textToSpeech = require('@google-cloud/text-to-speech');
const textClient = new textToSpeech.TextToSpeechClient();
const corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080', 'https://aira.graana.rocks');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
app.use(express.static('static'));

app.post('/speechtotext', upload.single('audioFile'), function (req, res) {
  // console.log('Recieved   ', req.file);

  async function ConvertToOGG_OPUS(input) {
    outputName = 'audio-' + Date.now() + '.opus';
    const { stdout, stderr } = await exec(
      'ffmpeg -i "' +
      input +
      '" -vn -acodec  copy "./uploads/' +
      outputName +
      '"'
    );
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
  }

  ConvertToOGG_OPUS('./' + req.file.path)
    .then(function () {
      console.log(outputName);
      const config = {
        encoding: 'OGG_OPUS',
        sampleRateHertz: '48000',
        languageCode: 'ur-PK',
        profanityFilter: true,
        speechContext: [
          {
            phrases: [
              'islamabad',
              'house',
              'graana',
              'properties',
              'plot',
              'marla',
              'kanal',
              'crore',
              'lac',
              'lakh',
              'show properties in islamabad',
              'properties for rent in islamabad',
              'g9',
              'apartment for rent in f11 islamabad',
              'house for sale in f11/2 islamabad',
              'plots', 'flat', 'plot file for sale', 'f11', 'f6'
            ]
          }
        ]
      };

      const audio = {
        content: fs.readFileSync('./uploads/' + outputName).toString('base64')
        // content: fs.readFileSync('./uploads/audio-1544614145153.opus').toString('base64'),
      };

      const request = {
        config: config,
        audio: audio
      };

      // Detects speech in the audio file
      speechClient
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

          if (response.results.alternatives.words) {
            console.log(`Word-Level-Confidence:`);
            const words = response.results.map(
              result => result.alternatives[0]
            );
            words[0].words.forEach(a => {
              console.log(` word: ${a.word}, confidence: ${a.confidence}`);
            });
          }
          res.send('' + transcription);
        })
        .catch(err => {
          console.error('ERROR:', err);
        });
    })
    .catch(err => {
      console.log('err ', err);
    });
});

app.post('/speechtotextSimple', upload.single('audioFile'), function (req, res) {

  const config = {
    encoding: 'LINEAR16',

    languageCode: 'en-IN',
    enableWordConfidence: true,
    profanityFilter: true,
    speechContext: [
      {
        phrases: [
          'islamabad',
          'house',
          'graana',
          'properties',
          'plot',
          'marla',
          'kanal',
          'crore',
          'lac',
          'lakh',
          'show properties in islamabad',
          'properties for rent in islamabad',
          'house for sale in f11 islamabad',
          'apartment for rent in g11 islamabad',
          'e11', 'f7', 'f8', 'f6', 'g6', 'g8', 'g7',
          'kya haal hai'
        ]
      }
    ]
  };

  const audio = {
    content: fs.readFileSync('./' + req.file.path).toString('base64')
    // content: fs.readFileSync('./uploads/audio-1544614145153.opus').toString('base64'),
  };

  const request = {
    config: config,
    audio: audio
  };

  // Detects speech in the audio file
  speechClient
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
      if (transcription === '') {
        res.send('Sorry, please try again');
      } else {
        res.send(transcription);
      }
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
});

app.post('/textToSpeech', async function (req, res) {
  // console.log(req.body);

  const request = {
    input: { text: req.body.message },
    voice: { languageCode: 'en-US', ssmlGender: 'FEMALE' },
    audioConfig: { audioEncoding: 'MP3' }
  };
  try {
    const [response] = await textClient.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    var date = Date.now();
    var outputFile = './static/' + date + 'outputFile.mp3';
    await writeFile(outputFile, response.audioContent, 'binary');

  } catch (e) {
    console.log(e);
    res.send('500');
  }

  res.send('http://localhost:5000/' + date + 'outputFile.mp3');
});
//Start Appliation on the given PORT number
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
