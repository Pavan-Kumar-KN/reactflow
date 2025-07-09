import { Handle, Position } from '@xyflow/react';

const hiddenHandleStyle = {
  opacity: 0,
  width: 12,
  height: 12,
  background: 'transparent',
  border: 'none',
};

const RouterTestNode = ({ data, selected }) => {
  const IconComponent = data.icon ?? '🔀';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
       <Handle type="target" position={Position.Top} id="in" style={hiddenHandleStyle}/>
      <div
        style={{
          backgroundColor: 'white',
          border: `2px solid ${selected ? '#3b82f6' : '#e5e7eb'}`,
          borderRadius: '8px',
          padding: '16px',
          width: '360px',
          cursor: 'pointer',
          boxShadow: selected ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: data.color || '#4b5563', fontSize: '20px' }}>
            {IconComponent}
          </span>
          <div style={{ flexGrow: 1, fontWeight: 'bold', fontSize: '16px' }}>
            {data.label ?? 'Router Node'}
          </div>
          <span style={{ color: '#9ca3af' }}>▼</span>
          {data.onDelete && (
            <button
              onClick={data.onDelete}
              style={{
                padding: '4px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
              }}
            >
              ⋮
            </button>
          )}
        </div>
      </div>

      {/* Hidden handle for outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        style={hiddenHandleStyle}
      />
    </div>
  );
};

export default RouterTestNode;
