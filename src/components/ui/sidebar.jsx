import React from 'react';
import { ColorBuilder } from '../custom_nodes/ColorBuilder';

const Sidebar = () => {
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside style={{ padding: 10, borderRight: '1px solid #ccc' }}>
            <div
                onDragStart={(event) => onDragStart(event, 'default')}
                draggable
                style={{
                    padding: 10,
                    marginBottom: 10,
                    background: '#ddd',
                    cursor: 'grab',
                }}
            >
                Default Node
            </div>

            {/* <div
                onDragStart={(event) => onDragStart(event, 'custom')}
                draggable
                style={{
                    padding: 10,
                    marginBottom: 10,
                    background: '#ddd',
                    cursor: 'grab',
                }}
            >
                Node - 2
            </div> */}

            <div
                onDragStart={(event) => onDragStart(event, 'colorNode')}
                draggable
                style={{
                    padding: 10,
                    marginBottom: 10,
                    background: '#ddd',
                    cursor: 'grab',
                }}
            >
                Drag Custome Node
            </div>


            {/* Add more node types here */}
        </aside>
    );
};

export default Sidebar;
