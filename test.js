// Imports the Google Cloud client library
const fs = require('fs');
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

const audio = {
  content: fs.readFileSync('/Users/hamzarashid/Downloads/file.opus').toString('base64'),
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
  })
  .catch(err => {
    console.error('ERROR:', err);
  });



// async function main() {
//     // Imports the Google Cloud client library
//     const speech = require('@google-cloud/speech');
//     const fs = require('fs');
  
//     // Creates a client
//     const client = new speech.SpeechClient();
  
//     // The name of the audio file to transcribe
//     const fileName = '/Users/hamzarashid/Downloads/audio1.raw';
  
//     // Reads a local audio file and converts it to base64
//     const file = fs.readFileSync(fileName);
//     const audioBytes = file.toString('base64');
  
//     // The audio file's encoding, sample rate in hertz, and BCP-47 language code
//     const audio = {
//       content: audioBytes,
//     };
//     const config = {
//       encoding: 'LINEAR16',
//       sampleRateHertz: 16000,
//       languageCode: 'en-US',
//     };
//     const request = {
//       audio: audio,
//       config: config,
//     };
  
//     // Detects speech in the audio file
//     const [response] = await client.recognize(request);
//     const transcription = response.results
//       .map(result => result.alternatives[0].transcript)
//       .join('\n');
//     console.log(`Transcription: ${transcription}`);
//   }
//   main().catch(console.error);