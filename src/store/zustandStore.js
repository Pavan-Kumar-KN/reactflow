import { create } from 'zustand';
import { devtools } from 'zustand/middleware';


const useStore = create(devtools(
    (set) => ({
        // These states are used to store the copied node and edges 
        copiedNodes: [],
        copiedEdges: [],
        isCopy: false, // this variable helps to check if the node is copied or not 


        // this state is used for normal nodes and edges 
        nodesState: [],
        edgesState: [],

        setCopied: (nodes, edges) => {
            console.log("the copied nodes and edges are ", nodes, edges);

            set({

                copiedNodes: nodes , copiedEdges: edges, isCopy: true
            });
            
        },

        resetClipboard: () => set({ copiedNodes: [], copiedEdges: [], isCopy: false }),

        setNodesState: (nodes) => set({ nodesState: nodes }),

        setEdgesState: (edges) => set({ edgesState: edges })
    })
))

export default useStore;