import { Transform } from "stream";

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

    static jetty1 = async () => {
        let response = await fetch('http://localhost:3730/getJetty1').then(res => res.json());
        let text = response.resources;

        return text;
    }

    static jetty2 = async () => {
        let response = await fetch('http://localhost:3730/getJetty2').then(res => res.json());
        let text = response.resources;

        return text;
    }

    static getResourceById = async (transcript) => {
        let resources = [
            { "node": 3, "name": "pump 101" },
            { "node": 4, "name": "pump 102" },
            { "node": 5, "name": "pump 103" },
            { "node": 6, "name": "pump 201" },
            { "node": 7, "name": "pump 202" },
            { "node": 8, "name": "pump 203" },
            { "node": 3, "name": "pumped 101" },
            { "node": 4, "name": "pumped 102" },
            { "node": 5, "name": "pumped 103" },
            { "node": 6, "name": "pumped 201" },
            { "node": 7, "name": "pumped 202" },
            { "node": 8, "name": "pumped 203" },
            { "node": 10, "name": "tank a" },
            { "node": 11, "name": "tank b" },
            { "node": 12, "name": "tank c" },
        ]

        let node;
        resources.forEach(pump => {
            if (transcript.toLowerCase().includes(pump.name)) {
                node = pump.node;
            }
        });

        if (node) {
            let response = await fetch('http://localhost:3730/getResourceById', {
                method: 'POST',
                body: JSON.stringify({ node }),
                headers: { 'Content-Type': 'application/json' }
            }).then(res => res.json());
            let text = response.resources;

            return text;
        }
    }

}



