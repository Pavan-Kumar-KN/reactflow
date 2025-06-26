// Enhanced JSON constructor that matches backend schema
const generateWorkflowJSON = (nodes, edges, workflowMetadata = {}) => {
    // Helper function to determine node category
    const getNodeCategory = (nodeType) => {
        const categories = {
            'triggerNode': 'trigger',
            'emailTrigger': 'trigger',
            'webhookTrigger': 'trigger',
            'scheduleTrigger': 'trigger',
            'actionNode': 'action',
            'emailAction': 'action',
            'httpAction': 'action',
            'databaseAction': 'action',
            'conditionalNode': 'condition',
            'ifNode': 'condition',
            'switchNode': 'condition',
            'colorNode': 'custom',
            'textNode': 'custom'
        };
        return categories[nodeType] || 'custom';
    };

    // Helper function to extract node settings based on type
    const extractNodeSettings = (node) => {
        const baseSettings = {
            position: node.position,
            label: node.data?.label || `${node.type} node`
        };

        switch (node.type) {
            case 'triggerNode':
            case 'emailTrigger':
                return {
                    ...baseSettings,
                    triggerType: node.data?.triggerType || 'manual',
                    conditions: node.data?.conditions || [],
                    schedule: node.data?.schedule || null
                };

            case 'conditionalNode':
            case 'ifNode':
                return {
                    ...baseSettings,
                    condition: node.data?.condition || '',
                    operator: node.data?.operator || 'equals',
                    value: node.data?.value || '',
                    branches: node.data?.branches || ['true', 'false']
                };

            case 'actionNode':
            case 'emailAction':
            case 'httpAction':
                return {
                    ...baseSettings,
                    actionType: node.data?.actionType || 'custom',
                    parameters: node.data?.parameters || {},
                    retryPolicy: node.data?.retryPolicy || { maxRetries: 3, delay: 1000 }
                };

            case 'colorNode':
                return {
                    ...baseSettings,
                    color: node.data?.color || '#ff0000',
                    customProperties: node.data?.customProperties || {}
                };

            default:
                return {
                    ...baseSettings,
                    customData: node.data || {}
                };
        }
    };

    // Process triggers (nodes without incoming edges)
    const triggers = nodes
        .filter(node => {
            const hasIncomingEdge = edges.some(edge => edge.target === node.id);
            return !hasIncomingEdge && getNodeCategory(node.type) === 'trigger';
        })
        .map(node => ({
            id: node.id,
            type: node.type,
            name: node.data?.name || `Trigger ${node.id}`,
            settings: extractNodeSettings(node),
            enabled: node.data?.enabled !== false
        }));

    // Process actions (all non-trigger, non-condition nodes)
    const actions = nodes
        .filter(node => !['trigger', 'condition'].includes(getNodeCategory(node.type)))
        .map(node => ({
            id: node.id,
            type: node.type,
            name: node.data?.name || `Action ${node.id}`,
            settings: extractNodeSettings(node),
            dependencies: edges
                .filter(edge => edge.target === node.id)
                .map(edge => edge.source),
            enabled: node.data?.enabled !== false
        }));

    // Helper function to build execution paths from conditional nodes
    const buildExecutionPaths = (conditionalNode, allNodes, allEdges, visited = new Set()) => {
        if (visited.has(conditionalNode.id)) return []; // Prevent infinite loops
        visited.add(conditionalNode.id);

        const outgoingEdges = allEdges.filter(edge => edge.source === conditionalNode.id);
        const paths = {};

        outgoingEdges.forEach(edge => {
            const condition = edge.label || edge.data?.condition || 'default';
            const targetNode = allNodes.find(n => n.id === edge.target);
            
            if (!paths[condition]) {
                paths[condition] = {
                    condition: condition,
                    executionMode: edge.data?.executionMode || 'parallel', // parallel by default for multiple actions
                    actions: [],
                    subPaths: []
                };
            }

            if (targetNode) {
                if (getNodeCategory(targetNode.type) === 'condition') {
                    // Nested conditional - recursively build paths
                    const nestedPaths = buildExecutionPaths(targetNode, allNodes, allEdges, new Set(visited));
                    paths[condition].subPaths.push({
                        nodeId: targetNode.id,
                        nodeType: targetNode.type,
                        paths: nestedPaths
                    });
                } else {
                    // Regular action node
                    paths[condition].actions.push({
                        nodeId: targetNode.id,
                        nodeType: targetNode.type,
                        order: edge.data?.order || 0,
                        parallel: edge.data?.parallel !== false
                    });
                }

                // Find all subsequent nodes that should execute after this target
                const subsequentNodes = findSubsequentNodes(targetNode.id, allNodes, allEdges, visited);
                paths[condition].actions.push(...subsequentNodes);
            }
        });

        return Object.values(paths);
    };

    // Helper function to find all nodes that should execute after a given node
    const findSubsequentNodes = (nodeId, allNodes, allEdges, visited = new Set()) => {
        const subsequentActions = [];
        const nodesToProcess = [nodeId];
        const processed = new Set(visited);

        while (nodesToProcess.length > 0) {
            const currentNodeId = nodesToProcess.shift();
            if (processed.has(currentNodeId)) continue;
            processed.add(currentNodeId);

            const outgoingEdges = allEdges.filter(edge => edge.source === currentNodeId);
            
            outgoingEdges.forEach(edge => {
                const targetNode = allNodes.find(n => n.id === edge.target);
                if (targetNode && getNodeCategory(targetNode.type) !== 'condition') {
                    subsequentActions.push({
                        nodeId: targetNode.id,
                        nodeType: targetNode.type,
                        order: edge.data?.order || 0,
                        parallel: edge.data?.parallel !== false,
                        dependsOn: [currentNodeId]
                    });
                    nodesToProcess.push(targetNode.id);
                }
            });
        }

        return subsequentActions;
    };

    // Process conditions with enhanced routing logic
    const conditions = nodes
        .filter(node => getNodeCategory(node.type) === 'condition')
        .map(node => {
            const executionPaths = buildExecutionPaths(node, nodes, edges);
            
            return {
                id: node.id,
                type: node.type,
                name: node.data?.name || `Condition ${node.id}`,
                settings: extractNodeSettings(node),
                dependencies: edges
                    .filter(edge => edge.target === node.id)
                    .map(edge => edge.source),
                routing: {
                    type: node.data?.routingType || 'if-else', // if-else, switch, multi-branch
                    defaultBranch: node.data?.defaultBranch || 'false',
                    paths: executionPaths,
                    // Parallel execution settings for each branch
                    parallelExecution: {
                        enabled: node.data?.parallelExecution !== false,
                        maxConcurrency: node.data?.maxConcurrency || -1, // -1 means unlimited
                        failureHandling: node.data?.failureHandling || 'continue' // continue, stop, retry
                    }
                }
            };
        });

    // Create the automation workflow JSON matching your backend schema
    const automationWorkflow = {
        // Metadata
        name: workflowMetadata.name || 'Untitled Workflow',
        description: workflowMetadata.description || 'Generated workflow',
        active: workflowMetadata.active !== false,
        
        // Core workflow structure
        triggers: triggers.length > 0 ? triggers : [{
            id: 'default-trigger',
            type: 'manual',
            name: 'Manual Trigger',
            settings: { triggerType: 'manual' },
            enabled: true
        }],

        actions: actions.map(action => ({
            id: action.id,
            type: action.type,
            name: action.name,
            description: action.settings.label || '',
            parameters: action.settings.parameters || action.settings.customData || {},
            dependencies: action.dependencies,
            retryPolicy: action.settings.retryPolicy || { maxRetries: 3, delay: 1000 },
            enabled: action.enabled,
            position: action.settings.position
        })),

        // Settings object that matches your backend schema
        settings: {
            // Execution settings
            execution: {
                mode: workflowMetadata.executionMode || 'sequential',
                timeout: workflowMetadata.timeout || 300000, // 5 minutes
                retryPolicy: workflowMetadata.retryPolicy || {
                    enabled: true,
                    maxRetries: 3,
                    backoffStrategy: 'exponential'
                }
            },

            // Enhanced conditional logic with routing
            conditions: conditions.map(condition => ({
                id: condition.id,
                type: condition.type,
                expression: condition.settings.condition || '',
                operator: condition.settings.operator || 'equals',
                value: condition.settings.value || '',
                routing: condition.routing,
                dependencies: condition.dependencies,
                // Execution flow control
                flowControl: {
                    joinType: condition.routing?.joinType || 'waitForAll', // waitForAll, waitForAny, noWait
                    timeoutMs: condition.routing?.timeoutMs || 300000, // 5 minutes default
                    onTimeout: condition.routing?.onTimeout || 'fail' // fail, continue, skip
                }
            })),

            // Enhanced execution flow management
            executionFlow: {
                // Define execution groups for parallel processing
                executionGroups: generateExecutionGroups(nodes, edges, conditions),
                
                // Define join points where parallel paths converge
                joinPoints: identifyJoinPoints(nodes, edges),
                
                // Error handling strategies
                errorHandling: {
                    strategy: workflowMetadata.errorHandling || 'stopOnError', // stopOnError, continueOnError, retryOnError
                    maxRetries: workflowMetadata.maxRetries || 3,
                    retryDelay: workflowMetadata.retryDelay || 1000
                }
            },

            // Flow connections
            connections: edges.map(edge => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                label: edge.label || '',
                type: edge.type || 'default',
                conditions: edge.data?.conditions || null
            })),

            // UI/UX settings
            ui: {
                layout: 'flowchart',
                nodes: nodes.map(node => ({
                    id: node.id,
                    position: node.position,
                    type: node.type,
                    data: node.data
                })),
                viewport: workflowMetadata.viewport || { x: 0, y: 0, zoom: 1 }
            }
        }
    };

    return automationWorkflow;
};

// Usage in your WorkFlowBuilder component - replace your existing generateFlowJSON
const generateFlowJSON = (nodes, edges, additionalMetadata = {}) => {
    const workflowJSON = generateWorkflowJSON(nodes, edges, additionalMetadata);
    
    console.log('Generated Workflow JSON:', JSON.stringify(workflowJSON, null, 2));
    
    // You can also validate the structure here
    validateWorkflowJSON(workflowJSON);
    
    return workflowJSON;
};

// Validation function to ensure the JSON matches your backend schema
const validateWorkflowJSON = (workflowJSON) => {
    const errors = [];
    
    // Check required fields
    if (!workflowJSON.name) errors.push('Workflow name is required');
    if (!workflowJSON.triggers || workflowJSON.triggers.length === 0) {
        errors.push('At least one trigger is required');
    }
    
    // Validate triggers
    workflowJSON.triggers.forEach((trigger, index) => {
        if (!trigger.id) errors.push(`Trigger ${index} missing ID`);
        if (!trigger.type) errors.push(`Trigger ${index} missing type`);
    });
    
    // Validate actions
    workflowJSON.actions.forEach((action, index) => {
        if (!action.id) errors.push(`Action ${index} missing ID`);
        if (!action.type) errors.push(`Action ${index} missing type`);
    });
    
    // Validate connections
    if (workflowJSON.settings?.connections) {
        workflowJSON.settings.connections.forEach((connection, index) => {
            if (!connection.source || !connection.target) {
                errors.push(`Connection ${index} missing source or target`);
            }
        });
    }
    
    if (errors.length > 0) {
        console.warn('Workflow validation errors:', errors);
    } else {
        console.log('Workflow JSON validation passed ✓');
    }
    
    return errors.length === 0;
};

// Enhanced event handlers for your component
const enhancedEventHandlers = {
    // Handle node addition (when dropped)
    onNodeAdd: (newNode, existingNodes, existingEdges, metadata) => {
        const updatedNodes = [...existingNodes, newNode];
        return generateFlowJSON(updatedNodes, existingEdges, {
            ...metadata,
            lastAction: 'node_added',
            lastModified: new Date().toISOString()
        });
    },

    // Handle node deletion
    onNodeDelete: (deletedNodes, remainingNodes, updatedEdges, metadata) => {
        return generateFlowJSON(remainingNodes, updatedEdges, {
            ...metadata,
            lastAction: 'node_deleted',
            deletedNodes: deletedNodes.map(n => n.id),
            lastModified: new Date().toISOString()
        });
    },

    // Handle edge connection
    onEdgeConnect: (newEdge, existingNodes, updatedEdges, metadata) => {
        return generateFlowJSON(existingNodes, updatedEdges, {
            ...metadata,
            lastAction: 'edge_connected',
            lastConnection: { source: newEdge.source, target: newEdge.target },
            lastModified: new Date().toISOString()
        });
    },

    // Handle edge deletion
    onEdgeDelete: (deletedEdges, existingNodes, remainingEdges, metadata) => {
        return generateFlowJSON(existingNodes, remainingEdges, {
            ...metadata,
            lastAction: 'edge_deleted',
            deletedEdges: deletedEdges.map(e => e.id),
            lastModified: new Date().toISOString()
        });
    }
};

// Helper functions for execution flow management
const generateExecutionGroups = (nodes, edges, conditions) => {
    const groups = [];
    const processedNodes = new Set();

    conditions.forEach(condition => {
        condition.routing.paths.forEach((path, pathIndex) => {
            const groupId = `${condition.id}-${path.condition}-${pathIndex}`;
            
            if (path.executionMode === 'parallel' && path.actions.length > 1) {
                // Create parallel execution group
                groups.push({
                    id: groupId,
                    type: 'parallel',
                    condition: {
                        nodeId: condition.id,
                        branch: path.condition
                    },
                    actions: path.actions.map(action => ({
                        nodeId: action.nodeId,
                        order: action.order,
                        parallel: true,
                        dependsOn: action.dependsOn || []
                    })),
                    settings: {
                        maxConcurrency: path.maxConcurrency || -1,
                        failureHandling: path.failureHandling || 'continue'
                    }
                });
            } else if (path.actions.length > 0) {
                // Create sequential execution group
                groups.push({
                    id: groupId,
                    type: 'sequential',
                    condition: {
                        nodeId: condition.id,
                        branch: path.condition
                    },
                    actions: path.actions.map((action, index) => ({
                        nodeId: action.nodeId,
                        order: index,
                        parallel: false,
                        dependsOn: index > 0 ? [path.actions[index - 1].nodeId] : []
                    }))
                });
            }

            // Mark nodes as processed
            path.actions.forEach(action => processedNodes.add(action.nodeId));
        });
    });

    return groups;
};

const identifyJoinPoints = (nodes, edges) => {
    const joinPoints = [];
    const nodeIncomingCount = {};

    // Count incoming edges for each node
    edges.forEach(edge => {
        nodeIncomingCount[edge.target] = (nodeIncomingCount[edge.target] || 0) + 1;
    });

    // Find nodes with multiple incoming edges (potential join points)
    Object.entries(nodeIncomingCount).forEach(([nodeId, incomingCount]) => {
        if (incomingCount > 1) {
            const node = nodes.find(n => n.id === nodeId);
            const incomingEdges = edges.filter(e => e.target === nodeId);
            
            // Check if incoming edges are from different conditional branches
            const sourceConditions = incomingEdges.map(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                return findParentCondition(sourceNode, nodes, edges);
            }).filter(Boolean);

            if (sourceConditions.length > 1) {
                joinPoints.push({
                    nodeId: nodeId,
                    type: node?.data?.joinType || 'waitForAll',
                    incomingBranches: incomingEdges.map(edge => ({
                        sourceNodeId: edge.source,
                        condition: edge.label || 'default',
                        parentCondition: findParentCondition(nodes.find(n => n.id === edge.source), nodes, edges)
                    })),
                    settings: {
                        timeout: node?.data?.joinTimeout || 300000,
                        onTimeout: node?.data?.onJoinTimeout || 'continue'
                    }
                });
            }
        }
    });

    return joinPoints;
};

const findParentCondition = (node, allNodes, allEdges) => {
    if (!node) return null;
    
    const incomingEdges = allEdges.filter(e => e.target === node.id);
    for (const edge of incomingEdges) {
        const sourceNode = allNodes.find(n => n.id === edge.source);
        if (sourceNode && getNodeCategory(sourceNode.type) === 'condition') {
            return sourceNode.id;
        }
        // Recursively search for parent condition
        const parentCondition = findParentCondition(sourceNode, allNodes, allEdges);
        if (parentCondition) return parentCondition;
    }
    return null;
};

export { 
    generateWorkflowJSON, 
    generateFlowJSON, 
    validateWorkflowJSON, 
    enhancedEventHandlers,
    generateExecutionGroups,
    identifyJoinPoints
};  