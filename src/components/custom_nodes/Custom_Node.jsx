import { useCallback } from "react";
import { Handle } from '@xyflow/react';


function Custom_Node(props) {
  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className="text-updater-node">
      <div>
        <label htmlFor="text">Text:</label>
        <input id="text" name="text" onChange={onChange} className="nodrag" />

        <Handle type="source" position="top" />
        <Handle type="target" position="bottom" />
      </div>
    </div>
  );
}

export default Custom_Node;