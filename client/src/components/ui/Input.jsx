import React from "react";

export const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input className={`input ${className}`} ref={ref} {...props} />
));
