const Bluebird = require('bluebird');
const { Pool } = require('pg');
const config = require('../config/config');
const DB = new Pool(config.database);
const dbHandler = Bluebird.promisifyAll(DB);

export class DataBaseService {
    public static select = async (response) => {
        try{
            const data = await dbHandler.queryAsync("SELECT * FROM audiolog");
            response.json(data.rows);
        } catch(e){
            console.log(e);
        }
    }

    public static insert = async (file_name, audio_content) => {
        try{
            const timestamp= new Date();
            const data = await dbHandler.queryAsync('INSERT INTO audiolog (file_name, time_stamp, audio_content) VALUES ($1, $2, $3)', 
            [file_name, timestamp, audio_content]);
        }
        catch(e){
            console.log(e);
        }
    }
}