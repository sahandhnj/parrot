export const NODE_TYPES = {
    REL: 'relation',
    WORD: 'word',
    MERGED: 'merged'
};

export class Node {
    private _text: string;
    private _type: string;
    private _pos: string;
    private _posInfo: string;
    private _word: string;
    private _children: Array<Node>;
    private _parent: Node;
    private _token: any;
    private _language: string;
    private _structure: Array<any>;
    private _relations: Array<any>;
    private _relsFlat: Array<string>;
    private _treeType: string;

    constructor(pos: string = '', word: string, children: Array<Node> = [], parent: Node = null) {
        this._pos = pos;

        if (word) {
            this._word = word;
            this._type = NODE_TYPES.WORD;
        } else {
            this._type = NODE_TYPES.REL;
        }

        this._children = children;
        this._parent = parent;

        this.setPosInfo(pos);
    }

    public text() {
        return this._text;
    }

    public type() {
        return this._type;
    }

    public setType(type: string) {
        this._type = type;
    }

    public treeType() {
        return this._treeType;
    }

    public setTreeType(treeType: string) {
        this._treeType = treeType;
    }

    public relations() {
        return this._relations;
    }

    public structure() {
        return this._structure;
    }

    public setRelsFlat(relsFlat: Array<string>){
        return this._relsFlat = relsFlat;
    }  
    
    public relsFlat(){
        return this._relsFlat;
    }

    public setTextRoot(text: string) {
        return this._text = text;
    }

    public setWord(word: string) {
        return this._word = word;
    }

    public setChildren(children: Array<Node>) {
        return this._children = children;
    }

    public setText() {
        if (this.children() && this.children().length > 0) {
            this._text = '';

            this.children().forEach((child, idx) => {
                this._text += child.type() === NODE_TYPES.REL ?
                    child.text() :
                    child.word();

                if (idx < this.children().length - 1 &&
                    ['.', ','].indexOf(this.children()[idx + 1].word()) < 0) {

                    this._text += ' ';
                }
            })
        }
    }

    public setStructure() {
        if (this._type === NODE_TYPES.REL && this.children() && this.children().length > 0) {
            this._structure = [];
            this._relations = [];
            this._structure.push(`Rel: ${this.pos()}`)

            this.children().forEach((child, idx) => {
                if (child.type() === NODE_TYPES.REL) {
                    this._structure.push(child.structure())
                    this._relations.push([child.pos() , child.relations()] )
                }

                if (child.type() === NODE_TYPES.WORD) {
                    this._structure.push(`${child.pos()}: ${child.word()}`)
                }
            })

        }
    }

    public ner() {
        if (this.token()) {
            return this.token().ner();
        }
    }
    
    public cleanLemma(){
        if (this.token()) {
            delete this.token()._lemma;
        }
    }

    public pos() {
        return this._pos;
    }

    public posInfo() {
        return this._posInfo;
    }

    public setPosToNE(){
        this._pos= 'NE';
    }

    private setPosInfo(pos: string) {
        if (this._children && this._children.length > 0 && REL[pos]) {
            this._posInfo = REL[pos]
        }
        else if (POS[pos]) {
            this._posInfo = POS[pos];
        }
    }

    public token(token = null) {
        if (token) {
            this._token = token;
        }

        return this._token;
    }

    public word() {
        return this._word;
    }

    public setLanguageISO(iso) {
        this._language = iso;
    }

    public getLanguageISO() {
        return this._language;
    }

    public children() {
        return this._children;
    }

    public dropChildren() {
        delete this._children;
    }

    public appendChild(node) {
        this._children.push(node);
    }

    public parent(paren = null) {
        if (paren) {
            this._parent = paren;
        }

        return this._parent;
    }

    public toJSON() {
        let json = {
            pos: this._pos,
            posInfo: this._posInfo,
            type: this._type,
            text: this._text,
        } as any;

        if (this._pos === 'ROOT') {
            json = {
                treeType: this._treeType,
                ...json,
                relFlat: this._relsFlat,
                structure: this._structure,
            }
        }

        if (this._type === NODE_TYPES.REL && this.children() && this.children().length > 0) {
            return {
                ...json,
                children: this.children()
            }
        }

        if (this._type === NODE_TYPES.WORD) {
            return {
                ...json,
                word: this.word(),
                token: this.parseToken(this.token())
            }
        }

        return {
            ...json
        }

    }

    public parseToken(token) {
        let tokenParsed = {
            idx: token.index(),
            lemma: token.lemma()
        } as any;

        if (token.ner() != 'O') {
            tokenParsed.ner = token.ner();
        }

        return tokenParsed;
    }
}


const POS = {
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
    '.': 'Dot',
    'NE': 'Named entity'
}

const REL = {
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