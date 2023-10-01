const functions = require('@google-cloud/functions-framework');
// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');
const fetch = require('node-fetch');


// Creates a client
const client = new speech.SpeechClient();
const os = require('os');
const path = require('path');
const fs = require('fs');

const API_URL='https://uoxfgxbl34.execute-api.us-east-1.amazonaws.com/upload-trans'

functions.cloudEvent('speech2Text', async cloudEvent => {
    console.log(`Event ID: ${cloudEvent.id}`);
    console.log(`Event Type: ${cloudEvent.type}`);
    const file = cloudEvent.data;
    console.log(`Bucket: ${file.bucket}`);
    console.log(`File: ${file.name}`);

    const tempDir = os.tmpdir();

    const filenameUUID = file.name.slice(0,-4);

    try{
    // The path to the remote LINEAR16 file
    const gcsUri = `gs://healthlens-audio-processed/${file.name}`;

    const audio = {
      uri: gcsUri,
    };
    const config = {
      languageCode: 'en-US',
      audioChannelCount: 2,
      maxAlternatives: 1,
      profanityFilter: true,
      enableSeparateRecognitionPerChannel: true,
      model: 'medical_conversation'
    };
    const request = {
      audio: audio,
      config: config,
    };
  
    // Detects speech in the audio file
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    await fetch(API_URL, {
        method: 'post',
        body: JSON.stringify({
            transcription,
            patientId: filenameUUID
        }),
        headers: {'Content-Type': 'application/json'}
    })
    
    }
    catch(error){
        console.error('Error:', error);
    } 

  });



