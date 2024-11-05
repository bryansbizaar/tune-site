import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import TuneDisplay from "./TuneDisplay";
import { useAuth } from "../useAuth";

// Mock useAuth
jest.mock("../useAuth", () => ({
  useAuth: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

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

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ isLoggedIn: false });
  });

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

  test("shows login required message when clicking tune while logged out", async () => {
    useAuth.mockReturnValue({ isLoggedIn: false });

    renderComponent({
      tunesOfTheWeek: mockTunesOfTheWeek,
      upNextTunes: mockUpNextTunes,
    });

    fireEvent.click(screen.getByText("Tune 1"));

    expect(screen.getByText("(login required)")).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.queryByText("(login required)")).not.toBeInTheDocument();
      },
      { timeout: 3500 }
    );
  });

  test("navigates to tune detail when clicking tune while logged in", () => {
    useAuth.mockReturnValue({ isLoggedIn: true });

    renderComponent({
      tunesOfTheWeek: mockTunesOfTheWeek,
      upNextTunes: mockUpNextTunes,
    });

    fireEvent.click(screen.getByText("Tune 1"));

    expect(mockNavigate).toHaveBeenCalledWith("/tune/1");
  });

  test("opens external link in new tab when tune has external link", () => {
    const mockTunesWithExternalLink = [
      {
        id: "5",
        title: "External Tune",
        hasExternalLink: true,
        externalLinkUrl: "https://example.com",
      },
    ];

    renderComponent({
      tunesOfTheWeek: mockTunesWithExternalLink,
      upNextTunes: [],
    });

    const externalLink = screen.getByText("External Tune");
    expect(externalLink).toHaveAttribute("href", "https://example.com");
    expect(externalLink).toHaveAttribute("target", "_blank");
    expect(externalLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
