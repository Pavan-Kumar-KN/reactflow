const ActionNode = ({ data, selected }) => {
  const isSelected = selected;
  const IconComponent = data.icon ?? '⚡'; // fallback icon as text

  return (
    <div style={{ position: 'relative' }}>
      {/* Main Node */}
      <div style={{
        backgroundColor: 'white',
        border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
        borderRadius: '8px',
        padding: '24px',
        width: '360px',
        cursor: 'pointer',
        boxShadow: isSelected ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: data.color || 'black' }}>{IconComponent}</span>
          <div style={{ flexGrow: 1, fontWeight: 'bold' }}>{data.label}</div>
          <span style={{ color: '#9ca3af' }}>▼</span>
          {data.onDelete && (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={data.onDelete}
                style={{ 
                  padding: '4px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af'
                }}
              >
                ⋮
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vertical line with + button
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginTop: '12px', width: '2px', height: '50px', backgroundColor: '#9ca3af' }}></div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={data.onClick}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '24px',
              height: '24px', 
              backgroundColor: 'white',
              border: '2px solid #9ca3af',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            +
          </button>
        </div>
        <div style={{ width: '2px', height: '50px', backgroundColor: '#9ca3af' }}></div>
      </div> */}
    </div>
  );
};

export default ActionNode;