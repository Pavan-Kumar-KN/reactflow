import { ReactFlowProvider, addEdge, ReactFlow, applyEdgeChanges, applyNodeChanges } from '@xyflow/react'
import React, { useCallback, useState } from 'react'
import Sidebar from '../components/ui/sidebar'
import '@xyflow/react/dist/style.css';
import { ColorBuilder } from '../components/custom_nodes/ColorBuilder';

let id = 0;
const getid = () => `node-${id++}`;


// Define your custom node types
const nodeTypes = {
    colorNode: ColorBuilder,
};

const WorkFlowBuilder = () => {

    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([])

    // const onConnect = useCallback((params) => {
    //     setEdges((eds) => addEdge(params, eds));


    // }, [setEdges]);

    const onConnect = useCallback(
        (params) => {
            setEdges((eds) => {
                const updatedEdges = addEdge(params, eds);
                generateFlowJSON(nodes, updatedEdges); // generate flow JSON after connecting
                return updatedEdges;
            });
        },
        [nodes]
    );

    const onEdgesDelete = useCallback(
        (deletedEdges) => {
            setEdges((eds) => {
                const updatedEdges = eds.filter(e => !deletedEdges.some(de => de.id === e.id));
                generateFlowJSON(nodes, updatedEdges); // generate JSON after deletion
                return updatedEdges;
            });
        },
        [nodes]
    );

    const generateFlowJSON = (nodes, edges) => {
        const json = {
            nodes: nodes.map(node => ({
                id: node.id,
                type: node.type,
                data: node.data,
                position: node.position,
            })),
            edges: edges.map(edge => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                label: edge.label || '',
            })),
        };

        // Optionally save this to state, localStorage, or send to backend
        console.log('Flow JSON:', JSON.stringify(json, null, 2));
    };




    const onDragOver = useCallback((event) => {
        event.preventDefault();

        console.log(event)
        event.dataTransfer.dropEffect = 'move'
    }, []);


    const onDrop = useCallback((event) => {
        event.preventDefault();


        console.log("onDrop event is triggerd ", event.currentTarget.getBoundingClientRect())
        const reactFlowBuilds = event.currentTarget.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');

        console.log("type is ", type)


        if (!type) return;

        console.log("type is ", type)

        console.log("The position of event is ", event)

        const position = {
            x: event.clientX - reactFlowBuilds.left,
            y: event.clientY - reactFlowBuilds.top - 30,
        };

        console.log("position is ", position)

        const newNode = {
            id: getid(),
            type,
            position,
            data: {
                label: `${type} node`,
                // Add default data for color node
                ...(type === 'colorNode' && {
                    color: '#ff0000',
                    onChange: (event) => {
                        console.log('Color changed:', event.target.value);
                        // You can add logic here to update the node's color
                    }
                })
            },
        };

        setNodes((nds) => [...nds, newNode]);

        // console.log("nodes is " , nodes)
    }, [setNodes])

    const onEdgeChanges = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
    const onNodeChanges = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);

    return (
        <>
            <ReactFlowProvider>

                <div style={{ flexGrow: 1 }}
                    onDrop={onDrop}
                    onDragOver={onDragOver}>
                    <div style={{ display: 'flex', height: '100vh' }}>
                        <Sidebar />

                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onConnect={onConnect}
                            onEdgesDelete={onEdgesDelete}
                            onNodesChange={onNodeChanges}
                            onEdgesChange={onEdgeChanges}
                            nodeTypes={nodeTypes}
                            fitView

                        >

                        </ReactFlow>
                    </div>

                </div>

            </ReactFlowProvider>
        </>
    )
}

export default WorkFlowBuilder