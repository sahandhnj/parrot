import CoreNLP, { Properties, Pipeline } from 'corenlp';
import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from 'constants';
import { Tree } from '../models/Tree';
import { TreeService } from './TreeService';
import { Convertor } from './Convertor';

export class NLPService {
    static parse = async (text, uuid?) => {
        const pipeline = new Pipeline(new Properties({
            annotators: 'tokenize,ssplit,pos,lemma,ner,parse',
        }), 'English');

        const sent = new CoreNLP.simple.Sentence(text);
        const nlpresult = await pipeline.annotate(sent)


        // const tokens = nlpresult.tokens();
        // const deps = nlpresult._enhancedPlusPlusDependencies;
        // const governors = nlpresult.governors();
        // const newDeps = NLPService.parseObj(deps, tokens);
        // const ners = TreeService.mergeNERs(tokens);

        const tree: Tree = Tree.newTreeFromString(nlpresult);
        tree.dumpToFile(uuid);
        
        let endResult;
        if (tree.treeType() === 'WHAT_IS') {
            endResult = NLPService.doWhatIs(tree);
            if(endResult.mode === 'convertor'){
                return Convertor.parseConversionObj(endResult);
            }
        }
    }

    static doWhatIs = (tree) => {
        let whatis = NLPService.flattenDeep(tree.treeStructure());
        NLPService.cleanWhatIs(whatis);
        let hasIn = NLPService.checkForHasIn(whatis);
        
        if (hasIn) {
            return hasIn;
        }
    }

    static flattenDeep = (arr: Array<any>) => {
        return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(NLPService.flattenDeep(val)) : acc.concat(val), []);
    }

    static cleanWhatIs = (arr: Array<string>) => {
        arr.splice(0, arr.indexOf('Rel: SQ') + 1);
        arr.splice(0, arr.indexOf('VBZ: is') + 1);

        arr.forEach((item, index, object) => {
            if (item.startsWith('Rel:')) {
                object.splice(index, 1);
            }
        });

        arr.forEach((item, index, object) => {
            if (item.startsWith('Rel:')) {
                object.splice(index, 1);
            }
        });
    }

    static checkForHasIn = (words) => {
        let result;
        let clonedArr = words.slice(0);
        let index = clonedArr.indexOf('IN: in');

        if (index < 0) {
            return;
        }

        let to = clonedArr.splice(index, clonedArr.length - index);
        let from = clonedArr;

        to.splice(0, 1);
        to.forEach((b, i) => {
            b = b.substring(b.indexOf(': ') + 2, b.length - b.indexOf(': ') + 3);
            to[i] = b;
        })
        to = to.join(' ');

        let fromObj = {} as any;

        from.forEach((f, i, obj) => {
            if (f.startsWith('CD:')) {
                f = f.substring(f.indexOf(': ') + 2, f.length - f.indexOf(': ') + 3);
                fromObj.number = f;
                obj.splice(i, 1);
            }
        })

        from.forEach((f, i) => {
            f = f.substring(f.indexOf(': ') + 2, f.length - f.indexOf(': ') + 3);
            from[i] = f;
        })

        from = from.join(' ');
        fromObj.object = from;

        let mode;

        if (languages.indexOf(to) > -1) {
            mode = 'translate';
        }
        else {
            if(Convertor.findUnitData(fromObj.object)){
                fromObj.object = Convertor.findUnitData(fromObj.object);
                mode = 'convertor';
            }

            if(mode == 'convertor' && Convertor.findUnitData(to)) {
                to= Convertor.findUnitData(to);
            }
        }

        let endResult = {
            mode: mode,
            from: fromObj,
            to: to,
        } as any;

        return endResult;
    }

    static mapRelations = (deps, tokens) => {
        deps.forEach(dep => {
            if (dep.governor === 0) {
                return;
            }

            if (!tokens[dep.governor - 1].relations) {
                tokens[dep.governor - 1].relations = []
            }

            tokens[dep.governor - 1].relations.push(tokens[dep.dependent - 1])
            let cur = tokens[dep.governor - 1];
            console.log(cur)
        });
        // return tokens;
        return tokens.filter(token => token.relations && token.relations.length > 1)
    }

    static analyseObj = (obj) => {
        if (obj.relations) {
            obj.relations.forEach(element => {
                if (!obj[element.relation]) {
                    obj[element.relation] = [];
                }

                obj[element.relation].push({ el: element.dependentDetails.lemma, properties: element.property });
            });
        }

        return obj;
    }

    static getRelationText2 = (items) => {
        let text = '';
        if (items.relations) {
            items.relations.forEach((item, idx) => {
                text += item.dependentGloss;
                if (item.relations) {
                    text += `(${NLPService.getRelationText(item)})`;
                }
                text += (idx !== items.relations.length - 1 ? ', ' : '');
            })
        }

        return text;
    }

    static parseObj = (deps, tokens) => {
        var depsCloned = JSON.parse(JSON.stringify(deps));

        depsCloned.forEach(dep => {
            dep.dependentDetails = {
                lemma: tokens[dep.dependent - 1]._lemma,
                ner: tokens[dep.dependent - 1]._ner,
                pos: tokens[dep.dependent - 1]._pos,
                posText: tags[tokens[dep.dependent - 1]._pos]
            }

        })

        return depsCloned;
    }

    static mapOneWayRelations = (deps) => {
        console.log('Mapping one way relationships -->');
        deps = NLPService.compound(deps);
        deps = NLPService.determiner(deps);
        deps = NLPService.number(deps);
        deps = NLPService.adjective(deps);
        deps = NLPService.nmod(deps);

        return deps;
    }

    static toSearchObj = (rels) => {
        let result = {
            action: null,
            object: {} as any
        };

        const action = rels.filter(el => el.type === 'Root');
        result.action = action[0].dependentDetails.lemma;

        const objs = rels.filter(el => el.type === 'obj');
        let obj = objs[0];
        if (objs.length > 1) {
            const dobjs = rels.filter(el => el.dep === 'dobj');
            obj = dobjs[0];
        }

        const robj = obj;//NLPService.analyseObj(obj);
        if (!obj) {
            return result;
        }

        if (robj.element) {
            result.object.element = {};
            result.object.element.field = robj.element[0].el;
            if (robj.element[0].properties) {
                result.object.element.properties = robj.element[0].properties;
            }
            result.object.subAction = {};
            result.object.subAction.field = robj.dependentDetails.lemma;
            result.object.subAction.properties = robj.properties;
        } else {
            result.object.element = robj.dependentDetails.lemma;
            if (robj.properties) {
                result.object.properties = robj.properties;
            }
        }

        return result;
    }

    static compound = (deps) => {
        const compounds = deps.filter(dep => dep.dep === 'compound');
        compounds.forEach(compound => {
            deps.forEach(el => {
                if (el.dependent === compound.governor) {
                    if (!el.relations) {
                        el.relations = [];
                    }
                    console.log(`${compound.dependentGloss} is compound of ${el.dependentGloss}`);
                    if (!el.properties) {
                        el.properties = [];
                    }

                    el.properties.push(compound.dependentDetails.lemma);

                    el.relations.push({
                        relation: "property",
                        dep: compound.dep,
                        dependent: compound.dependent,
                        dependentGloss: compound.dependentGloss,
                        dependentDetails: compound.dependentDetails,
                        relations: compound.relations
                    });
                }
            })
        });

        deps = deps.filter(dep => dep.dep !== 'compound');

        const compoundPrts = deps.filter(dep => dep.dep === 'compound:prt');
        compoundPrts.forEach(compound => {
            deps.forEach(el => {
                if (el.dependent === compound.governor) {
                    if (!el.relations) {
                        el.relations = [];
                    }
                    console.log(`${compound.dependentGloss} is compound:prt of ${el.dependentGloss}`);

                    el.relations.push({
                        relation: "main",
                        dep: compound.dep,
                        dependent: compound.dependent,
                        dependentGloss: compound.dependentGloss,
                        dependentDetails: compound.dependentDetails,
                        relations: compound.relations
                    });
                }
            })
        });

        deps = deps.filter(dep => dep.dep !== 'compound:prt');

        return deps;
    }

    static getRelationText = (items) => {
        let text = '';
        if (items.relations) {
            items.relations.forEach((item, idx) => {
                text += item.dependentGloss;
                if (item.relations) {
                    text += `(${NLPService.getRelationText(item)})`;
                }
                text += (idx !== items.relations.length - 1 ? ', ' : '');
            })
        }

        return text;
    }

    static number = (deps) => {
        const numbers = deps.filter(dep => dep.dep === 'nummod');
        numbers.forEach(number => {
            deps.forEach(el => {
                if (el.dependent === number.governor) {
                    if (!el.relations) {
                        el.relations = [];
                    }
                    console.log(`${number.dependentGloss} is number of ${el.dependentGloss}`);
                    if (!el.properties) {
                        el.properties = [];
                    }

                    el.properties.push(number.dependentDetails.lemma);

                    el.relations.push({
                        relation: "property",
                        dep: number.dep,
                        dependent: number.dependent,
                        dependentGloss: number.dependentGloss,
                        dependentDetails: number.dependentDetails,
                        relations: number.relations
                    });
                }
            })
        });

        deps = deps.filter(dep => dep.dep !== 'nummod');

        return deps;
    }

    static determiner = (deps) => {
        const determiners = deps.filter(dep => dep.dep === 'det');
        determiners.forEach(determiner => {
            deps.forEach(el => {
                if (determiner.dependentGloss === 'the') {
                    return;
                }

                if (el.dependent === determiner.governor) {
                    if (!el.relations) {
                        el.relations = [];
                    }
                    console.log(`${determiner.dependentGloss} is determiner of ${el.dependentGloss}`);
                    if (!el.properties) {
                        el.properties = [];
                    }

                    el.properties.push(determiner.dependentDetails.lemma);

                    el.relations.push({
                        relation: "property",
                        dep: determiner.dep,
                        dependent: determiner.dependent,
                        dependentGloss: determiner.dependentGloss,
                        dependentDetails: determiner.dependentDetails,
                        relations: determiner.relations
                    });
                }
            })
        });

        deps = deps.filter(dep => dep.dep !== 'det');

        return deps;
    }

    static cop = (deps) => {
        const cops = deps.filter(dep => dep.dep === 'cop');
        cops.forEach(cop => {
            deps.forEach(el => {
                if (el.dependent === cop.governor) {
                    if (!el.relations) {
                        el.relations = [];
                    }
                    console.log(`${cop.dependentGloss} is cop of ${el.dependentGloss}`);

                    el.relations.push({
                        relation: "subAction",
                        dep: cop.dep,
                        dependent: cop.dependent,
                        dependentGloss: cop.dependentGloss,
                        dependentDetails: cop.dependentDetails,
                        relations: cop.relations
                    });
                }
            })
        });

        deps = deps.filter(dep => dep.dep !== 'nummod');

        return deps;
    }

    static nmod = (deps) => {
        const nmods = deps.filter(dep => dep.dep.startsWith('nmod'));
        nmods.forEach(nmod => {
            deps.forEach(el => {
                if (el.dependent === nmod.governor) {
                    if (!el.relations) {
                        el.relations = [];
                    }
                    console.log(`${nmod.dependentGloss} is ${nmod.dep} of ${el.dependentGloss}`);
                    if (!el.element) {
                        el.element = [];
                    }

                    el.element.push({ el: nmod.dependentDetails.lemma, properties: nmod.properties });

                    el.relations.push({
                        relation: "element",
                        dep: nmod.dep,
                        dependent: nmod.dependent,
                        dependentGloss: nmod.dependentGloss,
                        dependentDetails: nmod.dependentDetails,
                        relations: nmod.relations,
                        properties: nmod.properties
                    });
                }
            })
        });

        deps = deps.filter(dep => !dep.dep.startsWith('nmod'));

        return deps;
    }

    static adjective = (deps) => {
        const adjectives = deps.filter(dep => dep.dep === 'amod');
        adjectives.forEach(adj => {
            deps.forEach(el => {
                if (el.dependent === adj.governor) {
                    if (!el.relations) {
                        el.relations = [];
                    }

                    console.log(`${adj.dependentGloss} is adjective of ${el.dependentGloss}`);
                    if (!el.properties) {
                        el.properties = [];
                    }

                    el.properties.push(adj.dependentDetails.lemma);

                    el.relations.push({
                        relation: "property",
                        dep: adj.dep,
                        dependent: adj.dependent,
                        dependentGloss: adj.dependentGloss,
                        dependentDetails: adj.dependentDetails,
                        relations: adj.relations
                    });
                }
            })
        });

        deps = deps.filter(dep => dep.dep !== 'amod');

        return deps;
    }

    static analyse = (deps) => {
        let array = [];

        const roots = deps.filter(dep => dep.dep === 'ROOT');
        if (roots.length !== 1) {
            throw new Error('Wrong number of root');
        }

        const root = roots[0];

        delete root.governor;
        delete root.governorGloss;
        array.push({ type: 'Root', ...root });
        console.log(`Root: ${root.dependentGloss} (${NLPService.getRelationText(root)}) `);

        const subjects = deps.filter(dep => dep.dep === 'nsubj');

        if (subjects.length === 1) {
            const subject = subjects[0];
            delete subject.governor;
            delete subject.governorGloss;
            array.push({ type: 'subj', ...subject });
            console.log(`Subject: ${subject.dependentGloss} (${NLPService.getRelationText(subject)}) `);
        }


        const objects = deps.filter(dep => dep.dep === 'iobj' || dep.dep === 'obj' || dep.dep === 'dobj' || dep.dep === 'xcomp');

        objects.forEach(obj => {
            delete obj.governor;
            delete obj.governorGloss;
            array.push({ type: 'obj', ...obj });
            console.log(`Object (${obj.dep}): ${obj.dependentGloss} (${NLPService.getRelationText(obj)})`);
        })

        return array;
    }

    static getProperNames = (tokens: Array<any>) => {
        return tokens.filter(token => {
            return token._pos === "NNP" || token._pos === "NNPS";
        })
    }

    static getNames = (tokens: Array<any>) => {
        return tokens.filter(token => {
            return token._pos === "NN" || token._pos === "NNS";
        })
    }

    static getAllNames = (tokens: Array<any>) => {
        return tokens.filter(token => {
            return token._pos === "NN" || token._pos === "NNS" ||
                token._pos === "NNP" || token._pos === "NNPS";
        })
    }

    static getVerbs = (tokens: Array<any>) => {
        return tokens.filter(token => {
            return token._pos === "VBZ" || token._pos === "VBP" ||
                token._pos === "VBN" || token._pos === "VBG" ||
                token._pos === "VBD" || token._pos === "VB"
        })
    }

    static getAdjective = (tokens: Array<any>) => {
        return tokens.filter(token => {
            return token._pos === "JJ" || token._pos === "JJS" ||
                token._pos === "JJR";
        })
    }

    static getRelationsOfTheNoun = (noun, tokens: Array<any>) => {
        let relations = [];
        const isNumber = token => token._pos === "CD";

        const isAdjective = token => token._pos === "JJ" || token._pos === "JJS"
            || token._pos === "JJR";

        const isVerbs = token => token._pos === "VBZ" || token._pos === "VBP" ||
            token._pos === "VBN" || token._pos === "VBG" ||
            token._pos === "VBD" || token._pos === "VB";

        const isRelation = token => isNumber(token) || isAdjective(token) || isVerbs(token);

        let index = noun._index - 3;

        while (index < noun._index + 2) {
            if (tokens[index] && (isRelation(tokens[index]) || index === noun._index - 1)) {
                relations.push(tokens[index]);
            }

            index++;
        }

        return relations;
    }
}

let tags = {
    'CC': 'Coordinating conjunction',
    'CD': 'Cardinal number',
    'DT': 'Determiner',
    'EX': 'Existential there',
    'FW': 'Foreign word',
    'IN': 'Preposition or subordinating conjunction',
    'JJ': 'Adjective',
    'JJR': 'Adjective, comparative',
    'JJS': 'Adjective, superlative',
    'LS': 'List item marker',
    'MD': 'Modal',
    'NN': 'Noun, singular or mass',
    'NNS': 'Noun, plural',
    'NNP': 'Proper noun, singular',
    'NNPS': 'Proper noun, plural',
    'PDT': 'Predeterminer',
    'POS': 'Possessive ending',
    'PRP': 'Personal pronoun',
    'PRP$': 'Possessive pronoun',
    'RB': 'Adverb',
    'RBR': 'Adverb, comparative',
    'RBS': 'Adverb, superlative',
    'RP': 'Particle',
    'SYM': 'Symbol',
    'TO': 'to',
    'UH': 'Interjection',
    'VB': 'Verb, base form',
    'VBD': 'Verb, past tense',
    'VBG': 'Verb, gerund or present participle',
    'VBN': 'Verb, past participle',
    'VBP': 'Verb, non­3rd person singular present',
    'VBZ': 'Verb, 3rd person singular present',
    'WDT': 'Wh­determiner',
    'WP': 'Wh­pronoun',
    'WP$': 'Possessive wh­pronoun',
    'WRB': 'Wh­adverb',



    'ADJP': 'Adjective phrase',
    'ADVP': 'Adverb phrase',
    'NP': 'Noun phrase',
    'PP': 'Prepositional phrase',
    'S': 'Simple declarative clause',
    'SBAR': 'Subordinate clause',
    'SBARQ': 'Direct question introduced by wh-element',
    'SINV': 'Declarative sentence with subject-aux inversion',
    'SQ': 'Yes/no questions and subconstituent of SBARQ excluding wh-element',
    'VP': 'Verb phrase',
    'WHADVP': 'Wh-adverb phrase',
    'WHNP': 'Wh-noun phrase',
    'WHPP': 'Wh-prepositional phrase',
    'X': 'Constituent of unknown or uncertain category',
    '*': '“Understood” subject of infinitive or imperative',
    '0': 'Zero variant of that in subordinate clauses',
    'T': 'Trace of wh-Constituen'
}

const languages = [
    'acholi',
    'adyghe',
    'afrikaans',
    'afrikaans',
    'afrikaans',
    'akan',
    'arabic',
    'arabic',
    'arabic',
    'arabic',
    'aymara',
    'azerbaijani',
    'azerbaijani',
    'belarusian',
    'bulgarian',
    'bulgarian',
    'bengali',
    'bengali',
    'bengali',
    'bosnian',
    'catalan',
    'catalan',
    'kaqchikel',
    'cherokee',
    'czech',
    'czech',
    'welsh',
    'welsh',
    'danish',
    'danish',
    'german',
    'german',
    'german',
    'german',
    'lower sorbian',
    'greek',
    'greek',
    'english',
    'english',
    'english',
    'english',
    'english',
    'english',
    'english',
    'english',
    'english',
    'english',
    'english',
    'esperanto',
    'esperanto',
    'spanish',
    'spanish',
    'spanish',
    'spanish',
    'spanish',
    'spanish',
    'spanish',
    'spanish',
    'spanish',
    'spanish',
    'spanish',
    'spanish',
    'estonian',
    'estonian',
    'basque',
    'basque',
    'persian',
    'persian',
    'leet',
    'fulah',
    'finnish',
    'finnish',
    'faroese',
    'french',
    'french',
    'french',
    'french',
    'french',
    'frisian',
    'irish',
    'irish',
    'galician',
    'galician',
    'guarani',
    'gujarati',
    'classical greek',
    'hebrew',
    'hebrew',
    'hindi',
    'hindi',
    'croatian',
    'croatian',
    'upper sorbian',
    'haitian creole',
    'hungarian',
    'hungarian',
    'armenian',
    'indonesian',
    'indonesian',
    'icelandic',
    'icelandic',
    'italian',
    'italian',
    'japanese',
    'japanese',
    'javanese',
    'georgian',
    'kazakh',
    'khmer',
    'khmer',
    'kabyle',
    'kannada',
    'kannada',
    'korean',
    'korean',
    'kurdish',
    'latin',
    'latin',
    'luxembourgish',
    'limburgish',
    'lithuanian',
    'lithuanian',
    'latvian',
    'latvian',
    'maithili',
    'malagasy',
    'macedonian',
    'macedonian',
    'malayalam',
    'malayalam',
    'mongolian',
    'marathi',
    'marathi',
    'malay',
    'malay',
    'maltese',
    'maltese',
    'burmese',
    'norwegian',
    'norwegian',
    'norwegian',
    'nepali',
    'nepali',
    'dutch',
    'dutch',
    'dutch',
    'norwegian',
    'occitan',
    'oriya',
    'punjabi',
    'punjabi',
    'polish',
    'polish',
    'pashto',
    'portuguese',
    'portuguese',
    'portuguese',
    'quechua',
    'romansh',
    'romanian',
    'romanian',
    'russian',
    'russian',
    'sanskrit',
    'northern sámi',
    'sinhala',
    'slovak',
    'slovak',
    'slovenian',
    'slovenian',
    'somali',
    'albanian',
    'albanian',
    'serbian',
    'serbian',
    'sundanese',
    'swedish',
    'swedish',
    'swahili',
    'swahili',
    'tamil',
    'tamil',
    'telugu',
    'telugu',
    'tajik',
    'tajik',
    'thai',
    'thai',
    'filipino',
    'filipino',
    'klingon',
    'turkish',
    'turkish',
    'tatar',
    'ukrainian',
    'ukrainian',
    'urdu',
    'urdu',
    'uzbek',
    'uzbek',
    'vietnamese',
    'vietnamese',
    'xhosa',
    'yiddish',
    'yiddish',
    'chinese',
    'chinese simplified',
    'chinese traditional',
    'chinese simplified',
    'chinese traditional',
    'chinese simplified',
    'chinese'
]