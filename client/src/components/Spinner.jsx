import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

const override = {
  display: "block",
  margin: "6.25rem auto",
};
const Spinner = ({ loading }) => {
  return (
    <div data-testid="loading-spinner">
      <ClipLoader
        color=""
        loading={loading}
        cssOverride={override}
        size={125}
      />
    </div>
  );
};

export default Spinner;
