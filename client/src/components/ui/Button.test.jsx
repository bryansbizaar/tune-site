import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Button } from "./Button";

describe("Button", () => {
  it("renders with the correct text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" })
    ).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Click me" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toHaveClass(
      "custom-class"
    );
  });
});
