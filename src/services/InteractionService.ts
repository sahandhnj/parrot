const fs = require('fs');
const textToSpeech = require('@google-cloud/text-to-speech');
const speech = require('@google-cloud/speech');
const Bluebird = require('bluebird');

export class InteractionService {
    public static speak = async (text, output) => {
        try {
            const client = new textToSpeech.TextToSpeechClient();
    
            const request = {
                input: { text: text },
                voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
                audioConfig: { audioEncoding: 'MP3' },
            };
    
            const apiAsync = Bluebird.promisifyAll(client);
            const response = await apiAsync.synthesizeSpeechAsync(request);
            await Bluebird.promisify(fs.writeFile)(`${output}`, response.audioContent, 'binary');
            console.log(`Audio content written to file: ${output}`);
        }
        catch (err) {
            console.error('ERROR:', err);
        }
    };

    public static syncRecognize = async (filename) => {
        try {
            const client = new speech.SpeechClient();
    
            const encoding = 'LINEAR16';
            const sampleRateHertz = 48000;
            const languageCode = 'en-US';
    
            const config = {
                encoding: encoding,
                //sampleRateHertz: sampleRateHertz,
                languageCode: languageCode,
            };
    
            const audio = {
                content: fs.readFileSync(filename).toString('base64'),
            };
    
            const request = {
                config: config,
                audio: audio,
            };
    
            const data = await client.recognize(request);
            const response = data[0];
            const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n');
            
            return transcription;
        }
        catch (err) {
            console.error('ERROR:', err);
        }
    };
}