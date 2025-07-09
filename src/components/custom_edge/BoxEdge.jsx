// BoxEdge.jsx
const BoxEdge = ({ id, sourceX, sourceY, targetX, targetY, markerEnd, label }) => {
  const midY = sourceY + 40;
  const path = `
    M ${sourceX},${sourceY}
    L ${sourceX},${midY}
    L ${targetX},${midY}
    L ${targetX},${targetY}
  `;
  return (
    <>
      <path id={id} d={path} stroke="#9ca3af" strokeWidth={2} fill="none" markerEnd={markerEnd} />
      {label && <text><textPath href={`#${id}`} startOffset="50%" textAnchor="middle" fill="#4b5563">{label}</textPath></text>}
    </>
  );
};

export default BoxEdge;
