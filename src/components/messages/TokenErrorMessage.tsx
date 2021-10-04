import React from "react";
import { SUPPORT_EMAIL } from "../../utils/globals";

const TokenErrorMessage = ({ cstmSupportUrl }: { cstmSupportUrl?: string }) => {
  return (
    <div className="absolute top-0 flex items-center justify-center w-full h-full px-16 text-xl not-selectable left-1 text-quinary">
      <span className="text-center">
        ⚠️ An error occurred generating your user token.
        <br />
        Please{' '}
        <a
          href={
            cstmSupportUrl && cstmSupportUrl.length > 0
              ? cstmSupportUrl
              : SUPPORT_EMAIL
          }
          target="_blank"
          rel="noreferrer"
        >
          contact us
        </a>{' '}
        for help
      </span>
    </div>
  );
};
export default TokenErrorMessage;