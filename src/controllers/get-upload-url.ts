import {Storage } from '@google-cloud/storage';
import { resolve, join } from "path";
import fs from "fs";
import os from "os";

const keyLoc = resolve(__dirname, "gcp_access_key.json");

process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(__dirname, 'gcp_access_key.json')
// process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(
//   "/Users/nakshathru/Documents/hackathon/healthlens-api/src/controllers/gcp_access_key.json"
// );

const storage = new Storage();
const bucket = storage.bucket('healthlens-audio');


export const handler = async (event) => {
  try {
    const filename = event.queryStringParameters.filename || 'patientzero.m4a'
    const file = bucket.file(filename);

    const [url] = await file.getSignedUrl({
    action: 'write',
    expires: Date.now() + 300 * 1000, 
    contentType: 'audio/mp4', 
  });
    return {
      signedUrl: url
    }
  } catch (error) {
    console.error('Error occured');
    return {
      error: error
    }
  }  
};