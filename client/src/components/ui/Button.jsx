import React from "react";

export const Button = React.forwardRef(({ className, ...props }, ref) => (
  <button className={`button ${className}`} ref={ref} {...props} />
));
