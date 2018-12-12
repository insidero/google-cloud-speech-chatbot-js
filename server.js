const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
const app = express();
const upload = require('multer')({ dest: 'uploads/' });
const cors = require('cors');
var toWav = require('audiobuffer-to-wav')
var xhr = require('xhr')
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

const flac      = require('node-flac'),
      wav       = require('node-wav'),
      fs        = require('fs'),
      wavReader = new wav.Reader()
 
wavReader.on('format', function (format) {
  const flacEncoder = new flac.FlacEncoder(format)
 
  wavReader.pipe(flacEncoder).pipe(fs.createWriteStream('output.flac'));
  console.log('converted');
})
 
fs.createReadStream(req.file).pipe(wavReader);
res.send('recieved by server');
});





//Start Appliation on the given PORT number
app.listen(PORT, () => console.log(`Listening on ${PORT}`));