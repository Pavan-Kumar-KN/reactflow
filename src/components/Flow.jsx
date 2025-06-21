import { Background, Controls, ReactFlow, applyEdgeChanges, applyNodeChanges, addEdge } from '@xyflow/react';
import React, { useCallback, useMemo, useState } from 'react'
import Custom_Node from './custom_nodes/Custom_Node';

const nodes = [
    {
        id: "1",
        position: { x: 100, y: 0 },
        type: "output",
        data: { label: "hello" }
    },
    {
        id: '2',
        position: { x: 0, y: 200 },
        type: "output",
        data: { label: 'World' },
    },

    {
        id: '3',
        position: { x: 200, y: 200 },
        // it is used define the type of the node so that means here we are creating custom type node 
        type: 'textUpdater',
        data: { label: 'another one ' },
        targetPosition: 'top'
    },
];

const edges = [
    { id: '1', source: '3', target: '1', label: "to the ", type: "step" },
    { id: '2', source: '3', target: '2', label: "to the ", type: "step" },

];

// this array is been used for creating custom nodes 
// const nodeTypes = {
//     textUpdater: Custom_Node
// }

const Flow = () => {

    const [node, setNode] = useState(nodes);
    const [edge, setEdge] = useState(edges);

    const onNodeChange = useCallback((changes) => {
        setNode((nds) => applyNodeChanges(changes, nds));
    }, [setNode])


    const onEdgeChange = useCallback((changes) => {
        setEdge((nds) => applyEdgeChanges(changes, nds));
    }, [setEdge])


    const onConnect = useCallback((changes) => {
        setEdge((eds) => addEdge(changes, eds))
    }, [])

    const nodeTypes = useMemo(() => ({ textUpdater: Custom_Node }), []);

    return (
        <div style={{ height: "100%" }}>
            <ReactFlow
                nodes={node} edges={edge} onNodesChange={onNodeChange} onEdgesChange={onEdgeChange} onConnect={onConnect}
                nodeTypes={nodeTypes}
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    )
}

export default Flow