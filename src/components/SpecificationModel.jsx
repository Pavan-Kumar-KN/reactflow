import React from 'react';
// import { ReactFlow, applyEdgeChanges, applyNodeChanges, addEdge, MiniMap, Controls, Background, Panel } from '@xyflow/react';



const SpecificationModal = ({ node, onClose }) => {

    // here we are getting the specific node based on the selection of the user
    if(node.data.label ==  "Input Node"){
        console.log(node);
    }

  return (
    <div style={{
      position: 'absolute',
      top: 50,
      right: 50,
      background: 'white',
      padding: 20,
      border: '1px solid #ccc',
      zIndex: 1000,
    }}>
      <h2>Specification for {node.data.label}</h2>
      <p>Node ID: {node.id}</p>
      <p>Position: {JSON.stringify(node.position)}</p>
      {/* You can add more fields or custom components here */}

      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default SpecificationModal;
