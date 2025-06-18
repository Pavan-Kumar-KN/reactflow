import React, { useCallback, useState } from 'react';
import { ReactFlow, applyEdgeChanges, applyNodeChanges, addEdge, MiniMap, Controls, Background, Panel } from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import Flow from './components/flow';
import HandleEdge from './components/custom_nodes/HandleEdge';
import SpecificationModal from './components/SpecificationModel';
import WorkFlowBuilder from './pages/workFlowBuilder';
import WorkFlowBuilder2 from './pages/WorkFlowBuilder2';
import LearnFlowBuilder from './pages/LearnFlowBuilder';

import './index.css'
import TestBuilder from './pages/TestBuilder';
import TestBuilder2 from './pages/TestBuilder2';
import ELKBuilder from './pages/ELKBuilder';
import WorkflowPOC from './pages/WorkflowPOC';


const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Input Node' },
    position: { x: 250, y: 25 },
  },

  {
    id: '2',
    // you can also pass a React component as a label
    data: { label: <div>Default Node</div> },
    position: { x: 100, y: 125 },
  },
  {
    id: '3',
    type: 'output',
    data: { label: 'Output Node' },
    position: { x: 250, y: 250 },
  },
];

// const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
];


const App = () => {
  // Method 01: for creating nodes and edges 
  // const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);


  // Method 02: simple way for creating nodes and edges
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  // Here we are apply those node changes to the respective node and that's we are using useCallback function 
  const onNodeChange = useCallback((changes) => setNodes((node) => applyNodeChanges(changes, node)),
    [setNodes]
  );


  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  // if we want to create new connection then this function will create new edge(connection) between noodes 
  const onConnect = useCallback((connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds))
    , [setEdges]);

  /* 
  we can create the edges with animation also or if we just line then we can go with 
  addEdge(connection , eds) -> without styles
  addEdge({...connection , animation: true} , eds) -> with style 

  // Method 3 of desiging the edges 
  const defaultEdgeOptions = { animated: true };
...
<ReactFlow
nodes={nodes}
edges={edges}
onNodesChange={onNodesChange}
onEdgesChange={onEdgesChange}
onConnect={onConnect}
defaultEdgeOptions={defaultEdgeOptions}
/>;


  */


  const nodeColor = (node) => {
    switch (node.type) {
      case 'input':
        return '#6ede87';
      case 'output':
        return '#6865A5';
      default:
        return '#ff0072';
    }
  };

  // using react flow inbuilt we can change the background 
  const [variant, setVariant] = useState('cross');

  // onNodeClick 
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  })


  const closeModel = () => {
    setSelectedNode(null);
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* This will help to implement the dragable component  */}

      {/* <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      /> */}

      {/* this is the main component to render the nodes  and mini mind map */}
      {/* <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodeChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView

      >
        <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
      <Background color="#ccc" variant={variant} />
        <Panel>
        <div>variant:</div>
        <button onClick={() => setVariant('dots')}>dots</button>
        <button onClick={() => setVariant('lines')}>lines</button>
        <button onClick={() => setVariant('cross')}>cross</button>+
        </Panel>


        <Controls />
      </ReactFlow> 

      {
        selectedNode && (
          <SpecificationModal node = {selectedNode} onClose={closeModel}/>
        )
      } */}

      {/* <Flow/> */}

      {/* <HandleEdge /> */}

      {/* <WorkFlowBuilder2/> */}
      {/* <LearnFlowBuilder/> */}

      {/* <TestBuilder2 /> */}

      {/* <ELKBuilder/> */}

      <TestBuilder/>

      {/* <WorkflowPOC /> */}
    </div>
  )
}

export default App