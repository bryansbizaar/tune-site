// import React from "react";
// import { render, screen, waitFor, fireEvent } from "@testing-library/react";
// import "@testing-library/jest-dom";
// import { MemoryRouter } from "react-router-dom";
// import ChordList from "./ChordList";
// import { useAuth } from "../useAuth";

// jest.mock("react-router-dom", () => ({
//   ...jest.requireActual("react-router-dom"),
// }));

// // Mock child components
// jest.mock("./Header", () => () => <div data-testid="header">Header</div>);
// jest.mock("./Spinner", () => ({ loading }) => (
//   <div data-testid="spinner">Loading...</div>
// ));

// // Mock the API_URL
// jest.mock("../env", () => ({
//   VITE_API_URL: "http://localhost:5000",
// }));

// // Mock the sorting utility
// jest.mock("../utils/sorting", () => ({
//   sortTunes: (tunes) => tunes.sort((a, b) => a.title.localeCompare(b.title)),
// }));

// // Mock useAuth hook with default value
// jest.mock("../useAuth", () => ({
//   useAuth: jest.fn(),
// }));

// // Mock fetch
// global.fetch = jest.fn();

// describe("ChordList Component", () => {
//   const mockTunes = [
//     { id: "1", title: "Tune A", hasChords: true },
//     { id: "2", title: "Tune B", hasChords: false },
//     { id: "3", title: "Tune C", hasChords: true },
//   ];

//   beforeEach(() => {
//     fetch.mockClear();
//     useAuth.mockReturnValue({ isLoggedIn: false });
//   });

//   const renderComponent = () => {
//     return render(
//       <MemoryRouter>
//         <ChordList />
//       </MemoryRouter>
//     );
//   };

//   test("displays loading state initially", async () => {
//     fetch.mockImplementationOnce(() => new Promise(() => {}));
//     renderComponent();
//     expect(screen.getByTestId("spinner")).toBeInTheDocument();
//   });

//   test("displays error message when fetch fails", async () => {
//     fetch.mockRejectedValueOnce(new Error("API Error"));
//     renderComponent();
//     await waitFor(() => {
//       expect(screen.getByTestId("error-message")).toHaveTextContent(
//         "Error: API Error"
//       );
//     });
//   });

//   test("displays message when no tunes with chords are available", async () => {
//     fetch.mockResolvedValueOnce({
//       ok: true,
//       json: () =>
//         Promise.resolve([{ id: "1", title: "Tune A", hasChords: false }]),
//     });
//     renderComponent();
//     await waitFor(() => {
//       expect(screen.getByTestId("no-tunes-message")).toBeInTheDocument();
//     });
//   });

//   test("renders chord list correctly", async () => {
//     fetch.mockResolvedValueOnce({
//       ok: true,
//       json: () => Promise.resolve(mockTunes),
//     });

//     renderComponent();

//     await waitFor(() => {
//       expect(screen.getByText("Chords")).toBeInTheDocument();
//       expect(screen.getByText("Tune A")).toBeInTheDocument();
//       expect(screen.getByText("Tune C")).toBeInTheDocument();
//       expect(screen.queryByText("Tune B")).not.toBeInTheDocument();
//     });
//   });

//   test("renders links to chord pages correctly", async () => {
//     fetch.mockResolvedValueOnce({
//       ok: true,
//       json: () => Promise.resolve(mockTunes),
//     });

//     renderComponent();

//     await waitFor(() => {
//       const tuneALink = screen.getByText("Tune A");
//       expect(tuneALink).toHaveAttribute("href", "/chords/1");

//       const tuneCLink = screen.getByText("Tune C");
//       expect(tuneCLink).toHaveAttribute("href", "/chords/3");
//     });
//   });
//   describe("Authentication behavior", () => {
//     const mockTunes = [
//       { id: "1", title: "Tune A", hasChords: true },
//       { id: "2", title: "Tune B", hasChords: true },
//     ];

//     beforeEach(() => {
//       fetch.mockResolvedValueOnce({
//         ok: true,
//         json: () => Promise.resolve(mockTunes),
//       });
//     });

//     test("shows login required message when clicking chord link while logged out", async () => {
//       // Mock user as logged out
//       useAuth.mockReturnValue({ isLoggedIn: false });

//       // Render component
//       renderComponent();

//       // Wait for tunes to load
//       await waitFor(() => {
//         expect(screen.getByText("Tune A")).toBeInTheDocument();
//       });

//       // Click the chord link
//       fireEvent.click(screen.getByText("Tune A"));

//       // Check if login message appears
//       expect(screen.getByText("(login required)")).toBeInTheDocument();

//       // Verify the message disappears after 3 seconds
//       await waitFor(
//         () => {
//           expect(
//             screen.queryByText("(login required)")
//           ).not.toBeInTheDocument();
//         },
//         { timeout: 3500 }
//       );
//     });
//     test("allows navigation to chord details when logged in", async () => {
//       // Mock user as logged in
//       useAuth.mockReturnValue({ isLoggedIn: true });

//       // Mock window.location.href
//       const originalLocation = window.location;
//       delete window.location;
//       window.location = { href: jest.fn() };

//       // Render component
//       renderComponent();

//       // Wait for tunes to load
//       await waitFor(() => {
//         expect(screen.getByText("Tune A")).toBeInTheDocument();
//       });

//       // Click the chord link
//       fireEvent.click(screen.getByText("Tune A"));

//       // Verify navigation occurred
//       expect(window.location.href).toBe("/chords/1");

//       // Cleanup
//       window.location = originalLocation;
//     });
//   });
//   describe("ChordList Extended Session Tests", () => {
//     const mockTunes = [
//       { id: "1", title: "Tune A", hasChords: true },
//       { id: "2", title: "Tune B", hasChords: true },
//     ];

//     beforeEach(() => {
//       global.fetch = jest.fn().mockResolvedValue({
//         ok: true,
//         json: () => Promise.resolve(mockTunes),
//       });
//     });

//     describe("Session persistence behavior", () => {
//       test("maintains access to chord list after browser refresh when using extended session", async () => {
//         // Mock localStorage with extended session token
//         const mockToken = "extended-session-token";
//         const mockExpiry = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days

//         Storage.prototype.getItem = jest.fn((key) => {
//           if (key === "token") return mockToken;
//           if (key === "tokenExpiry") return mockExpiry.toString();
//           return null;
//         });

//         // Mock user as logged in with extended session
//         useAuth.mockReturnValue({
//           isLoggedIn: true,
//           sessionType: "extended",
//         });

//         render(
//           <MemoryRouter>
//             <ChordList />
//           </MemoryRouter>
//         );

//         await waitFor(() => {
//           expect(screen.getByText("Tune A")).toBeInTheDocument();
//           expect(screen.getByText("Tune B")).toBeInTheDocument();
//         });

//         // Simulate page refresh
//         const { rerender } = render(
//           <MemoryRouter>
//             <ChordList />
//           </MemoryRouter>
//         );

//         // Verify content is still accessible after refresh
//         await waitFor(() => {
//           expect(screen.getByText("Tune A")).toBeInTheDocument();
//           expect(screen.getByText("Tune B")).toBeInTheDocument();
//         });
//       });

//       test("denies access to chord list when extended session expires", async () => {
//         // Mock localStorage with expired extended session token
//         const mockToken = "expired-extended-session-token";
//         const mockExpiry = new Date().getTime() - 1000; // Expired

//         Storage.prototype.getItem = jest.fn((key) => {
//           if (key === "token") return mockToken;
//           if (key === "tokenExpiry") return mockExpiry.toString();
//           return null;
//         });

//         // Mock user as logged out due to expired session
//         useAuth.mockReturnValue({
//           isLoggedIn: false,
//         });

//         render(
//           <MemoryRouter>
//             <ChordList />
//           </MemoryRouter>
//         );

//         await waitFor(() => {
//           expect(screen.getByText("Tune A")).toBeInTheDocument();
//         });

//         // Click should show login required message
//         fireEvent.click(screen.getByText("Tune A"));
//         expect(screen.getByText("(login required)")).toBeInTheDocument();
//       });

//       test("handles transition between regular and extended sessions correctly", async () => {
//         // Start with regular session
//         const initialToken = "regular-session-token";
//         const initialExpiry = new Date().getTime() + 24 * 60 * 60 * 1000; // 1 day

//         Storage.prototype.getItem = jest.fn((key) => {
//           if (key === "token") return initialToken;
//           if (key === "tokenExpiry") return initialExpiry.toString();
//           return null;
//         });

//         useAuth.mockReturnValue({
//           isLoggedIn: true,
//           sessionType: "regular",
//         });

//         const { rerender } = render(
//           <MemoryRouter>
//             <ChordList />
//           </MemoryRouter>
//         );

//         await waitFor(() => {
//           expect(screen.getByText("Tune A")).toBeInTheDocument();
//         });

//         // Simulate switching to extended session
//         const extendedToken = "extended-session-token";
//         const extendedExpiry = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;

//         Storage.prototype.getItem = jest.fn((key) => {
//           if (key === "token") return extendedToken;
//           if (key === "tokenExpiry") return extendedExpiry.toString();
//           return null;
//         });

//         useAuth.mockReturnValue({
//           isLoggedIn: true,
//           sessionType: "extended",
//         });

//         rerender(
//           <MemoryRouter>
//             <ChordList />
//           </MemoryRouter>
//         );

//         // Verify content remains accessible after session type change
//         await waitFor(() => {
//           expect(screen.getByText("Tune A")).toBeInTheDocument();
//           expect(screen.getByText("Tune B")).toBeInTheDocument();
//         });
//       });
//       test("handles automatic logout when switching between different browsers", async () => {
//         // Set up initial session storage
//         const mockToken = "browser1-token";
//         const mockExpiry = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
//         const mockSessionId = "browser1-session";

//         // Mock initial browser session
//         Storage.prototype.getItem = jest.fn((key) => {
//           if (key === "token") return mockToken;
//           if (key === "tokenExpiry") return mockExpiry.toString();
//           if (key === "sessionId") return mockSessionId;
//           return null;
//         });

//         useAuth.mockReturnValue({
//           isLoggedIn: true,
//           sessionType: "extended",
//         });

//         // Render in first browser
//         const { rerender } = render(
//           <MemoryRouter>
//             <ChordList />
//           </MemoryRouter>
//         );

//         await waitFor(() => {
//           expect(screen.getByText("Tune A")).toBeInTheDocument();
//         });

//         // Simulate second browser by changing sessionId
//         Storage.prototype.getItem = jest.fn((key) => {
//           if (key === "token") return mockToken;
//           if (key === "tokenExpiry") return mockExpiry.toString();
//           if (key === "sessionId") return "browser2-session";
//           return null;
//         });

//         useAuth.mockReturnValue({
//           isLoggedIn: false,
//         });

//         // Re-render to simulate opening in new browser
//         rerender(
//           <MemoryRouter>
//             <ChordList />
//           </MemoryRouter>
//         );

//         // Click should now require login
//         fireEvent.click(screen.getByText("Tune A"));
//         expect(screen.getByText("(login required)")).toBeInTheDocument();
//       });
//       test("updates session expiry time correctly when renewing session", async () => {
//         // Set up initial session
//         const initialExpiry = new Date().getTime() + 1 * 60 * 60 * 1000; // 1 hour from now
//         let currentExpiry = initialExpiry;

//         Storage.prototype.getItem = jest.fn((key) => {
//           if (key === "tokenExpiry") return currentExpiry.toString();
//           if (key === "token") return "test-token";
//           return null;
//         });

//         Storage.prototype.setItem = jest.fn((key, value) => {
//           if (key === "tokenExpiry") {
//             currentExpiry = parseInt(value);
//           }
//         });

//         useAuth.mockReturnValue({
//           isLoggedIn: true,
//           renewSession: () => {
//             // Simulate session renewal
//             const newExpiry = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
//             Storage.prototype.setItem("tokenExpiry", newExpiry.toString());
//             return true;
//           },
//         });

//         const { rerender } = render(
//           <MemoryRouter>
//             <ChordList />
//           </MemoryRouter>
//         );

//         // Verify initial access
//         await waitFor(() => {
//           expect(screen.getByText("Tune A")).toBeInTheDocument();
//         });

//         // Simulate session renewal
//         const renewalResult = useAuth().renewSession();
//         expect(renewalResult).toBe(true);

//         // Verify new expiry was set
//         const newExpiry = parseInt(Storage.prototype.getItem("tokenExpiry"));
//         expect(newExpiry).toBeGreaterThan(initialExpiry);

//         // Verify content is still accessible
//         rerender(
//           <MemoryRouter>
//             <ChordList />
//           </MemoryRouter>
//         );

//         await waitFor(() => {
//           expect(screen.getByText("Tune A")).toBeInTheDocument();
//           expect(screen.getByText("Tune B")).toBeInTheDocument();
//         });
//       });
//     });
//   });
// });

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import ChordList from "./ChordList";
import { useAuth } from "../useAuth";

// Mock child components
jest.mock("./Header", () => () => <div data-testid="header">Header</div>);
jest.mock(
  "./Spinner",
  () =>
    ({ loading }) =>
      loading ? <div data-testid="loading-spinner">Loading...</div> : null
);

// Mock the image loading hook
jest.mock("../hooks/useImageLoader", () => ({
  useImageLoader: jest.fn(() => false),
}));

// Mock the API_URL
jest.mock("../env", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

// Mock the sorting utility
jest.mock("../utils/sorting", () => ({
  sortTunes: (tunes) => tunes.sort((a, b) => a.title.localeCompare(b.title)),
}));

// Mock useAuth hook with default value
jest.mock("../useAuth", () => ({
  useAuth: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe("ChordList Component", () => {
  const mockTunes = [
    { id: "1", title: "Tune A", hasChords: true },
    { id: "2", title: "Tune B", hasChords: false },
    { id: "3", title: "Tune C", hasChords: true },
  ];

  beforeEach(() => {
    fetch.mockClear();
    useAuth.mockReturnValue({ isLoggedIn: false });
    jest
      .requireMock("../hooks/useImageLoader")
      .useImageLoader.mockReturnValue(false);
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ChordList />
      </MemoryRouter>
    );
  };

  test("displays loading spinner while loading", () => {
    // Mock both image loading and data fetching
    jest
      .requireMock("../hooks/useImageLoader")
      .useImageLoader.mockReturnValue(true);
    fetch.mockImplementationOnce(() => new Promise(() => {}));

    renderComponent();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("displays error message when fetch fails", async () => {
    fetch.mockRejectedValueOnce(new Error("API Error"));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Error: API Error"
      );
    });
  });

  test("displays message when no tunes with chords are available", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([{ id: "1", title: "Tune A", hasChords: false }]),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId("no-tunes-message")).toBeInTheDocument();
    });
  });

  test("renders chord list correctly when loading is complete", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTunes),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Chords")).toBeInTheDocument();
      expect(screen.getByText("Tune A")).toBeInTheDocument();
      expect(screen.getByText("Tune C")).toBeInTheDocument();
      expect(screen.queryByText("Tune B")).not.toBeInTheDocument(); // Should not show tunes without chords
    });
  });

  test("renders links to chord pages correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTunes),
    });

    renderComponent();

    await waitFor(() => {
      const tuneALink = screen.getByText("Tune A");
      expect(tuneALink).toHaveAttribute("href", "/chords/1");

      const tuneCLink = screen.getByText("Tune C");
      expect(tuneCLink).toHaveAttribute("href", "/chords/3");
    });
  });

  describe("Authentication behavior", () => {
    beforeEach(() => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTunes),
      });
    });

    test("shows login required message when clicking chord link while logged out", async () => {
      useAuth.mockReturnValue({ isLoggedIn: false });
      const { container } = renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Tune A")).toBeInTheDocument();
      });

      // Mock window.location.href
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: jest.fn() };

      fireEvent.click(screen.getByText("Tune A"));
      expect(screen.getByText("(login required)")).toBeInTheDocument();

      await waitFor(
        () => {
          expect(
            screen.queryByText("(login required)")
          ).not.toBeInTheDocument();
        },
        { timeout: 3500 }
      );

      // Restore window.location
      window.location = originalLocation;
    });

    test("allows navigation to chord details when logged in", async () => {
      useAuth.mockReturnValue({ isLoggedIn: true });

      // Mock window.location.href
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: jest.fn() };

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Tune A")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Tune A"));
      expect(window.location.href).toBe("/chords/1");

      // Restore window.location
      window.location = originalLocation;
    });
  });

  describe("Loading states", () => {
    test("shows spinner while image is loading even if data is ready", async () => {
      jest
        .requireMock("../hooks/useImageLoader")
        .useImageLoader.mockReturnValue(true);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTunes),
      });

      renderComponent();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    test("shows spinner while data is loading even if image is ready", async () => {
      jest
        .requireMock("../hooks/useImageLoader")
        .useImageLoader.mockReturnValue(false);
      fetch.mockImplementationOnce(() => new Promise(() => {}));

      renderComponent();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    test("removes spinner when both image and data are loaded", async () => {
      jest
        .requireMock("../hooks/useImageLoader")
        .useImageLoader.mockReturnValue(false);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTunes),
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      });
    });
  });

  test("handles failed fetch gracefully", async () => {
    fetch.mockRejectedValueOnce(new Error("Failed to fetch tune data"));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Error: Failed to fetch tune data"
      );
    });
  });
});
