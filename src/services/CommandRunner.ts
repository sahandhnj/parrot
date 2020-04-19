const fs = require('fs');
const Bluebird = require('bluebird');
const fsp = Bluebird.promisifyAll(fs);

export class CommandRunner {
    public static transcribe = async (filePath: string) => {
        let transcription;
        try {
            console.log("ERERE")
            const { spawn } = require('child_process');
            const pyProg = spawn('deepspeech', ['--model', 'deepspeech/deepspeech-0.6.1-models/output_graph.pbmm', '--audio', filePath]);
        
            pyProg.stdout.on('data', function(data) {
                console.log(data.toString());;
            });
        }
        catch (e) {
            console.log(e);
        }

        return transcription;
    }
}
