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
            const data = await dbHandler.queryAsync('INSERT INTO audiolog (file_name, audio_content) VALUES ($1, $2)', 
            [file_name, audio_content]);
        }
        catch(e){
            console.log(e);
        }
    }
}