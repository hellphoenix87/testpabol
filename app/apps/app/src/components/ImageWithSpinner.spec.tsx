import { describe, test, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import ImageWithSpinner from "./ImageWithSpinner";

vi.mock("firebase/auth");

describe("ImageWithSpinner component test", () => {
  test("renders image with spinner", async () => {
    const props = {
      src: "LOADING",
      alt: "Example Image",
    };

    render(<ImageWithSpinner {...props} />);

    // Expect the spinner to be visible
    const spinner = screen.queryByTestId("image-spinner");
    expect(spinner).toBeVisible();

    // Expect the image to be hidden
    const image = screen.queryByAltText(props.alt);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "");
    expect(image).toHaveClass("hidden");

    act(() => {
      image?.dispatchEvent(new Event("load"));
    });

    await waitFor(() => expect(image).not.toHaveClass("hidden"));
  });
});
