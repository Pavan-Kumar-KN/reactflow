import { Handle, Position } from "@xyflow/react";
import { Plus } from "lucide-react";

const RouterNode = ({ data, id }) => {
    const handleAddBranch = (branchType) => {
        if (data.onAddBranchNode) {
            data.onAddBranchNode(id, branchType);
        }
    };

    const hiddenHandleStyle = {
        opacity: 0,
        pointerEvents: 'none',
    };

    return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-md p-4 flex flex-col items-center">
            <div className="text-sm font-semibold text-gray-700 mb-2">{data.label || 'Condition'}</div>

            {/* Yes branch */}
            <div className="flex flex-col items-center my-2">
                <div className="text-xs text-green-600 mb-1">Yes</div>
                <div className="w-0.5 h-4 bg-gray-300" />
                <button
                    className="w-6 h-6 rounded-full bg-blue-100 border border-blue-400 flex items-center justify-center hover:bg-blue-200"
                    onClick={() => handleAddBranch('branch1')}
                >
                    <Plus className="w-3 h-3 text-blue-600" />
                </button>
            </div>

            {/* No branch */}
            <div className="flex flex-col items-center my-2">
                <div className="text-xs text-red-600 mb-1">No</div>
                <div className="w-0.5 h-4 bg-gray-300" />
                <button
                    className="w-6 h-6 rounded-full bg-blue-100 border border-blue-400 flex items-center justify-center hover:bg-blue-200"
                    onClick={() => handleAddBranch('otherwise')}
                >
                    <Plus className="w-3 h-3 text-blue-600" />
                </button>
            </div>

            {/* Hidden handles to allow actual edge connections */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="branch1"
                style={{ top: '70%', left: '25%', visibility: 'hidden' }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="otherwise"
                style={{ top: '70%', left: '75%', visibility: 'hidden' }}
            />
        </div>
    );
};

export default RouterNode;