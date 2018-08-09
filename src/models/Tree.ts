import { Node, NODE_TYPES } from "./Node";
import * as fs from "fs";
import { Blob } from "node-fetch";

export class Tree {
    private rootNode: Node;

    constructor(node: Node) {
        this.rootNode = node;
    }

    public dump() {
        return JSON.stringify(this.rootNode, (key, node) => {

            if (node instanceof Node) {
                return node.toJSON();
            }

            return node;
        }, 2);
    }

    public dumpToFile(filePath?) {
        if (!filePath) {
            // Random uuid -${Math.floor(Math.random() * 100) + 1}
            filePath = `media/nlpTrees/${this.rootNode.text().substring(0, 10).replace(/ /g, '-')}.json`
        }

        return fs.writeFileSync(filePath, this.dump());
    }

    public getMainSentences() {

    }

    //Depth-first_search|DFS left to right (cb on all nodes)
    private doDFS(cb, node: Node = this.rootNode) {
        node.children().forEach(childNode => {
            this.doDFS(cb, childNode);
            cb(childNode);
        });

        cb(node);
    }

    //Depth-first_search|DFS right to left (cb on all nodes)
    private doDFSRight(cb, node: Node = this.rootNode) {
        node.children().reverse().forEach(childNode => {
            this.doDFSRight(cb, childNode);
            cb(childNode);
        });

        cb(node);
    }

    //Depth-first_search|DFS (cb on all nodes with no children (actuall words not relations))
    private visitWordNodes(cb, node: Node = this.rootNode) {
        node.children().forEach(childNode => {
            if (childNode.children().length) {
                this.visitWordNodes(cb, childNode);
            } else {
                cb(childNode);
            }
        });

        if (!node.children() || !node.children().length) {
            cb(node);
        }
    }

    private visitRelsTopToBottom(cb, node: Node = this.rootNode) {
        node.children().forEach(childNode => {
            cb(childNode);
            this.visitRelsTopToBottom(cb, childNode);
        });
    }

    public mergeChildrenToParent(decide: (a: Node) => boolean) {
        this.doDFS(node => {

            if (node.type() === NODE_TYPES.REL && node.children().length) {
                if (decide(node)) {
                    let child = node.children()[0];

                    child.setWord(node.text());
                    child.cleanLemma();
                    child.setPosToNE();

                    node.setChildren([child]);
                }
            }
        });
    }

    public mergeTreeNERs() {
        console.log('Merge NERS children');
        const decide = node => {
            let ner;
            let requiresMerging = true;

            node.children().forEach((child, idx) => {
                if (idx === 0) {
                    ner = child.ner();
                }

                if (!ner || ner === 'O') {
                    requiresMerging = false;
                    return;
                }

                console.log('-------->', child.word(), ner);
                if (child.ner() !== ner) {
                    requiresMerging = false;
                }
            })

            return requiresMerging;
        };

        this.mergeChildrenToParent(decide);
        console.log('--------------------');
    }

    public setFlatRels() {
        let allRelsFlat = [];
        this.visitRelsTopToBottom((node) => {

            if (node.type() === NODE_TYPES.REL) {
                allRelsFlat.push(node.pos());
            }
        }, this.rootNode);

        this.rootNode.setRelsFlat(allRelsFlat);
    }

    public tagTree() {
        const cmpArrays = (a: Array<any>, b: Array<any>) => {
            let eq = true;

            a.forEach((val, idx) => {
                if (val !== b[idx]) {
                    eq = false;
                }
            });

            return eq;
        }

        let WH = ["SBARQ", "WHNP", "SQ"];

        if (cmpArrays(WH, this.rootNode.relsFlat())) {
            let treeStructure = this.treeStructure();
            if (treeStructure[1][1][1] === 'WP: What' ||
                treeStructure[1][1][1] === 'WP: what') {
                this.rootNode.setTreeType('WHAT_IS');
            }
        }
    }

    public treeType() {
        return this.rootNode.treeType();
    }

    public treeStructure() {
        return this.rootNode.structure();
    }

    public static newTreeFromString(nlpResult, linkToParent = false) {
        const treeString = nlpResult.parse();
        if (!treeString) {
            throw new Error('Missing tree in text format');
        }

        const tree = Tree.fromString(treeString, linkToParent);

        tree.rootNode.setTextRoot(nlpResult.text());

        let visitedNodes = 0;
        tree.visitWordNodes(node => node.token(nlpResult.token(visitedNodes++)));

        //Set language on the first parent NODE
        const languageIso = nlpResult.getLanguageISO();
        if (languageIso) {
            tree.doDFS(node => node.setLanguageISO(languageIso));
        }

        tree.doDFS(node => node.setText());
        tree.mergeTreeNERs();
        tree.doDFS(node => node.setStructure());
        tree.setFlatRels();
        tree.tagTree();

        return tree;
    }

    private static fromString(str, linkToParent = false) {
        return new Tree(this._transformTree(this._buildTree(str), linkToParent));
    }

    private static _buildTree(str) {
        let currentNode: { str?, children } = { children: [] };
        const openNodes = [currentNode];
        const l = str.length;

        for (let i = 0; i < l; i++) {
            if (str[i] === '(') {
                currentNode = { str: '', children: [] };

                openNodes[openNodes.length - 1].children.push(currentNode);
                openNodes.push(currentNode);

            } else if (str[i] === ')') {
                this._cleanNode(currentNode);

                openNodes.pop();
                currentNode = openNodes[openNodes.length - 1];

            } else {
                currentNode.str += str[i];
            }
        }

        return currentNode.children[0];
    }

    private static _cleanNode(node) {
        const str = node.str.trim();
        const delimiterPos = str.indexOf(' ');

        if (delimiterPos > -1) {
            node.pos = str.substr(0, delimiterPos);
            node.word = str.substr(delimiterPos + 1);

        } else {
            node.pos = str;
        }
    }

    private static _transformTree(node, linkToParent?) {
        if (linkToParent) {
            const parentNode = new Node(node.pos, node.word);

            node.children.forEach(n => {
                const childNode = this._transformTree(n, linkToParent);

                childNode.parent(parentNode);
                parentNode.appendChild(childNode);
            });

            return parentNode;
        }

        return new Node(node.pos, node.word, node.children.map(n => this._transformTree(n)));
    }
}