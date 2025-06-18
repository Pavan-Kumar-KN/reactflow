import ELK from 'elkjs/lib/elk.bundled.js';
import React, { useCallback, useLayoutEffect } from 'react';
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Handle,
  Position,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

const elk = new ELK();

// ActivePieces-style Router Node with clean vertical branching
const RouterNode = ({ data, isConnectable }) => {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '200px'
    }}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        style={{
          background: '#6b7280',
          border: '2px solid white',
          width: '8px',
          height: '8px',
          top: '-4px'
        }}
      />

      {/* Main Router Box */}
      <div style={{
        width: '180px',
        padding: '16px',
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '20px',
          marginBottom: '8px'
        }}>
          🔀
        </div>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '4px'
        }}>
          {data.label}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#6b7280'
        }}>
          Router
        </div>
      </div>

      {/* Branch Labels and Handles */}
      <div style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}>
        {/* Branch 1 (YES) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            Branch 1
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            id="branch1"
            isConnectable={isConnectable}
            style={{
              background: '#059669',
              border: '2px solid white',
              width: '8px',
              height: '8px',
              position: 'relative',
              transform: 'none'
            }}
          />
        </div>

        {/* Otherwise Branch */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            Otherwise
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            id="otherwise"
            isConnectable={isConnectable}
            style={{
              background: '#dc2626',
              border: '2px solid white',
              width: '8px',
              height: '8px',
              position: 'relative',
              transform: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ActivePieces-style Action Node
const ActionNode = ({ data, isConnectable }) => {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '200px'
    }}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        style={{
          background: '#6b7280',
          border: '2px solid white',
          width: '8px',
          height: '8px',
          top: '-4px'
        }}
      />

      {/* Main Action Box */}
      <div style={{
        width: '180px',
        padding: '16px',
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          flexShrink: 0
        }}>
          ⚡
        </div>
        <div style={{
          flex: 1,
          textAlign: 'left'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '2px'
          }}>
            {data.label}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Action Step
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        style={{
          background: '#6b7280',
          border: '2px solid white',
          width: '8px',
          height: '8px',
          bottom: '-4px'
        }}
      />
    </div>
  );
};

// Custom Edge Component for better visual connections
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, markerEnd, style, label }) => {
  const edgePath = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;

  return (
    <>
      <path
        id={id}
        d={edgePath}
        stroke={style?.stroke || '#64748b'}
        strokeWidth={style?.strokeWidth || 2}
        fill="none"
        markerEnd={markerEnd}
      />
      {label && (
        <text>
          <textPath href={`#${id}`} startOffset="50%" textAnchor="middle" fill="#374151" fontSize="12" fontWeight="600">
            {label}
          </textPath>
        </text>
      )}
    </>
  );
};

// Node types mapping
const nodeTypes = {
  routerNode: RouterNode,
  actionNode: ActionNode,
};

// Edge types mapping
const edgeTypes = {
  custom: CustomEdge,
};

// ELK layout options optimized for ActivePieces-style vertical branching
const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.layered.spacing.nodeNodeBetweenLayers': '80',
  'elk.spacing.nodeNode': '120',
  'elk.layered.spacing.edgeNodeBetweenLayers': '40',
  'elk.spacing.edgeNode': '30',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
  'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
};

// ActivePieces-style workflow nodes with proper branching
const initialNodes = [
  // Start action
  {
    id: 'start',
    type: 'actionNode',
    data: { label: 'Start Process' },
    width: 200,
    height: 80
  },

  // Main router
  {
    id: 'router1',
    type: 'routerNode',
    data: { label: 'Check User Status' },
    width: 200,
    height: 120
  },

  // Branch 1 path (left side)
  {
    id: 'action1',
    type: 'actionNode',
    data: { label: 'Send Welcome Email' },
    width: 200,
    height: 80
  },

  // Otherwise path (right side) - another router
  {
    id: 'router2',
    type: 'routerNode',
    data: { label: 'Check Account Type' },
    width: 200,
    height: 120
  },

  // Router2 Branch 1 (Premium)
  {
    id: 'action2',
    type: 'actionNode',
    data: { label: 'Upgrade to Premium' },
    width: 200,
    height: 80
  },

  // Router2 Otherwise (Basic)
  {
    id: 'action3',
    type: 'actionNode',
    data: { label: 'Setup Basic Account' },
    width: 200,
    height: 80
  },

  // Final convergence
  {
    id: 'end',
    type: 'actionNode',
    data: { label: 'Complete Setup' },
    width: 200,
    height: 80
  },
];

// Clean edges for ActivePieces-style vertical flow
const initialEdges = [
  // Start to router1
  {
    id: 'e1',
    source: 'start',
    sourceHandle: 'out',
    target: 'router1',
    targetHandle: 'in',
    type: 'straight',
    style: { stroke: '#6b7280', strokeWidth: 2 }
  },

  // Router1 Branch 1 (left path)
  {
    id: 'e2',
    source: 'router1',
    sourceHandle: 'branch1',
    target: 'action1',
    targetHandle: 'in',
    type: 'straight',
    style: { stroke: '#059669', strokeWidth: 2 }
  },

  // Router1 Otherwise (right path)
  {
    id: 'e3',
    source: 'router1',
    sourceHandle: 'otherwise',
    target: 'router2',
    targetHandle: 'in',
    type: 'straight',
    style: { stroke: '#dc2626', strokeWidth: 2 }
  },

  // Router2 Branch 1 (Premium)
  {
    id: 'e4',
    source: 'router2',
    sourceHandle: 'branch1',
    target: 'action2',
    targetHandle: 'in',
    type: 'straight',
    style: { stroke: '#059669', strokeWidth: 2 }
  },

  // Router2 Otherwise (Basic)
  {
    id: 'e5',
    source: 'router2',
    sourceHandle: 'otherwise',
    target: 'action3',
    targetHandle: 'in',
    type: 'straight',
    style: { stroke: '#dc2626', strokeWidth: 2 }
  },

  // Convergence to end
  {
    id: 'e6',
    source: 'action1',
    sourceHandle: 'out',
    target: 'end',
    targetHandle: 'in',
    type: 'straight',
    style: { stroke: '#6b7280', strokeWidth: 2 }
  },
  {
    id: 'e7',
    source: 'action2',
    sourceHandle: 'out',
    target: 'end',
    targetHandle: 'in',
    type: 'straight',
    style: { stroke: '#6b7280', strokeWidth: 2 }
  },
  {
    id: 'e8',
    source: 'action3',
    sourceHandle: 'out',
    target: 'end',
    targetHandle: 'in',
    type: 'straight',
    style: { stroke: '#6b7280', strokeWidth: 2 }
  },
];

const getLayoutedElements = (nodes, edges, options = {}) => {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  const graph = {
    id: 'root',
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      // Consistent dimensions for clean layout
      width: 200,
      height: node.type === 'routerNode' ? 120 : 80,
    })),
    edges: edges,
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => ({
      nodes: layoutedGraph.children.map((node) => ({
        ...node,
        position: { x: node.x, y: node.y },
      })),
      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};

function LayoutFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  
  const onLayout = useCallback(
    ({ direction, useInitialNodes = false }) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
      const ns = useInitialNodes ? initialNodes : nodes;
      const es = useInitialNodes ? initialEdges : edges;

      getLayoutedElements(ns, es, opts).then(
        ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          fitView();
        },
      );
    },
    [nodes, edges, fitView, setNodes, setEdges],
  );

  useLayoutEffect(() => {
    onLayout({ direction: 'DOWN', useInitialNodes: true });
  }, [onLayout]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Panel position="top-right">
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
            <button
              style={{
                padding: '12px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
              onClick={() => onLayout({ direction: 'DOWN' })}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              🔄 Re-layout Flow
            </button>
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#f1f5f9',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#64748b',
              textAlign: 'center'
            }}>
              ActivePieces Style<br/>Vertical Layout
            </div>
          </div>
        </Panel>
        <Panel position="bottom-left">
          <div style={{
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            minWidth: '200px'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '12px', color: '#1e293b' }}>
              🎯 ActivePieces Style Flow
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px'
              }}>🔀</div>
              <span style={{ fontSize: '13px', color: '#475569' }}>Condition Router</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: 'white',
                border: '2px solid #e2e8f0',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px'
              }}>⚡</div>
              <span style={{ fontSize: '13px', color: '#475569' }}>Action Step</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{
                width: '20px',
                height: '3px',
                backgroundColor: '#10b981',
                borderRadius: '2px'
              }}></div>
              <span style={{ fontSize: '13px', color: '#475569' }}>YES Path</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '3px',
                backgroundColor: '#ef4444',
                borderRadius: '2px'
              }}></div>
              <span style={{ fontSize: '13px', color: '#475569' }}>NO Path</span>
            </div>
          </div>
        </Panel>
        <Background />
      </ReactFlow>
    </div>
  );
}

export default function ELKBuilder() {
  return (
    <ReactFlowProvider>
      <LayoutFlow />
    </ReactFlowProvider>
  );
}