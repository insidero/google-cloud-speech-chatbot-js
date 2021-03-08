# google-cloud-speech-chatbot-js

An implementation of Google's Cloud Speech library. Provides API's for both STT and TTS allowing the developers to focus on the actual Conversation AI logic.

## API

1. `/speechToText`

  i.  Takes the audio file as input and stores it the local server/VM storage. (For production workloads consider moving the mp3 file upload to Amazon S3 etc.).
 ii.  Converts OGG to OPUS.
iii.  Analyzes the converted audiofile using Google Cloud Speech.

3. `/texttospeech`


  i.  Takes the text as input.
 ii.  Sends the text to the TTS endpoint to synthesize the text and generates an mp3 that can be played back to the client.
