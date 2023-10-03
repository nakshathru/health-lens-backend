const functions = require('@google-cloud/functions-framework');
// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');
const fetch = require('node-fetch');


// Creates a client
const client = new speech.SpeechClient();
const os = require('os');
const path = require('path');
const fs = require('fs');

const API_URL='https://y9pz5kubn2.execute-api.us-east-1.amazonaws.com/upload-trans'

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
      useEnhanced: true,
      model: 'medical_conversation'
    };
    const request = {
      audio: audio,
      config: config,
    };
  
    // Detects speech in the audio file
    const [operation] = await client.longRunningRecognize(request);
    const [response] = await operation.promise();

    const transcription = response.results
    let channel1=''
    let channel2='';
    for(trans of transcription){
        if(trans.channelTag === 1){
            channel1+= trans.alternatives[0].transcript + "\n"
        }
        else if (trans.channelTag === 2){
            channel2+= trans.alternatives[0].transcript + "\n"
        }
    }

    await fetch(API_URL, {
        method: 'post',
        body: JSON.stringify({
            transcription:{
              channel1,channel2
            },
            patientId: filenameUUID
        }),
        headers: {'Content-Type': 'application/json'}
    })
    
    }
    catch(error){
        console.error('Error:', error);
    } 

  });



