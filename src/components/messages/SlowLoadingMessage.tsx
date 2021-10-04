import { faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Room } from "livekit-client";
import React from "react";

const SlowLoadingMessage = ({ onRefresh }: { onRefresh: Function }) => {
  return (
    <div className="absolute bottom-0 flex flex-col py-2 justify-center w-full animate-fade-in-up">
      <div className="py-1 text-sm text-center">Having connection issues?</div>
      <button
              className="cursor-pointer focus:border-0 focus:outline-none text-center"
              onClick={() => onRefresh()}
      >
        <span className="pr-2 text-primary text-base">Refresh</span>
        <FontAwesomeIcon
          icon={faSync}
          size="sm"
          className="inline text-primary"
        />
      </button>
    </div>
  );
};
export default SlowLoadingMessage