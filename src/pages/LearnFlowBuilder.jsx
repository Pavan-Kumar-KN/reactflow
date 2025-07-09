import {
    ReactFlow,
    addEdge,
    Background,
    MiniMap,
    Controls,
    useNodesState,
    useEdgesState,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { useCallback, useEffect } from 'react';
import ActionNode from '../components/custom_nodes/ActionNode';
import CustomEdgeWithLabel from '../components/custom_edge/CustomEdgeWithLabel';
import RouterNode from '../components/custom_nodes/RouterNode';


let nodeId = 1; // for unique IDs

// Custom node with hidden handles
const CustomNode = ({ data }) => (
    <div
        onClick={data.onClick}
        style={{
            padding: '10px 20px',
            background: '#9CA8B3',
            color: '#fff',
            borderRadius: '5px',
            cursor: 'pointer',
            userSelect: 'none',
        }}
    >
        {data.label}
    </div>
);

const nodeTypes = {
    customStyled: ActionNode,
    condition: RouterNode
};

const edgeTypes = {
    customWithLabel: CustomEdgeWithLabel,
};

function LearnFlowBuilder() {
    // Initialize state first
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);

    // Define callback functions after state is initialized
    const addNodeBelow = useCallback((parentId) => {
        setNodes((nds) => {
            const parent = nds.find((n) => n.id === parentId);
            if (!parent) return nds;

            const newId = `${++nodeId}`;
            const newNode = {
                id: newId,
                type: 'customStyled',
                position: {
                    x: parent.position.x,
                    y: parent.position.y + 200,
                },
                draggable: false,
                data: {
                    label: `Node ${newId}`,
                    onClick: () => addNodeBelow(newId),
                    color: 'text-blue-500',
                    onDelete: () => {
                        setNodes((nodes) => nodes.filter((n) => n.id !== newId));
                        setEdges((edges) => edges.filter((e) => e.source !== newId && e.target !== newId));
                    },
                },
            };

            return [...nds, newNode];
        });

        setEdges((eds) => [
            ...eds,
            {
                id: `e${parentId}-${nodeId}`,
                source: parentId,
                target: `${nodeId}`,
            },
        ]);
    }, [setNodes, setEdges]);

    const onAddBranchNode = useCallback((parentId, branchType) => {
        let newId;
        setNodes(nds => {
            const parent = nds.find(n => n.id === parentId);
            if (!parent) return nds;
            newId = `${++nodeId}`;
            const newNode = {
                id: newId,
                type: 'customStyled',
                position: {
                    x: parent.position.x + (branchType === 'otherwise' ? 200 : -200),
                    y: parent.position.y + 200,
                },
                draggable: false,
                data: {
                    label: `Action ${newId}`,
                    onClick: () => addNodeBelow(newId),
                },
            };
            return [...nds, newNode];
        });

        setEdges(eds => addEdge(
            {
                id: `e-${parentId}-${newId}`,
                source: parentId,
                sourceHandle: branchType, // 'branch1' or 'otherwise'
                target: newId,
                type: 'customWithLabel',
                data: { label: branchType === 'branch1' ? 'Yes' : 'No' },
            },
            eds
        ));
    }, [addNodeBelow, setNodes, setEdges]);

    // Initialize nodes with initial data after callbacks are defined
    useEffect(() => {
        setNodes([
            {
                id: '1',
                type: 'condition',
                position: { x: 300, y: 100 },
                draggable: false,
                data: {
                    label: 'Start Condition?',
                    branchNodes: { branch1: [], otherwise: [] },
                    onAddBranchNode: onAddBranchNode,
                },
            },
        ]);
    }, [onAddBranchNode, setNodes]);




    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                data: { ...node.data, onClick: () => addNodeBelow(node.id) },
            }))
        );
    }, [addNodeBelow, setNodes]);


    return (
        <div className="w-full overflow-y-auto overflow-x-hidden bg-gray-50" style={{ height: '100vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                panOnScroll={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                panOnDrag={[0, 1]} // only up/down

                zoomOnDoubleClick={false}
                fitView={false}
                defaultViewport={{ x: 450, y: 20, zoom: 1 }} // ✅ fixed zoom level
                nodesDraggable={false}
            >
                {/* <MiniMap /> */}
                <Controls showInteractive={false} />
                <Background />
            </ReactFlow>

        </div>

    );
}


export default LearnFlowBuilder;
