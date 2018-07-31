import CoreNLP, { Properties, Pipeline } from 'corenlp';

export class NLPService {
    static parse = async (text) => {
        const pipeline = new Pipeline(new Properties({
            annotators: 'tokenize,ssplit,pos,lemma,ner,parse',
        }), 'English');

        const sent = new CoreNLP.simple.Sentence(text);
        const nlpresult = await pipeline.annotate(sent)
        // const dump = CoreNLP.util.Tree.fromSentence(nlpresult).dump();
        // const parsed = nlpresult.parse();
        // const words= nlpresult.words();
        // const ners= nlpresult.nerTags();
        const tokens = nlpresult.tokens();
        const deps = nlpresult._enhancedPlusPlusDependencies;
        const tokenRelations = NLPService.mapRelations(deps,tokens);

        tokens.forEach(el => {
            el._posTag = tags[el._pos]
        });

        const result = {
            pnouns: NLPService.getProperNames(tokens),
            nouns: NLPService.getNames(tokens),
            verbs: NLPService.getVerbs(tokens),
            adjectives: NLPService.getAdjective(tokens)
        }

        const allNames = NLPService.getAllNames(tokens);
        let results = [];
        allNames.forEach(name => {
            results.push(NLPService.getRelationsOfTheNoun(name, tokens));
        })

        return result;
    }

    static mapRelations = (deps, tokens) => {
        deps.forEach(dep => {
            if(dep.governor === 0){
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
    'WRB': 'Wh­adverb'
}