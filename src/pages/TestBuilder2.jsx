import React, { useCallback, useState, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, useNodesState, useEdgesState, Handle, Position } from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import * as LucideIcons from 'lucide-react';

// Action Node Component with ActivePieces Style
const ActionTestNode = ({ data, selected }) => {  
  const IconComponent = data.icon || LucideIcons.Play;
  
  return (
    <div style={{ position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ background: '#4CAF50', border: '2px solid #fff' }}
      />
      
      {/* Main Node - Exact ActivePieces Style */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: selected ? '2px solid #3b82f6' : '2px solid #e5e7eb',
        boxShadow: selected ? '0 4px 12px rgba(59, 130, 246, 0.15), 0 0 0 3px rgba(59, 130, 246, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        width: '360px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderColor: '#d1d5db'
        }
      }}>
        {/* Node Content */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <IconComponent style={{ 
              width: '24px', 
              height: '24px', 
              color: data.color || '#16a34a' 
            }} />
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#374151' }}></div>
          </div>
          
          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#111827' 
            }}>
              {data.label}
            </div>
          </div>
          
          {/* Dropdown Arrow */}
          <div style={{ color: '#9ca3af' }}>
            <LucideIcons.ChevronDown style={{ width: '16px', height: '16px' }} />
          </div>
          
          {/* More Menu */}
          <div style={{ 
            color: '#9ca3af', 
            cursor: 'pointer',
            padding: '4px',
            marginLeft: '8px',
            ':hover': { color: '#6b7280' }
          }}>
            <LucideIcons.MoreVertical style={{ width: '16px', height: '16px' }} />
          </div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        style={{ background: '#4CAF50', border: '2px solid #fff' }}
      />
    </div>
  );
};

// Router Node Component with ActivePieces Style
const RouterTestNode = ({ data, selected }) => {
  const IconComponent = data.icon || LucideIcons.GitBranch;
  
  return (
    <div style={{ position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ background: '#2196F3', border: '2px solid #fff' }}
      />
      
      {/* Main Node - Exact ActivePieces Style */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: selected ? '2px solid #3b82f6' : '2px solid #e5e7eb',
        boxShadow: selected ? '0 4px 12px rgba(59, 130, 246, 0.15), 0 0 0 3px rgba(59, 130, 246, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        width: '360px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderColor: '#d1d5db'
        }
      }}>
        {/* Node Content */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <IconComponent style={{ 
              width: '24px', 
              height: '24px', 
              color: data.color || '#2563eb' 
            }} />
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#374151' }}></div>
          </div>
          
          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#111827' 
            }}>
              {data.label}
            </div>
          </div>
          
          {/* Dropdown Arrow */}
          <div style={{ color: '#9ca3af' }}>
            <LucideIcons.ChevronDown style={{ width: '16px', height: '16px' }} />
          </div>
          
          {/* More Menu */}
          <div style={{ 
            color: '#9ca3af', 
            cursor: 'pointer',
            padding: '4px',
            marginLeft: '8px',
            ':hover': { color: '#6b7280' }
          }}>
            <LucideIcons.MoreVertical style={{ width: '16px', height: '16px' }} />
          </div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        style={{ background: '#2196F3', border: '2px solid #fff' }}
      />
    </div>
  );
};

// Custom Edge Component
const BoxEdge = ({ id, sourceX, sourceY, targetX, targetY, markerEnd, label }) => {
  // Calculate a mid-point on Y axis for the horizontal segment (40px below sourceY)
  const midY = sourceY + 40;

  // Construct path with vertical, horizontal, then vertical segments (orthogonal style)
  const path = `
    M ${sourceX},${sourceY}
    L ${sourceX},${midY}
    L ${targetX},${midY}
    L ${targetX},${targetY}
  `;

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
  boxEdge: BoxEdge 
};

const nodeWidth = 360; // Updated to match new design
const nodeHeight = 100; // Updated to match new design

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
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 80,
    ranksep: 120,
    marginx: 20,
    marginy: 20
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

  // Set nodes
  nodes.forEach(node => {
    dagreGraph.setNode(node.id, {
      width: node.width || nodeWidth,
      height: node.height || nodeHeight
    });
  });

  // Set edges
  validEdges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Apply layout
  dagre.layout(dagreGraph);

  // Position nodes
  const newNodes = nodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // Safety check
    if (!nodeWithPosition) {
      console.error(`Node position not found for: ${node.id}`);
      return node;
    }

    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - (node.width || nodeWidth) / 2,
        y: nodeWithPosition.y - (node.height || nodeHeight) / 2,
      },
    };

    return newNode;
  });

  // Update edges with dynamic widths
  const newEdges = validEdges.map(edge => {
    const sourceChildCount = childCounts[edge.source] || 1;
    const edgeWidth = Math.max(2, Math.min(8, sourceChildCount * 2));

    return {
      ...edge,
      style: {
        ...edge.style,
        strokeWidth: edgeWidth,
        stroke: `hsl(${Math.min(sourceChildCount * 40, 240)}, 70%, 50%)`
      }
    };
  });

  return { nodes: newNodes, edges: newEdges };
};

const initialNodes = [
  { 
    id: 'router1', 
    type: 'routerNode', 
    data: { 
      label: 'Main Router', 
      icon: LucideIcons.GitBranch,
      color: '#2563eb' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
  { 
    id: 'branch1_router', 
    type: 'routerNode', 
    data: { 
      label: 'Branch 1 Router', 
      icon: LucideIcons.GitBranch,
      color: '#2563eb' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
  { 
    id: 'branch2_node', 
    type: 'actionNode', 
    data: { 
      label: 'Branch 2 Node', 
      icon: LucideIcons.Play,
      color: '#16a34a' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
  { 
    id: 'yes_subrouter', 
    type: 'routerNode', 
    data: { 
      label: 'Yes Router', 
      icon: LucideIcons.GitBranch,
      color: '#2563eb' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
  { 
    id: 'yes_yes_node', 
    type: 'actionNode', 
    data: { 
      label: 'YES → Node', 
      icon: LucideIcons.CheckCircle,
      color: '#16a34a' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
  { 
    id: 'yes_no_router', 
    type: 'routerNode', 
    data: { 
      label: 'Yes No Router', 
      icon: LucideIcons.GitBranch,
      color: '#2563eb' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
  { 
    id: 'yes_no_node1', 
    type: 'actionNode', 
    data: { 
      label: 'NO → Node 1', 
      icon: LucideIcons.XCircle,
      color: '#dc2626' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
  { 
    id: 'yes_no_node2', 
    type: 'actionNode', 
    data: { 
      label: 'NO → Node 2', 
      icon: LucideIcons.XCircle,
      color: '#dc2626' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
  { 
    id: 'branch1_no_router', 
    type: 'routerNode', 
    data: { 
      label: 'Branch 1 No Router', 
      icon: LucideIcons.GitBranch,
      color: '#2563eb' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
  { 
    id: 'branch1_no_node1', 
    type: 'actionNode', 
    data: { 
      label: 'NO → Node 1', 
      icon: LucideIcons.XCircle,
      color: '#dc2626' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
  { 
    id: 'branch1_no_node2', 
    type: 'actionNode', 
    data: { 
      label: 'NO → Node 2', 
      icon: LucideIcons.XCircle,
      color: '#dc2626' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
  { 
    id: 'otherwise_router', 
    type: 'routerNode', 
    data: { 
      label: 'Otherwise Router', 
      icon: LucideIcons.GitBranch,
      color: '#2563eb' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
  { 
    id: 'otherwise_node1', 
    type: 'actionNode', 
    data: { 
      label: 'Otherwise Node 1', 
      icon: LucideIcons.AlertCircle,
      color: '#ea580c' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
  { 
    id: 'otherwise_node2', 
    type: 'actionNode', 
    data: { 
      label: 'Otherwise Node 2', 
      icon: LucideIcons.AlertCircle,
      color: '#ea580c' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
  { 
    id: 'otherwise_no_router', 
    type: 'routerNode', 
    data: { 
      label: 'Otherwise No Router', 
      icon: LucideIcons.GitBranch,
      color: '#2563eb' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
  { 
    id: 'otherwise_no_node1', 
    type: 'actionNode', 
    data: { 
      label: 'Otherwise NO Node 1', 
      icon: LucideIcons.XCircle,
      color: '#dc2626' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
  { 
    id: 'otherwise_no_node2', 
    type: 'actionNode', 
    data: { 
      label: 'Otherwise NO Node 2', 
      icon: LucideIcons.XCircle,
      color: '#dc2626' 
    }, 
    width: 360, 
    height: 100,
    position: { x: 0, y: 0 }
  },
];

const initialEdges = [
  { id: 'e1', source: 'router1', sourceHandle: 'out', target: 'branch1_router', targetHandle: 'in', type: 'boxEdge', label: 'Branch 1' },
  { id: 'e2', source: 'router1', sourceHandle: 'out', target: 'branch2_node', targetHandle: 'in', type: 'boxEdge', label: 'Otherwise' },
  { id: 'e3', source: 'branch1_router', sourceHandle: 'out', target: 'yes_subrouter', targetHandle: 'in', type: 'boxEdge', label: 'Yes' },
  { id: 'e4', source: 'branch1_router', sourceHandle: 'out', target: 'branch1_no_router', targetHandle: 'in', type: 'boxEdge', label: 'No' },
  { id: 'e4-1', source: 'branch1_no_router', sourceHandle: 'out', target: 'branch1_no_node1', targetHandle: 'in', type: 'boxEdge', label: 'No 1' },
  { id: 'e4-2', source: 'branch1_no_router', sourceHandle: 'out', target: 'branch1_no_node2', targetHandle: 'in', type: 'boxEdge', label: 'No 2' },
  { id: 'e5', source: 'yes_subrouter', sourceHandle: 'out', target: 'yes_yes_node', targetHandle: 'in', type: 'boxEdge', label: 'Yes' },
  { id: 'e6', source: 'yes_subrouter', sourceHandle: 'out', target: 'yes_no_router', targetHandle: 'in', type: 'boxEdge', label: 'No' },
  { id: 'e6-1', source: 'yes_no_router', sourceHandle: 'out', target: 'yes_no_node1', targetHandle: 'in', type: 'boxEdge', label: 'No 1' },
  { id: 'e6-2', source: 'yes_no_router', sourceHandle: 'out', target: 'yes_no_node2', targetHandle: 'in', type: 'boxEdge', label: 'No 2' },
  { id: 'e7', source: 'branch2_node', sourceHandle: 'out', target: 'otherwise_router', targetHandle: 'in', type: 'boxEdge', label: 'Router' },
  { id: 'e7-1', source: 'otherwise_router', sourceHandle: 'out', target: 'otherwise_node1', targetHandle: 'in', type: 'boxEdge', label: 'Node 1' },
  { id: 'e7-2', source: 'otherwise_router', sourceHandle: 'out', target: 'otherwise_node2', targetHandle: 'in', type: 'boxEdge', label: 'Node 2' },
  { id: 'e8', source: 'otherwise_router', sourceHandle: 'out', target: 'otherwise_no_router', targetHandle: 'in', type: 'boxEdge', label: 'No' },
  { id: 'e8-1', source: 'otherwise_no_router', sourceHandle: 'out', target: 'otherwise_no_node1', targetHandle: 'in', type: 'boxEdge', label: 'No 1' },
  { id: 'e8-2', source: 'otherwise_no_router', sourceHandle: 'out', target: 'otherwise_no_node2', targetHandle: 'in', type: 'boxEdge', label: 'No 2' },
];

export default function TestBuilder2() {
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onConnect = useCallback((params) => {
    const newEdge = { ...params, type: 'boxEdge' };
    setEdges(eds => addEdge(newEdge, eds));

    // Re-layout after new connection
    setTimeout(() => {
      const { nodes: newLayoutedNodes, edges: newLayoutedEdges } = getLayoutedElements(nodes, [...edges, newEdge]);
      setNodes(newLayoutedNodes);
      setEdges(newLayoutedEdges);
    }, 100);
  }, [nodes, edges, setNodes, setEdges]);

  // Function to manually trigger re-layout
  const relayoutTree = useCallback((direction = 'TB') => {
    const { nodes: newLayoutedNodes, edges: newLayoutedEdges } = getLayoutedElements(nodes, edges, direction);
    setNodes(newLayoutedNodes);
    setEdges(newLayoutedEdges);
  }, [nodes, edges, setNodes, setEdges]);

  // Function to add a new node
  const addNode = useCallback((parentId, nodeData) => {
    const newNodeId = `node_${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: nodeData.type || 'actionNode',
      data: nodeData,
      width: 360,
      height: 100,
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
    const { nodes: newLayoutedNodes, edges: newLayoutedEdges } = getLayoutedElements(updatedNodes, updatedEdges);
    setNodes(newLayoutedNodes);
    setEdges(newLayoutedEdges);
  }, [nodes, edges, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
        zIndex: 1000
      }}>
        
      </div>
    </div>
  );
}