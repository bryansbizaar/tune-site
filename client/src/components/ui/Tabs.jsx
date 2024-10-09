import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

export const Tabs = TabsPrimitive.Root;
export const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    className={`tabs-list ${className}`}
    ref={ref}
    {...props}
  />
));
export const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    className={`tabs-trigger ${className}`}
    ref={ref}
    {...props}
  />
));
export const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    className={`tabs-content ${className}`}
    ref={ref}
    {...props}
  />
));
