import { ReactFlowProvider, addEdge, ReactFlow, applyEdgeChanges, applyNodeChanges } from '@xyflow/react'
import React, { useCallback, useState } from 'react'
import Sidebar from '../components/ui/sidebar'
import '@xyflow/react/dist/style.css';
import { ColorBuilder } from '../components/custom_nodes/ColorBuilder';
import { generateWorkflowJSON, validateWorkflowJSON } from '../components/converters/JsonConverter';

let id = 0;
const getid = () => `node-${id++}`;

// Define your custom node types
const nodeTypes = {
    colorNode: ColorBuilder,
    // Add more node types as needed
    // triggerNode: TriggerNode, // You'll need to create these components
    // actionNode: ActionNode,
    // conditionalNode: ConditionalNode,
};

const WorkFlowBuilder2 = () => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [workflowMetadata, setWorkflowMetadata] = useState({
        name: 'My Workflow',
        description: 'A custom automation workflow',
        active: true,
        executionMode: 'sequential'
    });

    // Enhanced JSON generation function
    const generateAndLogWorkflowJSON = useCallback((currentNodes, currentEdges, action = 'unknown') => {
        const workflowJSON = generateWorkflowJSON(currentNodes, currentEdges, {
            ...workflowMetadata,
            lastAction: action,
            lastModified: new Date().toISOString(),
            nodeCount: currentNodes.length,
            edgeCount: currentEdges.length
        });

        console.log(`[${action.toUpperCase()}] Generated Workflow JSON:`, JSON.stringify(workflowJSON, null, 2));
        
        // Validate the JSON
        const isValid = validateWorkflowJSON(workflowJSON);
        if (isValid) {
            console.log('✅ Workflow JSON is valid and ready for backend');
        } else {
            console.warn('⚠️ Workflow JSON has validation issues');
        }

        // Here you could also send to your backend
        // sendToBackend(workflowJSON);

        return workflowJSON;
    }, [workflowMetadata]);

    // Enhanced connection handler
    const onConnect = useCallback(
        (params) => {
            setEdges((eds) => {
                const updatedEdges = addEdge(params, eds);
                generateAndLogWorkflowJSON(nodes, updatedEdges, 'edge_connected');
                return updatedEdges;
            });
        },
        [nodes, generateAndLogWorkflowJSON]
    );

    // Enhanced edge deletion handler
    const onEdgesDelete = useCallback(
        (deletedEdges) => {
            setEdges((eds) => {
                const updatedEdges = eds.filter(e => !deletedEdges.some(de => de.id === e.id));
                generateAndLogWorkflowJSON(nodes, updatedEdges, 'edge_deleted');
                return updatedEdges;
            });
        },
        [nodes, generateAndLogWorkflowJSON]
    );

    // Enhanced node deletion handler
    const onNodesDelete = useCallback(
        (deletedNodes) => {
            setNodes((nds) => {
                const updatedNodes = nds.filter(n => !deletedNodes.some(dn => dn.id === n.id));
                // Also remove edges connected to deleted nodes
                setEdges((eds) => {
                    const updatedEdges = eds.filter(e => 
                        !deletedNodes.some(dn => dn.id === e.source || dn.id === e.target)
                    );
                    generateAndLogWorkflowJSON(updatedNodes, updatedEdges, 'node_deleted');
                    return updatedEdges;
                });
                return updatedNodes;
            });
        },
        [generateAndLogWorkflowJSON]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Enhanced drop handler with better node creation
    const onDrop = useCallback((event) => {
        event.preventDefault();

        const reactFlowBounds = event.currentTarget.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');

        if (!type) return;

        const position = {
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top - 30,
        };

        // Enhanced node creation based on type
        const createNodeData = (nodeType) => {
            const baseData = {
                label: `${nodeType} node`,
                name: `${nodeType}-${getid()}`,
                enabled: true
            };

            switch (nodeType) {
                case 'triggerNode':
                    return {
                        ...baseData,
                        triggerType: 'manual',
                        conditions: [],
                        schedule: null
                    };

                case 'conditionalNode':
                case 'ifNode':
                    return {
                        ...baseData,
                        condition: '',
                        operator: 'equals',
                        value: '',
                        branches: ['true', 'false']
                    };

                case 'actionNode':
                    return {
                        ...baseData,
                        actionType: 'custom',
                        parameters: {},
                        retryPolicy: { maxRetries: 3, delay: 1000 }
                    };

                case 'colorNode':
                    return {
                        ...baseData,
                        color: '#ff0000',
                        onChange: (event) => {
                            console.log('Color changed:', event.target.value);
                            // Update node data when color changes
                            setNodes((nds) => {
                                const updatedNodes = nds.map((node) => {
                                    if (node.id === newNode.id) {
                                        return {
                                            ...node,
                                            data: { ...node.data, color: event.target.value }
                                        };
                                    }
                                    return node;
                                });
                                generateAndLogWorkflowJSON(updatedNodes, edges, 'node_data_changed');
                                return updatedNodes;
                            });
                        }
                    };

                default:
                    return baseData;
            }
        };

        const newNode = {
            id: getid(),
            type,
            position,
            data: createNodeData(type),
        };

        setNodes((nds) => {
            const updatedNodes = [...nds, newNode];
            generateAndLogWorkflowJSON(updatedNodes, edges, 'node_added');
            return updatedNodes;
        });

    }, [setNodes, edges, generateAndLogWorkflowJSON]);

    // Enhanced change handlers
    const onEdgeChanges = useCallback((changes) => {
        setEdges((eds) => {
            const updatedEdges = applyEdgeChanges(changes, eds);
            // Only generate JSON for significant changes (not just selection)
            const hasSignificantChange = changes.some(change => 
                change.type === 'remove' || change.type === 'add'
            );
            if (hasSignificantChange) {
                generateAndLogWorkflowJSON(nodes, updatedEdges, 'edge_changed');
            }
            return updatedEdges;
        });
    }, [setEdges, nodes, generateAndLogWorkflowJSON]);

    const onNodeChanges = useCallback((changes) => {
        setNodes((nds) => {
            const updatedNodes = applyNodeChanges(changes, nds);
            // Only generate JSON for significant changes
            const hasSignificantChange = changes.some(change => 
                change.type === 'remove' || change.type === 'add' || change.type === 'position'
            );
            if (hasSignificantChange) {
                generateAndLogWorkflowJSON(updatedNodes, edges, 'node_changed');
            }
            return updatedNodes;
        });
    }, [setNodes, edges, generateAndLogWorkflowJSON]);

    // Function to manually trigger JSON generation (useful for saving)
    const saveWorkflow = useCallback(() => {
        const workflowJSON = generateAndLogWorkflowJSON(nodes, edges, 'manual_save');
        
        // Here you would typically send to your backend
        // Example:
        // fetch('/api/workflows', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(workflowJSON)
        // });

        return workflowJSON;
    }, [nodes, edges, generateAndLogWorkflowJSON]);

    // Function to load workflow from JSON
    const loadWorkflow = useCallback((workflowJSON) => {
        if (workflowJSON.settings?.ui?.nodes) {
            setNodes(workflowJSON.settings.ui.nodes);
        }
        if (workflowJSON.settings?.connections) {
            const loadedEdges = workflowJSON.settings.connections.map(conn => ({
                id: conn.id,
                source: conn.source,
                target: conn.target,
                label: conn.label,
                type: conn.type || 'default'
            }));
            setEdges(loadedEdges);
        }
        
        setWorkflowMetadata({
            name: workflowJSON.name,
            description: workflowJSON.description,
            active: workflowJSON.active,
            executionMode: workflowJSON.settings?.execution?.mode || 'sequential'
        });

        console.log('Workflow loaded successfully');
    }, []);

    return (
        <>
            <ReactFlowProvider>
                <div style={{ flexGrow: 1 }}
                     onDrop={onDrop}
                     onDragOver={onDragOver}>
                    
                    {/* Optional: Add workflow controls */}
                    <div style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                        <button onClick={saveWorkflow} style={{ marginRight: '10px' }}>
                            Save Workflow
                        </button>
                        <span>Nodes: {nodes.length} | Edges: {edges.length}</span>
                        <span style={{ marginLeft: '20px' }}>
                            Workflow: {workflowMetadata.name}
                        </span>
                    </div>

                    <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
                        <Sidebar />

                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onConnect={onConnect}
                            onEdgesDelete={onEdgesDelete}
                            onNodesDelete={onNodesDelete}
                            onNodesChange={onNodeChanges}
                            onEdgesChange={onEdgeChanges}
                            nodeTypes={nodeTypes}
                            fitView
                            deleteKeyCode="Delete"
                            multiSelectionKeyCode="Ctrl"
                        >
                        </ReactFlow>
                    </div>
                </div>
            </ReactFlowProvider>
        </>
    );
};

export default WorkFlowBuilder2;