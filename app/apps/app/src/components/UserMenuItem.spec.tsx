import { describe, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { Menu } from "@headlessui/react";
import UserMenuItem from "./UserMenuItem";

// Props for the UserMenuItem
const props = {
  to: "/dashboard",
  name: "Dashboard",
};

const userNotLoggedIn = {
  loggedIn: false,
};

const userLoggedInAndNotCreator = {
  loggedIn: true,
  is_creator: false,
};

const userLoggedInAndCreator = {
  loggedIn: true,
  is_creator: true,
};

// Mock useSelector from react-redux
vi.mock("react-redux", () => {
  return {
    useSelector: vi
      .fn()
      .mockImplementationOnce(() => userNotLoggedIn)
      .mockImplementationOnce(() => userLoggedInAndNotCreator)
      .mockImplementationOnce(() => userLoggedInAndCreator),
  };
});

describe("UserMenuItem", () => {
  test("UserMenuItem is not displayed if authRequired and user is not loggedin", () => {
    // Render the UserMenuItem with the props
    render(
      <Router>
        <Menu>
          <UserMenuItem {...props} authRequired />
        </Menu>
      </Router>
    );

    // Expect the component to not be displayed since the user is not logged in
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  test("UserMenuItem is not displayed if authRequired and creatorRequired and user is not creator", () => {
    // Render the UserMenuItem with the props
    render(
      <Router>
        <Menu>
          <UserMenuItem {...props} authRequired creatorRequired />
        </Menu>
      </Router>
    );

    // Expect the component to not be displayed since the user is not a creator
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  test("UserMenuItem is displayed if authRequired and creatorRequired and user is a creator", () => {
    // Render the UserMenuItem with the props
    render(
      <Router>
        <Menu>
          <UserMenuItem {...props} authRequired creatorRequired />
        </Menu>
      </Router>
    );

    // Expect the component to be displayed since the user is a creator
    expect(screen.queryByText("Dashboard")).toBeInTheDocument();
  });

  test("UserMenuItem is displayed if no checks are passed", () => {
    // Render the UserMenuItem with the props
    render(
      <Router>
        <Menu>
          <UserMenuItem {...props} />
        </Menu>
      </Router>
    );

    // Expect the component to be displayed
    expect(screen.queryByText("Dashboard")).toBeInTheDocument();
  });
});
