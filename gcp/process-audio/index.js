const functions = require('@google-cloud/functions-framework');
const { Storage } = require('@google-cloud/storage');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const storage = new Storage();

functions.cloudEvent('processAudio', async cloudEvent => {
    console.log(`Event ID: ${cloudEvent.id}`);
    console.log(`Event Type: ${cloudEvent.type}`);
    const file = cloudEvent.data;
    console.log(`Bucket: ${file.bucket}`);
    console.log(`File: ${file.name}`);

    const tempDir = os.tmpdir();

    const filenameUUID = file.name.slice(0,-4);
    const inputLocalPath = path.join(tempDir, file.name);
    const outputLocalPath = path.join(tempDir, `${filenameUUID}.wav`);
    try{
        await storage.bucket('healthlens-audio').file(file.name).download({ destination: inputLocalPath });
        console.log('Input file downloaded successfully to:', inputLocalPath);
    
        const ffmpegCommand = `ffmpeg -i ${inputLocalPath} ${outputLocalPath}`;
        execSync(ffmpegCommand);
    
        console.log('File converted successfully to:', outputLocalPath);
    
        await storage.bucket('healthlens-audio-processed').upload(outputLocalPath, { destination: `${filenameUUID}.wav` });
    
    }
    catch(error){
        console.error('Error:', error);
    } finally {
        fs.unlinkSync(inputLocalPath);
        fs.unlinkSync(outputLocalPath);
    }

  });



