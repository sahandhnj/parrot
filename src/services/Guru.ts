const wiki = require('wtf_wikipedia');

export class Guru {
    static async parseGuruObj(obj) {
        let phrase = obj.main;
        let property = obj.property;

        let answer = await Guru.do(phrase.toLowerCase(), property.toLowerCase());

        return answer;
    }

    static async do(phrase: string, property: string) {
        let doc = await wiki.fetch(phrase);

        let infoBoxes = doc.infoboxes()[0].data;
        let infoBoxesTitles = Object.keys(infoBoxes);
        let index;
        let propertyCopied = property.replace(' ', '_');

        console.log('Looking for', propertyCopied);
        infoBoxesTitles.forEach(ib => {
            if (ib == propertyCopied) {
                console.log('Found infoBox: ', ib);
                index = ib;
            }
        })

        if (!index) {
            propertyCopied = property.replace(' ', '');

            console.log('Looking for', propertyCopied);
            infoBoxesTitles.forEach(ib => {
                if (ib == propertyCopied) {
                    console.log('Found infoBox: ', ib);
                    index = ib;
                }
            })
        }

        if (!index) {
            propertyCopied = property.replace(' ', ' ');

            console.log('Looking for', propertyCopied);
            infoBoxesTitles.forEach(ib => {
                if (!index && ib.includes(propertyCopied)) {
                    console.log('Found infoBox: ', ib);
                    index = ib;
                }
            })
        }

        let answer;
        if (infoBoxes[index] && infoBoxes[index].data.text) {
            answer = `The ${property} of ${phrase} is ${infoBoxes[index].data.text}`;
        }

        return answer;
    }

    static async parseFullObj(obj) {
        let phrase = obj.main;
        let doc = await wiki.fetch(phrase);
        return doc.sentences(0).text() + doc.sentences(1).text()
    }

    static async getMeOptions(phrase) {
        let doc = await wiki.fetch(phrase);

        let infoBoxes = doc.infoboxes()[0].data;
        let infoBoxesTitles = Object.keys(infoBoxes);

        return {infoBoxesTitles,doc};
    }
}