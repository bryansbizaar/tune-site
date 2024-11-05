// import React from "react";
// import { render } from "@testing-library/react";
// import { Card } from "./Card";

describe("Card", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
import React from "react";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";

test("Card renders content and applies correct classes", () => {
  render(
    <Card className="test-card">
      <CardHeader className="test-header">
        <CardTitle className="test-title">Test Card</CardTitle>
      </CardHeader>
      <CardContent className="test-content">
        <p>Card content</p>
      </CardContent>
    </Card>
  );

  const card = screen.getByText("Test Card").closest(".card");
  expect(card).toHaveClass("card test-card");
  expect(screen.getByText("Test Card")).toHaveClass("card-title test-title");
  expect(screen.getByText("Card content").parentElement).toHaveClass(
    "card-content test-content"
  );
});
