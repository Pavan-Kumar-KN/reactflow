import React, { useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

// Enhanced Conditional Node Component
export const ConditionalNode = ({ data, id }) => {
    const [condition, setCondition] = useState(data.condition || '');
    const [operator, setOperator] = useState(data.operator || 'equals');
    const [value, setValue] = useState(data.value || '');

    const handleConditionChange = useCallback((field, newValue) => {
        const updatedData = { ...data, [field]: newValue };
        
        // Call the onChange handler if provided
        if (data.onChange) {
            data.onChange(id, updatedData);
        }
    }, [data, id]);

    return (
        <div className="conditional-node" style={{
            background: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '200px',
            position: 'relative'
        }}>
            <Handle
                type="target"
                position={Position.Top}
                style={{ background: '#ffc107' }}
            />
            
            <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#856404' }}>
                🔀 Conditional Router
            </div>
            
            <div style={{ marginBottom: '6px' }}>
                <input
                    type="text"
                    placeholder="Enter condition..."
                    value={condition}
                    onChange={(e) => {
                        setCondition(e.target.value);
                        handleConditionChange('condition', e.target.value);
                    }}
                    style={{
                        width: '100%',
                        padding: '4px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '12px'
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                <select
                    value={operator}
                    onChange={(e) => {
                        setOperator(e.target.value);
                        handleConditionChange('operator', e.target.value);
                    }}
                    style={{ flex: 1, padding: '4px', fontSize: '12px' }}
                >
                    <option value="equals">Equals</option>
                    <option value="not_equals">Not Equals</option>
                    <option value="greater_than">Greater Than</option>
                    <option value="less_than">Less Than</option>
                    <option value="contains">Contains</option>
                    <option value="exists">Exists</option>
                </select>
                
                <input
                    type="text"
                    placeholder="Value"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        handleConditionChange('value', e.target.value);
                    }}
                    style={{ flex: 1, padding: '4px', fontSize: '12px' }}
                />
            </div>

            {/* Multiple output handles for different conditions */}
            <Handle
                type="source"
                position={Position.Right}
                id="true"
                style={{ 
                    background: '#28a745', 
                    top: '30%',
                    right: '-8px'
                }}
            />
            <div style={{
                position: 'absolute',
                right: '12px',
                top: '25%',
                fontSize: '10px',
                color: '#28a745',
                fontWeight: 'bold'
            }}>
                TRUE
            </div>

            <Handle
                type="source"
                position={Position.Right}
                id="false"
                style={{ 
                    background: '#dc3545', 
                    top: '70%',
                    right: '-8px'
                }}
            />
            <div style={{
                position: 'absolute',
                right: '12px',
                top: '65%',
                fontSize: '10px',
                color: '#dc3545',
                fontWeight: 'bold'
            }}>
                FALSE
            </div>
        </div>
    );
};

// Enhanced Action Node Component
export const ActionNode = ({ data, id }) => {
    const [actionType, setActionType] = useState(data.actionType || 'custom');
    const [parameters, setParameters] = useState(data.parameters || {});

    return (
        <div className="action-node" style={{
            background: '#d1ecf1',
            border: '2px solid #17a2b8',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '150px'
        }}>
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: '#17a2b8' }}
            />
            
            <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#0c5460' }}>
                ⚡ Action Node
            </div>
            
            <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                style={{
                    width: '100%',
                    padding: '4px',
                    marginBottom: '6px',
                    fontSize: '12px'
                }}
            >
                <option value="custom">Custom Action</option>
                <option value="http">HTTP Request</option>
                <option value="email">Send Email</option>
                <option value="database">Database Query</option>
                <option value="webhook">Webhook</option>
            </select>

            <Handle
                type="source"
                position={Position.Right}
                style={{ background: '#17a2b8' }}
            />
        </div>
    );
};

// Enhanced Trigger Node Component
export const TriggerNode = ({ data, id }) => {
    const [triggerType, setTriggerType] = useState(data.triggerType || 'manual');

    return (
        <div className="trigger-node" style={{
            background: '#d4edda',
            border: '2px solid #28a745',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '150px'
        }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#155724' }}>
                🚀 Trigger
            </div>
            
            <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                style={{
                    width: '100%',
                    padding: '4px',
                    fontSize: '12px'
                }}
            >
                <option value="manual">Manual</option>
                <option value="schedule">Schedule</option>
                <option value="webhook">Webhook</option>
                <option value="email">Email</option>
                <option value="file">File Change</option>
            </select>

            <Handle
                type="source"
                position={Position.Right}
                style={{ background: '#28a745' }}
            />
        </div>
    );
};

// Join Node Component (for merging parallel paths)
export const JoinNode = ({ data, id }) => {
    const [joinType, setJoinType] = useState(data.joinType || 'waitForAll');

    return (
        <div className="join-node" style={{
            background: '#f8d7da',
            border: '2px solid #dc3545',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '150px'
        }}>
            <Handle
                type="target"
                position={Position.Left}
                id="input1"
                style={{ background: '#dc3545', top: '30%' }}
            />
            <Handle
                type="target"
                position={Position.Left}
                id="input2"
                style={{ background: '#dc3545', top: '70%' }}
            />
            
            <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#721c24' }}>
                🔗 Join Point
            </div>
            
            <select
                value={joinType}
                onChange={(e) => setJoinType(e.target.value)}
                style={{
                    width: '100%',
                    padding: '4px',
                    fontSize: '12px'
                }}
            >
                <option value="waitForAll">Wait for All</option>
                <option value="waitForAny">Wait for Any</option>
                <option value="noWait">No Wait</option>
            </select>

            <Handle
                type="source"
                position={Position.Right}
                style={{ background: '#dc3545' }}
            />
        </div>
    );
};

// Custom Edge Component with conditional labels
export const ConditionalEdge = ({ 
    id, 
    sourceX, 
    sourceY, 
    targetX, 
    targetY, 
    sourcePosition, 
    targetPosition,
    style = {},
    data = {},
    markerEnd 
}) => {
    const edgePath = `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`;
    
    // Determine edge color based on condition
    const getEdgeColor = (condition) => {
        switch (condition) {
            case 'true': return '#28a745';
            case 'false': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const edgeColor = getEdgeColor(data.condition);

    return (
        <>
            <path
                id={id}
                style={{ ...style, stroke: edgeColor, strokeWidth: 2 }}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
            />
            {data.condition && (
                <text>
                    <textPath href={`#${id}`} style={{ fontSize: 12, fill: edgeColor }} startOffset="50%" textAnchor="middle">
                        {data.condition.toUpperCase()}
                    </textPath>
                </text>
            )}
        </>
    );
};

// Example usage in your node types
export const enhancedNodeTypes = {
    colorNode: ColorBuilder,
    conditionalNode: ConditionalNode,
    actionNode: ActionNode,
    triggerNode: TriggerNode,
    joinNode: JoinNode,
};

// Example edge types
export const enhancedEdgeTypes = {
    conditional: ConditionalEdge,
};

// Helper function to create conditional connections
export const createConditionalConnection = (params, condition = 'default') => {
    return {
        ...params,
        id: `${params.source}-${params.target}-${condition}`,
        type: 'conditional',
        label: condition,
        data: {
            condition: condition,
            parallel: true, // Enable parallel execution by default
            order: 0
        }
    };
};