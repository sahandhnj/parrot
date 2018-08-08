import { Tree } from "../models/Tree";

export class TreeService{
    public static mergeNERs(tokens){
        let ners = [];
        
        let currNER= {
            words: [], 
            indexes: [],
            type: null
        } as any;


        tokens.forEach(token => {
            if(token.ner() !== 'O'){
                if (!currNER.type) {
                    currNER.type = token.ner();
                }

                currNER.indexes.push(token.index());
                currNER.words.push(token.word());
            } else {
                if(currNER.words.length > 0){
                    currNER.words= currNER.words.join(' ');
                }
                
                if(currNER.indexes.length > 0){
                    ners.push(currNER)
                }

                currNER = {
                    words: [],
                    indexes: [],
                    type: null
                };
            }
        });

        return ners;
    }

    public static mergeTreeNERs(ners: Array<any>, tree:Tree){
        console.log('Processing-0');

        const processNodes= node =>{
            console.log('Processing');
            node.children().forEach(child =>{
                console.log('child',child);
                ners.forEach(ner =>{
                    if(ner.indexes[0] === child.index()){
                        console.log('Found it',child.word() )
                    }
                })
            })
        };

        tree.mergeChildren(processNodes);
    }
}