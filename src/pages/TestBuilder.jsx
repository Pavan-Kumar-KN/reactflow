import React, { useCallback, useState, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, useNodesState, useEdgesState, Handle, Position } from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import { RotateCcw, ArrowRight, ArrowDown, CloudLightning } from 'lucide-react';
import CustomEdgeWithLabel from '../components/custom_edge/CustomEdgeWithLabel';

// Enhanced ActionNode with dropdown and copy functionality
const ActionTestNode = ({ data, sourcePosition, targetPosition, id }) => {
    const handleCopyClick = (e) => {
        e.stopPropagation();
        // Find the node in the current nodes state and set selected to true
        data.onNodeSelect && data.onNodeSelect(id);
    };

    return (
        <div style={{
            padding: '10px',
            border: '2px solid #4CAF50',
            borderRadius: '5px',
            background: '#E8F5E8',
            minWidth: '180px',
            textAlign: 'center',
            position: 'relative'
        }}>
            <Handle
                type="target"
                position={targetPosition || Position.Top}
                id="in"
                style={{ background: '#4CAF50' }}
            />
            <div style={{ marginBottom: '8px' }}>
                {data.label}
            </div>
            <select
                name="dropdown"
                onChange={handleCopyClick}
                onClick={(e) => e.stopPropagation()}
                style={{
                    padding: '4px',
                    borderRadius: '3px',
                    border: '1px solid #ccc',
                    background: 'white',
                    fontSize: '12px'
                }}
            >
                <option value="">Select action...</option>
                <option value="copy">Copy</option>
            </select>
            <Handle
                type="source"
                position={sourcePosition || Position.Bottom}
                id="out"
                style={{ background: '#4CAF50' }}
            />
        </div>
    );
};

// Enhanced RouterNode with dynamic handle positioning
const RouterTestNode = ({ data, sourcePosition, targetPosition }) => (
    <div style={{
        padding: '10px',
        border: '2px solid #2196F3',
        borderRadius: '5px',
        background: '#E3F2FD',
        minWidth: '180px',
        textAlign: 'center',
        position: 'relative'
    }}>
        <Handle
            type="target"
            position={targetPosition || Position.Top}
            id="in"
            style={{ background: '#2196F3' }}
        />
        {data.label}
        <Handle
            type="source"
            position={sourcePosition || Position.Bottom}
            id="out"
            style={{ background: '#2196F3' }}
        />
    </div>
);

// Enhanced BoxEdge with better orthogonal routing
const BoxEdge = ({ id, sourceX, sourceY, targetX, targetY, markerEnd, label, sourcePosition, targetPosition }) => {
    let path;

    // Determine path based on source and target positions
    if (sourcePosition === 'bottom' && targetPosition === 'top') {
        // Vertical layout: straight down approach
        const midY = sourceY + Math.abs(targetY - sourceY) / 2;
        path = `
            M ${sourceX},${sourceY}
            L ${sourceX},${midY}
            L ${targetX},${midY}
            L ${targetX},${targetY}
        `;
    } else if (sourcePosition === 'right' && targetPosition === 'left') {
        // Horizontal layout: straight right approach
        const midX = sourceX + Math.abs(targetX - sourceX) / 2;
        path = `
            M ${sourceX},${sourceY}
            L ${midX},${sourceY}
            L ${midX},${targetY}
            L ${targetX},${targetY}
        `;
    } else {
        // Fallback to original logic
        const midY = sourceY + 40;
        path = `
            M ${sourceX},${sourceY}
            L ${sourceX},${midY}
            L ${targetX},${midY}
            L ${targetX},${targetY}
        `;
    }

    return (
        <>
            <path
                id={id}
                d={path}
                stroke="#9ca3af"
                strokeWidth={2}
                fill="none"
                markerEnd={markerEnd}
            />
            {label && (
                <text>
                    <textPath href={`#${id}`} startOffset="50%" textAnchor="middle" fill="#4b5563" fontSize="12">
                        {label}
                    </textPath>
                </text>
            )}
        </>
    );
};


const nodeTypes = {
    routerNode: RouterTestNode,
    actionNode: ActionTestNode
};

const edgeTypes = {
    boxEdge: BoxEdge,
    customWithLabel: CustomEdgeWithLabel
};

const nodeWidth = 260;
const nodeHeight = 50;

// Simplified function to calculate child counts for edge width
function calculateChildCounts(nodes, edges) {
    const childCounts = {};

    // Initialize all nodes with 0 children
    nodes.forEach(node => {
        childCounts[node.id] = 0;
    });

    // Count direct children for each node
    edges.forEach(edge => {
        if (childCounts[edge.source] !== undefined) {
            childCounts[edge.source] += 1;
        }
    });

    return childCounts;
}

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    // Create a new dagre graph instance for each layout
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';

    // Enhanced graph configuration with proper spacing
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: isHorizontal ? 150 : 110, // Horizontal spacing between nodes
        ranksep: isHorizontal ? 120 : 90,  // Vertical spacing between ranks
        marginx: 10,
        marginy: 10,
        ranker: "longest-path",
    });

    // Validate that all nodes and edges are valid
    const nodeIds = new Set(nodes.map(n => n.id));
    const validEdges = edges.filter(edge => {
        const isValid = nodeIds.has(edge.source) && nodeIds.has(edge.target);
        if (!isValid) {
            console.warn(`Invalid edge: ${edge.source} -> ${edge.target}`);
        }
        return isValid;
    });

    // Calculate child counts for dynamic edge width
    const childCounts = calculateChildCounts(nodes, validEdges);

    // Set nodes with proper dimensions
    nodes.forEach(node => {
        let width = node.width || nodeWidth;
        let height = node.height || nodeHeight;

        dagreGraph.setNode(node.id, {
            width,
            height,
        });
    });

    // Set edges with proper configuration
    validEdges.forEach(edge => {
        const edgeConfig = {
            weight: 1,
            minlen: 1
        };

        if (edge.type === 'condition') {
            edgeConfig.minlen = 2; // Minimum edge length for better separation
        }

        dagreGraph.setEdge(edge.source, edge.target, edgeConfig);
    });

    // Apply layout
    dagre.layout(dagreGraph);

    // Position nodes with proper handle positions
    const newNodes = nodes.map(node => {
        const nodeWithPosition = dagreGraph.node(node.id);

        // Safety check
        if (!nodeWithPosition) {
            console.error(`Node position not found for: ${node.id}`);
            return node;
        }

        const finalPosition = {
            x: nodeWithPosition.x - (node.width || nodeWidth) / 2,
            y: nodeWithPosition.y - (node.height || nodeHeight) / 2,
        };

        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            position: finalPosition,
        };
    });

    // Update edges with dynamic widths and proper positioning
    const newEdges = validEdges.map(edge => {
        const sourceChildCount = childCounts[edge.source] || 1;
        const edgeWidth = Math.max(2, Math.min(8, sourceChildCount * 2));

        return {
            ...edge,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            style: {
                ...edge.style,
                strokeWidth: edgeWidth,
                stroke: `hsl(${Math.min(sourceChildCount * 40, 240)}, 70%, 50%)`,
                opacity: 0.8,
            }
        };
    });

    return { nodes: newNodes, edges: newEdges };
};

const initialNodes = [
    { id: 'trigger', type: 'routerNode', data: { label: 'Select Trigger ⚠️' }, width: 200, height: 80 },

    { id: 'whatsapp1', type: 'actionNode', data: { label: 'Send WhatsApp Message' }, width: 200, height: 80 },
    { id: 'sms', type: 'actionNode', data: { label: 'Send SMS Message' }, width: 200, height: 80 },

    { id: 'contact_tagged', type: 'routerNode', data: { label: 'Contact Tagged' }, width: 200, height: 80 },

    { id: 'assigned_staff', type: 'routerNode', data: { label: 'Assigned Staff' }, width: 200, height: 80 },

    { id: 'whatsapp2', type: 'actionNode', data: { label: 'Send WhatsApp Message (Yes)' }, width: 200, height: 80 },
    { id: 'email', type: 'actionNode', data: { label: 'Send Email (No)' }, width: 200, height: 80 },

    { id: 'webhook', type: 'actionNode', data: { label: 'Webhook (Advanced)' }, width: 200, height: 80 }
];

const initialEdges = [
  { id: 'e1', source: 'trigger', sourceHandle: 'out', target: 'whatsapp1', targetHandle: 'in', type: 'customWithLabel', label: 'Action' },
  { id: 'e2', source: 'whatsapp1', sourceHandle: 'out', target: 'sms', targetHandle: 'in', type: 'customWithLabel', label: 'Action' },
  { id: 'e3', source: 'sms', sourceHandle: 'out', target: 'contact_tagged', targetHandle: 'in', type: 'boxEdge', label: 'Condition' },

  // Condition to condition → use boxEdge
  { id: 'e4', source: 'contact_tagged', sourceHandle: 'out', target: 'assigned_staff', targetHandle: 'in', type: 'boxEdge', label: 'Yes' },

  // Condition to action → use customWithLabel
  { id: 'e5', source: 'contact_tagged', sourceHandle: 'out', target: 'webhook', targetHandle: 'in', type: 'boxEdge', label: 'No Action' },

  { id: 'e6', source: 'assigned_staff', sourceHandle: 'out', target: 'whatsapp2', targetHandle: 'in', type: 'boxEdge', label: 'Yes Action' },
  { id: 'e7', source: 'assigned_staff', sourceHandle: 'out', target: 'email', targetHandle: 'in', type: 'boxEdge', label: 'No Action' }
];



export default function TestBuilder() {
    const [layoutDirection, setLayoutDirection] = useState('TB');
    const [selectedNodeId, setSelectedNodeId] = useState(null);

    // Add onNodeSelect callback to initial nodes
    const nodesWithCallback = initialNodes.map(node => ({
        ...node,
        data: {
            ...node.data,
            onNodeSelect: (nodeId) => {
                setSelectedNodeId(nodeId);
                setNodes(currentNodes =>
                    currentNodes.map(n =>
                        n.id === nodeId
                            ? { ...n, selected: true }
                            : { ...n, selected: false }
                    )
                );
            }
        }
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodesWithCallback, initialEdges, layoutDirection);

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    const onConnect = useCallback((params) => {
        const newEdge = { ...params, type: 'boxEdge' };
        setEdges(eds => addEdge(newEdge, eds));

        // Re-layout after new connection
        setTimeout(() => {
            const { nodes: newLayoutedNodes, edges: newLayoutedEdges } = getLayoutedElements(nodes, [...edges, newEdge], layoutDirection);
            setNodes(newLayoutedNodes);
            setEdges(newLayoutedEdges);
        }, 100);
    }, [nodes, edges, setNodes, setEdges, layoutDirection]);

    // Function to manually trigger re-layout
    const relayoutTree = useCallback((direction = 'TB') => {
        setLayoutDirection(direction);
        const updatedNodes = nodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                onNodeSelect: (nodeId) => {
                    setSelectedNodeId(nodeId);
                    setNodes(currentNodes =>
                        currentNodes.map(n =>
                            n.id === nodeId
                                ? { ...n, selected: true }
                                : { ...n, selected: false }
                        )
                    );
                }
            }
        }));

        const { nodes: newLayoutedNodes, edges: newLayoutedEdges } = getLayoutedElements(updatedNodes, edges, direction);
        setNodes(newLayoutedNodes);
        setEdges(newLayoutedEdges);
    }, [nodes, edges, setNodes, setEdges]);

    // Function to add a new node
    const addNode = useCallback((parentId, nodeData) => {
        const newNodeId = `node_${Date.now()}`;
        const newNode = {
            id: newNodeId,
            type: nodeData.type || 'actionNode',
            data: {
                ...nodeData,
                onNodeSelect: (nodeId) => {
                    setSelectedNodeId(nodeId);
                    setNodes(currentNodes =>
                        currentNodes.map(n =>
                            n.id === nodeId
                                ? { ...n, selected: true }
                                : { ...n, selected: false }
                        )
                    );
                }
            },
            width: 200,
            height: 80,
            position: { x: 0, y: 0 }
        };

        const newEdge = {
            id: `edge_${Date.now()}`,
            source: parentId,
            sourceHandle: 'out',
            target: newNodeId,
            targetHandle: 'in',
            type: 'boxEdge',
            label: nodeData.label || 'New Branch'
        };

        const updatedNodes = [...nodes, newNode];
        const updatedEdges = [...edges, newEdge];

        // Re-layout with new node
        const { nodes: newLayoutedNodes, edges: newLayoutedEdges } = getLayoutedElements(updatedNodes, updatedEdges, layoutDirection);
        setNodes(newLayoutedNodes);
        setEdges(newLayoutedEdges);
    }, [nodes, edges, setNodes, setEdges, layoutDirection]);

    // Effect to re-layout when direction changes
    useEffect(() => {
        const updatedNodes = nodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                onNodeSelect: (nodeId) => {
                    setSelectedNodeId(nodeId);
                    setNodes(currentNodes =>
                        currentNodes.map(n =>
                            n.id === nodeId
                                ? { ...n, selected: true }
                                : { ...n, selected: false }
                        )
                    );
                }
            }
        }));

        const { nodes: newLayoutedNodes, edges: newLayoutedEdges } = getLayoutedElements(updatedNodes, edges, layoutDirection);
        setNodes(newLayoutedNodes);
        setEdges(newLayoutedEdges);
    }, [layoutDirection]);

    const handleNodeClick = useCallback((event, node) => {
        // console.log('Node clicked:', node);
    }, []);

    // Log selected nodes
    nodes.forEach((node) => {
        if (node.selected) {
            console.log("Selected node:", node);
        }
    });

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{
                    padding: 0.2,
                    includeHiddenNodes: false,
                }}
            />
            <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'white',
                padding: '10px',
                borderRadius: '5px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                zIndex: 1000,
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
            }}>
                <button
                    onClick={() => relayoutTree('TB')}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: layoutDirection === 'TB' ? '#2196F3' : '#f5f5f5',
                        color: layoutDirection === 'TB' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    <ArrowDown size={16} />
                    Vertical
                </button>
                <button
                    onClick={() => relayoutTree('LR')}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: layoutDirection === 'LR' ? '#2196F3' : '#f5f5f5',
                        color: layoutDirection === 'LR' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    <ArrowRight size={16} />
                    Horizontal
                </button>
                <button
                    onClick={() => relayoutTree(layoutDirection)}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    <RotateCcw size={16} />
                    Re-layout
                </button>
            </div>
            {selectedNodeId && (
                <div style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    background: 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    color: '#4CAF50',
                    fontWeight: 'bold'
                }}>
                    Selected Node: {selectedNodeId}
                </div>
            )}
        </div>
    );
}