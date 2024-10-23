import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import TuneDisplay from "./TuneDisplay";
import { useAuth } from "../useAuth";

// Mock useAuth hook
jest.mock("../useAuth", () => ({
  useAuth: jest.fn(),
}));

describe("TuneDisplay Component", () => {
  // Mock window.location
  const mockLocation = new URL("http://localhost");
  let originalWindow;

  beforeEach(() => {
    originalWindow = window.location;
    delete window.location;
    window.location = { ...mockLocation, href: jest.fn() };
    // Reset useAuth mock before each test
    useAuth.mockReturnValue({ isLoggedIn: false });
    // Reset all timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    window.location = originalWindow;
    jest.useRealTimers();
  });

  const renderComponent = (props) => {
    return render(
      <MemoryRouter>
        <TuneDisplay {...props} />
      </MemoryRouter>
    );
  };

  const mockTunesOfTheWeek = [
    { id: "1", title: "Internal Tune 1" },
    {
      id: "2",
      title: "External Tune",
      hasExternalLink: true,
      externalLinkUrl: "https://example.com",
    },
  ];

  const mockUpNextTunes = [
    { id: "3", title: "Internal Tune 2" },
    {
      id: "4",
      title: "Another External Tune",
      hasExternalLink: true,
      externalLinkUrl: "https://example.com/next",
    },
  ];

  describe("Basic Rendering", () => {
    test("renders section headings correctly", () => {
      renderComponent({
        tunesOfTheWeek: mockTunesOfTheWeek,
        upNextTunes: mockUpNextTunes,
      });

      expect(screen.getByText("Tunes of the week:")).toBeInTheDocument();
      expect(screen.getByText("Up next:")).toBeInTheDocument();
    });

    test('uses singular "Tune of the week" when only one tune', () => {
      renderComponent({
        tunesOfTheWeek: [mockTunesOfTheWeek[0]],
        upNextTunes: mockUpNextTunes,
      });

      expect(screen.getByText("Tune of the week:")).toBeInTheDocument();
    });

    test("displays TBD when no tunes are available", () => {
      renderComponent({
        tunesOfTheWeek: [],
        upNextTunes: [],
      });

      const tbdElements = screen.getAllByText("TBD");
      expect(tbdElements).toHaveLength(2);
    });
  });

  describe("Link Handling", () => {
    test("renders external links with correct attributes", () => {
      renderComponent({
        tunesOfTheWeek: mockTunesOfTheWeek,
        upNextTunes: mockUpNextTunes,
      });

      const externalLinks = [
        screen.getByText("External Tune"),
        screen.getByText("Another External Tune"),
      ];

      externalLinks.forEach((link) => {
        expect(link.closest("a")).toHaveAttribute("target", "_blank");
        expect(link.closest("a")).toHaveAttribute("rel", "noopener noreferrer");
      });
    });

    test("opens external links in new tab when clicked", () => {
      window.open = jest.fn();

      renderComponent({
        tunesOfTheWeek: mockTunesOfTheWeek,
        upNextTunes: mockUpNextTunes,
      });

      const externalLink = screen.getByText("External Tune");
      fireEvent.click(externalLink);

      expect(window.open).toHaveBeenCalledWith("https://example.com", "_blank");
    });
  });

  describe("Authentication Behavior", () => {
    test("shows login message when clicking internal tune while logged out", async () => {
      useAuth.mockReturnValue({ isLoggedIn: false });

      renderComponent({
        tunesOfTheWeek: mockTunesOfTheWeek,
        upNextTunes: mockUpNextTunes,
      });

      const internalLink = screen.getByText("Internal Tune 1");
      fireEvent.click(internalLink);

      expect(screen.getByText("(login required)")).toBeInTheDocument();

      // Fast-forward timers to verify message disappears
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(screen.queryByText("(login required)")).not.toBeInTheDocument();
    });

    test("navigates to tune detail when clicking internal tune while logged in", () => {
      useAuth.mockReturnValue({ isLoggedIn: true });

      renderComponent({
        tunesOfTheWeek: mockTunesOfTheWeek,
        upNextTunes: mockUpNextTunes,
      });

      const internalLink = screen.getByText("Internal Tune 1");
      fireEvent.click(internalLink);

      expect(window.location.href).toBe("/tune/1");
    });

    test("allows clicking external links regardless of login status", () => {
      useAuth.mockReturnValue({ isLoggedIn: false });
      window.open = jest.fn();

      renderComponent({
        tunesOfTheWeek: mockTunesOfTheWeek,
        upNextTunes: mockUpNextTunes,
      });

      const externalLink = screen.getByText("External Tune");
      fireEvent.click(externalLink);

      expect(window.open).toHaveBeenCalledWith("https://example.com", "_blank");
    });

    test("handles multiple login messages independently", () => {
      useAuth.mockReturnValue({ isLoggedIn: false });

      renderComponent({
        tunesOfTheWeek: mockTunesOfTheWeek,
        upNextTunes: mockUpNextTunes,
      });

      // Click both internal tunes
      const internalLink1 = screen.getByText("Internal Tune 1");
      const internalLink2 = screen.getByText("Internal Tune 2");

      fireEvent.click(internalLink1);
      fireEvent.click(internalLink2);

      // Both messages should be visible
      const loginMessages = screen.getAllByText("(login required)");
      expect(loginMessages).toHaveLength(2);

      // Advance timers to verify messages disappear independently
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(screen.queryByText("(login required)")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    test("handles missing tune properties gracefully", () => {
      const incompleteTunes = [
        { id: "1" }, // Missing title
        { title: "No ID" }, // Missing id
        { id: "3", title: "Complete Tune" },
      ];

      renderComponent({
        tunesOfTheWeek: incompleteTunes,
        upNextTunes: [],
      });

      // Should still render without crashing
      expect(screen.getByText("Complete Tune")).toBeInTheDocument();
    });

    test("handles external links with missing URLs gracefully", () => {
      const tunesWithBadLinks = [
        { id: "1", title: "Bad External Link", hasExternalLink: true }, // Missing URL
      ];

      renderComponent({
        tunesOfTheWeek: tunesWithBadLinks,
        upNextTunes: [],
      });

      // Should render the title without crashing
      expect(screen.getByText("Bad External Link")).toBeInTheDocument();
    });
  });
});
