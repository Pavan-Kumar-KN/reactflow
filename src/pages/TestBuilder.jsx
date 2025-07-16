import React, { useCallback, useState, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, useNodesState, useEdgesState, Handle, Position } from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import { RotateCcw, ArrowRight, ArrowDown, Plus } from 'lucide-react';
import useStore from '../store/zustandStore';
import { getSubTree } from '../store/algo/bfsfunction';

// Enhanced ActionNode with dropdown and copy functionality
const ActionTestNode = ({ data, sourcePosition, targetPosition, id }) => {
    const node = useStore((state) => state.nodesState);
    const edge = useStore((state) => state.edgesState);
    const { setCopied } = useStore.getState();

    const handleCopyClick = (e) => {
        e.stopPropagation();
        data.onNodeSelect && data.onNodeSelect(id);
        console.log("the selected node option", id, data);
        const { subNode, subEdges } = getSubTree(id, node, edge);
        setCopied(subNode, subEdges);
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
const RouterTestNode = ({ data, sourcePosition, targetPosition, id }) => {
    const node = useStore((state) => state.nodesState);
    const edge = useStore((state) => state.edgesState);
    const { setCopied } = useStore.getState();

    const handleCopyClick = (e) => {
        e.stopPropagation();
        data.onNodeSelect && data.onNodeSelect(id);
        console.log("the selected node option", id, data);
        const { subNode, subEdges } = getSubTree(id, node, edge);
        setCopied(subNode, subEdges);
    };

    return (
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
                style={{ background: '#2196F3' }}
            />
        </div>
    );
};

// Enhanced BoxEdge with plus icon
const BoxEdge = ({ id, sourceX, sourceY, targetX, targetY, markerEnd, label, sourcePosition, targetPosition, data }) => {
    const [showOptions, setShowOptions] = useState(false);
    const isCopy = useStore((state) => state.isCopy);

    let path;
    let midX, midY;

    // Determine path based on source and target positions
    if (sourcePosition === 'bottom' && targetPosition === 'top') {
        // Vertical layout: straight down approach
        midY = sourceY + Math.abs(targetY - sourceY) / 2;
        midX = sourceX;
        path = `
            M ${sourceX},${sourceY}
            L ${sourceX},${midY}
            L ${targetX},${midY}
            L ${targetX},${targetY}
        `;
    } else if (sourcePosition === 'right' && targetPosition === 'left') {
        // Horizontal layout: straight right approach
        midX = sourceX + Math.abs(targetX - sourceX) / 2;
        midY = sourceY;
        path = `
            M ${sourceX},${sourceY}
            L ${midX},${sourceY}
            L ${midX},${targetY}
            L ${targetX},${targetY}
        `;
    } else {
        // Fallback to original logic
        midY = sourceY + 40;
        midX = sourceX;
        path = `
            M ${sourceX},${sourceY}
            L ${sourceX},${midY}
            L ${targetX},${midY}
            L ${targetX},${targetY}
        `;
    }

    const handlePlusClick = (e) => {
        e.stopPropagation();
        setShowOptions(!showOptions);
    };

    const handleOptionClick = (option, e) => {
        e.stopPropagation();
        setShowOptions(false);

        if (option === 'addNode') {
            // Call your add node function here
            data?.onAddNode && data.onAddNode(data.targetNodeId);
        } else if (option === 'pasteFlow') {
            // Call your paste flow function here
            data?.onPasteFlow && data.onPasteFlow(data.targetNodeId);
        }
    };

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

            {/* Plus icon in the middle of the edge */}
            <g transform={`translate(${midX}, ${midY})`}>
                <circle
                    r="12"
                    fill="#4CAF50"
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                    onClick={handlePlusClick}
                />
                <Plus
                    size={16}
                    x={-8}
                    y={-8}
                    fill="white"
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                />
            </g>

            {/* Options dropdown */}
            {showOptions && (
                <g transform={`translate(${midX - 60}, ${midY + 20})`}>
                    <rect
                        width="120"
                        height={isCopy ? "60" : "30"}
                        fill="white"
                        stroke="#ccc"
                        strokeWidth="1"
                        rx="4"
                    />
                    <text
                        x="60"
                        y="20"
                        textAnchor="middle"
                        fill="#333"
                        fontSize="12"
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => handleOptionClick('addNode', e)}
                    >
                        Add Node
                    </text>
                    {isCopy && (
                        <text
                            x="60"
                            y="45"
                            textAnchor="middle"
                            fill="#333"
                            fontSize="12"
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => handleOptionClick('pasteFlow', e)}
                        >
                            Paste Flow
                        </text>
                    )}
                </g>
            )}
        </>
    );
};

// Custom edge component that includes the plus functionality
const CustomEdgeWithLabel = ({ id, sourceX, sourceY, targetX, targetY, markerEnd, label, data }) => {
    const [showOptions, setShowOptions] = useState(false);
    const isCopy = useStore((state) => state.isCopy);

    const midX = sourceX + (targetX - sourceX) / 2;
    const midY = sourceY + (targetY - sourceY) / 2;

    const handlePlusClick = (e) => {
        e.stopPropagation();
        setShowOptions(!showOptions);
    };

    const handleOptionClick = (option, e) => {
        e.stopPropagation();
        setShowOptions(false);

        if (option === 'addNode') {
            data?.onAddNode && data.onAddNode(data.targetNodeId);
        } else if (option === 'pasteFlow') {
            data?.onPasteFlow && data.onPasteFlow(data.targetNodeId);
        }
    };

    return (
        <>
            <path
                id={id}
                d={`M ${sourceX},${sourceY} L ${targetX},${targetY}`}
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

            {/* Plus icon in the middle of the edge */}
            <g transform={`translate(${midX}, ${midY})`}>
                <circle
                    r="12"
                    fill="#4CAF50"
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                    onClick={handlePlusClick}
                />
                <Plus
                    size={16}
                    x={-8}
                    y={-8}
                    fill="white"
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                />
            </g>

            {/* Options dropdown */}
            {showOptions && (
                <g transform={`translate(${midX - 60}, ${midY + 20})`}>
                    <rect
                        width="120"
                        height={isCopy ? "60" : "30"}
                        fill="white"
                        stroke="#ccc"
                        strokeWidth="1"
                        rx="4"
                    />
                    <text
                        x="60"
                        y="20"
                        textAnchor="middle"
                        fill="#333"
                        fontSize="12"
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => handleOptionClick('addNode', e)}
                    >
                        Add Node
                    </text>
                    {isCopy && (
                        <text
                            x="60"
                            y="45"
                            textAnchor="middle"
                            fill="#333"
                            fontSize="12"
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => handleOptionClick('pasteFlow', e)}
                        >
                            Paste Flow
                        </text>
                    )}
                </g>
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
    nodes.forEach(node => {
        childCounts[node.id] = 0;
    });
    edges.forEach(edge => {
        if (childCounts[edge.source] !== undefined) {
            childCounts[edge.source] += 1;
        }
    });
    return childCounts;
}

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';

    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: isHorizontal ? 150 : 110,
        ranksep: isHorizontal ? 120 : 90,
        marginx: 10,
        marginy: 10,
        ranker: "longest-path",
    });

    const nodeIds = new Set(nodes.map(n => n.id));
    const validEdges = edges.filter(edge => {
        const isValid = nodeIds.has(edge.source) && nodeIds.has(edge.target);
        if (!isValid) {
            console.warn(`Invalid edge: ${edge.source} -> ${edge.target}`);
        }
        return isValid;
    });

    const childCounts = calculateChildCounts(nodes, validEdges);

    nodes.forEach(node => {
        let width = node.width || nodeWidth;
        let height = node.height || nodeHeight;
        dagreGraph.setNode(node.id, { width, height });
    });

    validEdges.forEach(edge => {
        const edgeConfig = {
            weight: 1,
            minlen: 1
        };
        if (edge.type === 'condition') {
            edgeConfig.minlen = 2;
        }
        dagreGraph.setEdge(edge.source, edge.target, edgeConfig);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map(node => {
        const nodeWithPosition = dagreGraph.node(node.id);
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
    { id: 'e4', source: 'contact_tagged', sourceHandle: 'out', target: 'assigned_staff', targetHandle: 'in', type: 'boxEdge', label: 'Yes' },
    { id: 'e5', source: 'contact_tagged', sourceHandle: 'out', target: 'webhook', targetHandle: 'in', type: 'boxEdge', label: 'No Action' },
    { id: 'e6', source: 'assigned_staff', sourceHandle: 'out', target: 'whatsapp2', targetHandle: 'in', type: 'boxEdge', label: 'Yes Action' },
    { id: 'e7', source: 'assigned_staff', sourceHandle: 'out', target: 'email', targetHandle: 'in', type: 'boxEdge', label: 'No Action' }
];

export default function TestBuilder() {
    const [layoutDirection, setLayoutDirection] = useState('TB');
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const isCopy = useStore((state) => state.isCopy);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const createNodesWithCallbacks = useCallback((nodeList) => {
        return nodeList.map(node => ({
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
    }, [setNodes]);

    const createEdgesWithCallbacks = useCallback((edgeList) => {
        return edgeList.map(edge => ({
            ...edge,
            data: {
                ...edge.data,
                targetNodeId: edge.target,
                onAddNode: (targetNodeId) => {
                    console.log('Add node after:', targetNodeId);
                    // Your add node logic here
                    addNode(targetNodeId, {
                        type: 'actionNode',
                        label: 'New Node'
                    });
                },
                onPasteFlow: (targetNodeId) => {
                    console.log('Paste flow after:', targetNodeId);
                    // Your paste flow logic here - you have targetNodeId
                    // You can access copied nodes and edges from the store
                    // const copiedNodes = useStore.getState().copiedNodes;
                    // const copiedEdges = useStore.getState().copiedEdges;
                }
            }
        }));
    }, []);

    useEffect(() => {
        const nodesWithCallbacks = createNodesWithCallbacks(initialNodes);
        const edgesWithCallbacks = createEdgesWithCallbacks(initialEdges);

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodesWithCallbacks,
            edgesWithCallbacks,
            layoutDirection
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        const { setNodesState, setEdgesState } = useStore.getState();
        setNodesState(layoutedNodes);
        setEdgesState(layoutedEdges);
    }, [layoutDirection, createNodesWithCallbacks, createEdgesWithCallbacks, setNodes, setEdges]);

    const onConnect = useCallback((params) => {
        const newEdge = { ...params, type: 'boxEdge' };
        setEdges(eds => addEdge(newEdge, eds));

        setTimeout(() => {
            const { nodes: newLayoutedNodes, edges: newLayoutedEdges } = getLayoutedElements(
                nodes,
                [...edges, newEdge],
                layoutDirection
            );
            setNodes(newLayoutedNodes);
            setEdges(newLayoutedEdges);
        }, 100);
    }, [nodes, edges, setNodes, setEdges, layoutDirection]);

    const relayoutTree = useCallback((direction = 'TB') => {
        setLayoutDirection(direction);
        const updatedNodes = createNodesWithCallbacks(nodes);
        const updatedEdges = createEdgesWithCallbacks(edges);

        const { nodes: newLayoutedNodes, edges: newLayoutedEdges } = getLayoutedElements(
            updatedNodes,
            updatedEdges,
            direction
        );

        setNodes(newLayoutedNodes);
        setEdges(newLayoutedEdges);
    }, [nodes, edges, setNodes, setEdges, createNodesWithCallbacks, createEdgesWithCallbacks]);

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

        const { nodes: newLayoutedNodes, edges: newLayoutedEdges } = getLayoutedElements(
            updatedNodes,
            updatedEdges,
            layoutDirection
        );
        setNodes(newLayoutedNodes);
        setEdges(newLayoutedEdges);
    }, [nodes, edges, setNodes, setEdges, layoutDirection]);

    const handleNodeClick = useCallback((event, node) => {
        console.log('Node clicked:', node);
    }, []);

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

            {/* Copy status indicator */}
            {isCopy && (
                <div style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: '#4CAF50',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    fontWeight: 'bold'
                }}>
                    Flow Copied - Click + on edges to paste
                </div>
            )}

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