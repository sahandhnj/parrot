const fetch = require('node-fetch');

export class Weather {
    static extemes = async (question) => {
        let response = await fetch('https://extreme.sahand.cloud/getData').then(res => res.json());
        let text = response.text;

        return text;
    }
}

