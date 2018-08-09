const convert = require('convert-units')

export class Convertor {
    static getListOfAllUnits(): Array<string> {
        return convert().arrayList();
    }

    static findUnitData(unit) {
        let parsedUnit;

        convert().list().forEach(l => {
            if (l.abbr.toLowerCase() === unit.toLowerCase() ||
                l.singular.toLowerCase() === unit.toLowerCase() ||
                l.plural.toLowerCase() === unit.toLowerCase()) {
                parsedUnit = l;
            }
        })

        return parsedUnit;
    }

    static parseConversionObj(obj) {
        let to = obj.to;
        let from = obj.from.object;
        let amount = obj.from.number;

        console.log(obj);

        let posibilites = convert().from(from.abbr).possibilities();
        let err;

        if (posibilites.indexOf(to.abbr) < 0) {
            let toObj = to;
            if (to.singular) {
                toObj = to.singular;
            }

            err = `${from.singular} can not be converted to ${toObj}. Please use `;

            posibilites.forEach((p, idx) => {
                err += convert().describe(p).singular;
                err += idx == (posibilites.length - 1) ? "." : (idx == (posibilites.length - 2) ? " or " : ", ");
            })
        }

        if (err) {
            return err;
        }

        function isFloat(n){
            return Number(n) === n && n % 1 !== 0;
        }

        let answer = convert(parseFloat(amount)).from(from.abbr).to(to.abbr);

        if(isFloat(answer) && answer.toFixed(2).toString() !== '0.00'){
            answer = answer.toFixed(2);
        }

        if(isFloat(answer) && answer.toFixed(2).toString() === '0.00'){
            answer = answer.toPrecision(2);
        }
        
        if (answer) {
            return `${amount} ${from.plural} is ${answer} ${to.plural}`
        }
    }
}