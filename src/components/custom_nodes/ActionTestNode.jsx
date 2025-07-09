// ActionNode.jsx
import { Handle, Position } from '@xyflow/react';


const hiddenHandleStyle = {
  opacity: 0,
  width: 12,
  height: 12,
  background: 'transparent',
  border: 'none',
};

const ActionTestNode = ({ data, selected }) => {
  const IconComponent = data.icon ?? '⚡';
  return (
    <div style={{ position: 'relative' }}>
      <Handle type="target" position={Position.Top} id="in" style={hiddenHandleStyle}/>
      <div style={{
        background: 'white',
        border: `2px solid ${selected ? '#3b82f6' : '#e5e7eb'}`,
        borderRadius: 8,
        padding: 16,
        width: 180,
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: selected ? '0 0 0 2px rgba(59,130,246,0.2)' : 'none',
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 20, color: data.color || '#444' }}>{IconComponent}</span>
          <div style={{ flex: 1 }}>{data.label}</div>
        </div>
      </div>
    </div>
  );
};

export default ActionTestNode;
