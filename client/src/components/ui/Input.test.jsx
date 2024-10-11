import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "./Input";

test("Input handles user input and passes props", () => {
  const handleChange = jest.fn();
  render(
    <Input
      placeholder="Enter text"
      onChange={handleChange}
      className="test-input"
    />
  );

  const input = screen.getByPlaceholderText("Enter text");
  expect(input).toHaveClass("input test-input");

  fireEvent.change(input, { target: { value: "Test input" } });
  expect(handleChange).toHaveBeenCalledTimes(1);
  expect(input).toHaveValue("Test input");
});
