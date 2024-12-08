import { vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import store from "@app/redux/store/store";
import { BrowserRouter as Router } from "react-router-dom";
import Feature, { Faqs, Pricing } from "./feature";

vi.mock("firebase/auth");

describe("FeatureList component", () => {
  test("should render the component", async () => {
    const { container } = render(
      <Router>
        <Provider store={store}>
          <Feature />
        </Provider>
      </Router>
    );
    expect(screen.getByText("Create your own movie with the help of AI")).toBeVisible();
    expect(
      screen.getByText(
        "With our tool, everyone can be a filmmaker. Go through the process of writing your script until final cinematography within minutes."
      )
    ).toBeVisible();
    expect(screen.getByText("Join the Waitlist")).toBeVisible();
    await waitFor(() => {
      const videoElement = container.querySelector("video");
      expect(videoElement).toBeVisible();
      expect(videoElement?.src).toContain("demo-video.mp4");
    });
  });
});

describe("Pricing component", () => {
  test("should render the component", () => {
    render(<Pricing />);
    expect(screen.getByText("Take the director's seat!")).toBeVisible();
    expect(screen.getByText("Coming Soon")).toBeVisible();
    expect(screen.getByText("Free")).toBeVisible();
  });
});

describe("Faqs component", () => {
  test("should render the component", () => {
    render(<Faqs />);
    expect(screen.getByText("Frequently asked questions")).toBeVisible();
    expect(screen.getByText("What is pabolo?")).toBeVisible();
    expect(screen.getByText("How can I create my own movie?")).toBeVisible();
  });
});
