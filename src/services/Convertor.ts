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
                console.log(l);
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
            err = `${to.singular} can be converted to `;

            posibilites.forEach((p, idx) => {
                err += convert().describe(p).singular;
                err += idx == (posibilites.length - 1) ? "." : (idx == (posibilites.length - 2) ? " and " : ", ");
            })
        }

        if (err) {
            return err;
        }

        let answer = convert(parseFloat(amount)).from(from.abbr).to(to.abbr);

        if (answer) {
            return `${amount} ${from.plural} is ${answer} ${to.plural}`
        }
    }
}