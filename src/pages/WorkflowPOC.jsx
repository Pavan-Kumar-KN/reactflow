import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';

// Custom Placeholder Node Component
const PlaceholderNode = ({ data }) => (
  <div
    onClick={data.onClick}
    style={{
      border: '1px dashed gray',
      background: '#f0f0f0',
      padding: 10,
      textAlign: 'center',
      cursor: 'pointer',
      borderRadius: 5,
    }}
  >
    <Handle type="target" position={Position.Top} id="in" style={{ background: 'gray' }} />
    {data.label}
  </div>
);

const ConditionNode = ({ data }) => (
  <div
    style={{
      padding: 10,
      background: '#fff3cd',
      border: '2px solid #ffeeba',
      borderRadius: 5,
      textAlign: 'center',
      minWidth: 120,
      position: 'relative',
    }}
  >
    <div>{data.label}</div>
    <Handle type="source" position={Position.Bottom} id="yes" style={{ left: 10, background: 'green' }} />
    <Handle type="source" position={Position.Bottom} id="no" style={{ right: 10, left: 'auto', background: 'red' }} />
  </div>
);

const ActionNode = ({ data }) => (
  <div style={{ padding: 10, background: '#d1e7dd', borderRadius: 5 }}>
    <Handle type="target" position={Position.Top} id="in" style={{ background: 'gray' }} />
    <Handle type="source" position={Position.Bottom} id="out" style={{ background: 'gray' }} />
    {data.label}
  </div>
);

const GhostNode = ({ data }) => (
  <div style={{ padding: 10, background: '#e0e0e0', fontStyle: 'italic', borderRadius: 5 }}>
    <Handle type="target" position={Position.Top} id="in" style={{ background: 'gray' }} />
    {data.label}
  </div>
);

// Initial Node Data
const initialNodes = [
  {
    id: 'condition-1',
    type: 'condition',
    position: { x: 250, y: 50 },
    data: { label: 'IF Condition' },
  },
  {
    id: 'yes-placeholder',
    type: 'placeholder',
    position: { x: 100, y: 200 },
    data: {
      label: 'Add Node (Yes)',
      branchType: 'yes',
      conditionNodeId: 'condition-1',
    },
  },
  {
    id: 'no-placeholder',
    type: 'placeholder',
    position: { x: 400, y: 200 },
    data: {
      label: 'Add Node (No)',
      branchType: 'no',
      conditionNodeId: 'condition-1',
    },
  },
];

// Initial Edges
const initialEdges = [
  {
    id: 'edge-condition-yes',
    source: 'condition-1',
    sourceHandle: 'yes',
    target: 'yes-placeholder',
    label: 'Yes',
    data: { branchType: 'yes', conditionNodeId: 'condition-1' },
  },
  {
    id: 'edge-condition-no',
    source: 'condition-1',
    sourceHandle: 'no',
    target: 'no-placeholder',
    label: 'No',
    data: { branchType: 'no', conditionNodeId: 'condition-1' },
  },
];

const nodeWidth = 200;
const nodeHeight = 80;

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

const WorkflowPOC = () => {
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
  const [nodes, setNodes] = useState(layoutedNodes);
  const [edges, setEdges] = useState(layoutedEdges);

  const handlePlaceholderClick = useCallback((branchType) => {
    const timestamp = Date.now();
    const newNodeId = `node-${branchType}-${timestamp}`;
    const ghostId = `ghost-${branchType}-${timestamp}`;
    const placeholderId = `${branchType}-placeholder`;

    setNodes((prev) => {
      const oldPlaceholder = prev.find((n) => n.id === placeholderId);
      const filtered = prev.filter((n) => n.id !== placeholderId);

      const newActionNode = {
        id: newNodeId,
        type: 'action',
        position: oldPlaceholder.position,
        data: {
          label: `Action (${branchType.toUpperCase()})`,
          branchType,
          conditionNodeId: 'condition-1',
        },
      };

      const ghostNode = {
        id: ghostId,
        type: 'ghost',
        position: {
          x: oldPlaceholder.position.x,
          y: oldPlaceholder.position.y + 100,
        },
        data: {
          label: 'Ghost',
          branchType,
          conditionNodeId: 'condition-1',
        },
      };

      return [...filtered, newActionNode, ghostNode];
    });

    setEdges((prev) => {
      const filtered = prev.filter((e) => e.target !== placeholderId);

      return [
        ...filtered,
        {
          id: `edge-${branchType}-${newNodeId}`,
          source: 'condition-1',
          sourceHandle: branchType,
          target: newNodeId,
          label: branchType.toUpperCase(),
          data: { branchType, conditionNodeId: 'condition-1' },
        },
        {
          id: `edge-${newNodeId}-${ghostId}`,
          source: newNodeId,
          target: ghostId,
          data: { branchType, conditionNodeId: 'condition-1' },
        },
      ];
    });
  }, []);

  const handleConditionNodeClick = useCallback((event, conditionNode) => {
    const conditionNodeId = conditionNode.id;

    const yesNodes = nodes.filter(
      (n) => n.data?.conditionNodeId === conditionNodeId && n.data?.branchType === 'yes'
    );
    const noNodes = nodes.filter(
      (n) => n.data?.conditionNodeId === conditionNodeId && n.data?.branchType === 'no'
    );

    if (yesNodes.length === 0 && noNodes.length === 0) return;

    const confirmSwap = window.confirm('Do you want to interchange the YES and NO branches for this condition?');
    if (!confirmSwap) return;

    // Store current positions before swapping
    const yesPositions = yesNodes.map(node => ({ id: node.id, position: node.position }));
    const noPositions = noNodes.map(node => ({ id: node.id, position: node.position }));

    // Swap nodes with preserved positions
    setNodes((prev) =>
      prev.map((node) => {
        if (node.data?.conditionNodeId !== conditionNodeId) return node;

        if (node.data.branchType === 'yes') {
          // Find the corresponding position from the "no" branch
          const noNodeIndex = yesNodes.findIndex(n => n.id === node.id);
          const correspondingNoPosition = noPositions[noNodeIndex];
          
          return { 
            ...node, 
            data: { ...node.data, branchType: 'no' },
            position: correspondingNoPosition ? correspondingNoPosition.position : node.position
          };
        } else if (node.data.branchType === 'no') {
          // Find the corresponding position from the "yes" branch
          const yesNodeIndex = noNodes.findIndex(n => n.id === node.id);
          const correspondingYesPosition = yesPositions[yesNodeIndex];
          
          return { 
            ...node, 
            data: { ...node.data, branchType: 'yes' },
            position: correspondingYesPosition ? correspondingYesPosition.position : node.position
          };
        }

        return node;
      })
    );

    // Swap edges
    setEdges((prev) =>
      prev.map((edge) => {
        if (edge.data?.conditionNodeId !== conditionNodeId) return edge;

        const isYes = edge.data.branchType === 'yes';
        const isNo = edge.data.branchType === 'no';

        return {
          ...edge,
          data: {
            ...edge.data,
            branchType: isYes ? 'no' : isNo ? 'yes' : edge.data.branchType,
          },
          sourceHandle: isYes ? 'no' : isNo ? 'yes' : edge.sourceHandle,
          label: isYes ? 'NO' : isNo ? 'YES' : edge.label,
        };
      })
    );
  }, [nodes]);

  const nodeTypes = {
    placeholder: PlaceholderNode,
    action: ActionNode,
    ghost: GhostNode,
    condition: ConditionNode,
  };

  const nodesWithHandlers = nodes.map((node) =>
    node.type === 'placeholder'
      ? {
        ...node,
        data: {
          ...node.data,
          onClick: () => handlePlaceholderClick(node.data.branchType),
        },
      }
      : node
  );

  return (
    <div style={{ height: 600 }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodesWithHandlers}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleConditionNodeClick}
          fitView
        >
          <MiniMap />
          <Background />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default WorkflowPOC;