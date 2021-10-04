import React from "react";

const RoomClosedMessage = () => {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center w-full h-full text-xl not-selectable text-quinary">
        <span>🖐️ Call ended</span>
      </div>
    );
}
export default RoomClosedMessage;