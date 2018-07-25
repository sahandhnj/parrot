const fetch = require('node-fetch');

export class SystemMonitor {
    static trucks = async () => {
        let response = await fetch('http://localhost:3730/getTrucks').then(res => res.json());
        let text = response.trucks;

        return text;
    }

    static resources = async () => {
        let response = await fetch('http://localhost:3730/getResources').then(res => res.json());
        let text = response.resources;

        return text;
    }
}

