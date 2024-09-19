import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import TuneDisplay from "./TuneDisplay";

const renderComponent = (props) => {
  return render(
    <MemoryRouter>
      <TuneDisplay {...props} />
    </MemoryRouter>
  );
};

describe("TuneDisplay Component", () => {
  const mockTunesOfTheWeek = [
    { id: "1", title: "Tune 1" },
    { id: "2", title: "Tune 2" },
  ];

  const mockUpNextTunes = [
    { id: "3", title: "Tune 3" },
    { id: "4", title: "Tune 4" },
  ];

  test("renders correctly with tunes", () => {
    renderComponent({
      tunesOfTheWeek: mockTunesOfTheWeek,
      upNextTunes: mockUpNextTunes,
    });

    expect(screen.getByText("Tunes of the week:")).toBeInTheDocument();
    expect(screen.getByText("Tune 1")).toBeInTheDocument();
    expect(screen.getByText("Tune 2")).toBeInTheDocument();

    expect(screen.getByText("Up next:")).toBeInTheDocument();
    expect(screen.getByText("Tune 3")).toBeInTheDocument();
    expect(screen.getByText("Tune 4")).toBeInTheDocument();
  });

  test('renders "Tune of the week" in singular when there is only one tune', () => {
    renderComponent({
      tunesOfTheWeek: [mockTunesOfTheWeek[0]],
      upNextTunes: mockUpNextTunes,
    });

    expect(screen.getByText("Tune of the week:")).toBeInTheDocument();
  });

  test("renders TBD when there are no tunes of the week", () => {
    renderComponent({ tunesOfTheWeek: [], upNextTunes: mockUpNextTunes });

    expect(screen.getByText("Tune of the week:")).toBeInTheDocument();
    expect(screen.getAllByText("TBD")[0]).toBeInTheDocument();
  });

  test("renders TBD when there are no up next tunes", () => {
    renderComponent({ tunesOfTheWeek: mockTunesOfTheWeek, upNextTunes: [] });

    expect(screen.getByText("Up next:")).toBeInTheDocument();
    expect(screen.getAllByText("TBD")[0]).toBeInTheDocument();
  });

  test("renders correct links for tunes", () => {
    renderComponent({
      tunesOfTheWeek: mockTunesOfTheWeek,
      upNextTunes: mockUpNextTunes,
    });

    expect(screen.getByText("Tune 1").closest("a")).toHaveAttribute(
      "href",
      "/tune/1"
    );
    expect(screen.getByText("Tune 3").closest("a")).toHaveAttribute(
      "href",
      "/tune/3"
    );
  });
});
