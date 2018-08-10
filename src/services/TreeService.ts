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
        console.log('Merge NERS children');
        const decide= node =>{
            let ner;
            let requiresMerging= true;

            node.children().forEach((child,idx) =>{
                if(idx === 0){
                    ner= child.ner();
                }

                if(!ner || ner === 'O'){
                    requiresMerging= false;
                    return;
                }

                console.log('-------->',child.word() , ner);
                if(child.ner() !== ner){
                    requiresMerging= false;
                }
            })

            return requiresMerging;
        };

        tree.mergeChildrenToParent(decide);
        console.log('--------------------');
    }
}