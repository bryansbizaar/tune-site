import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "./Dialog";

test("Dialog opens and closes correctly", () => {
  render(
    <Dialog>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogTitle>Test Dialog</DialogTitle>
        <p>Dialog content</p>
      </DialogContent>
    </Dialog>
  );

  // Check that dialog is not visible initially
  expect(screen.queryByText("Test Dialog")).not.toBeInTheDocument();

  // Open dialog
  fireEvent.click(screen.getByText("Open Dialog"));
  expect(screen.getByText("Test Dialog")).toBeInTheDocument();

  // Close dialog
  fireEvent.click(screen.getByText("×"));
  expect(screen.queryByText("Test Dialog")).not.toBeInTheDocument();
});
