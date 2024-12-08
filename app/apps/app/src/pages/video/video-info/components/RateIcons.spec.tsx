import { describe, test, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { RateIcons } from "./RateIcons";
import { Actions } from "@shared/constants/actions";

vi.mock("firebase/auth");

vi.mock("firebase/auth");

vi.mock("@app/hooks/useLoginDialog", () => ({
  __esModule: true,
  default: () => ({
    loginOpen: true,
    handleLoginOpenWithAuth: vi.fn(),
  }),
}));

vi.mock("@app/utils/callFirebaseMicroservice", () => {
  return {
    callMicroservice: vi.fn().mockResolvedValue({ action: null }),
  };
});

const props = {
  videoId: "video123",
  likes: 10,
  dislikes: 5,
};

const userInteractionLike = { action: Actions.LIKE };
const userInteractionDislike = { action: Actions.DISLIKE };

describe("RateIcons component", () => {
  test("should renders the component with initial likes and dislikes", () => {
    const { getByText } = render(<RateIcons {...props} />);

    expect(getByText("10")).toBeInTheDocument();
    expect(getByText("5")).toBeInTheDocument();
  });

  test("should renders the component when user have already liked the video", () => {
    const { getByText } = render(<RateIcons {...props} userInteraction={userInteractionLike} />);

    const likeButton = getByText("10");

    expect(likeButton).toBeVisible();
    // Check that the like button is selected background color
    expect(likeButton).toHaveClass("bg-gray-200");
  });

  test("should renders the component when user have already disliked the video", () => {
    const { getByText } = render(<RateIcons {...props} userInteraction={userInteractionDislike} />);

    const dislikeButton = getByText("5");

    expect(dislikeButton).toBeVisible();
    // Check that the dislike button is selected background color
    expect(dislikeButton).toHaveClass("bg-gray-200");
  });

  test("should increment number of likes by 1 if like button clicked and userInteraction is null", async () => {
    const { getByText } = render(<RateIcons {...props} />);

    const likeButton = getByText("10"); // Get the like button by its content

    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(getByText("11")).toBeVisible(); // Check likes count is incremented
      expect(getByText("5")).toBeVisible(); // Check dislikes count did not change
    });
  });

  test("should increment number of likes by 1 and decrement number of dislikes by 1 if like button clicked and userInteraction is dislike", async () => {
    const { getByText } = render(<RateIcons {...props} userInteraction={userInteractionDislike} />);

    const likeButton = getByText("10"); // Get the like button by its content

    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(getByText("11")).toBeVisible(); // Check likes count is incremented
      expect(getByText("4")).toBeVisible(); // Check dislikes count is decremented
    });
  });

  test("should decrement number of likes by 1 if like button clicked and userInteraction is like", async () => {
    const { getByText } = render(<RateIcons {...props} userInteraction={userInteractionLike} />);

    const likeButton = getByText("10"); // Get the like button by its content

    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(getByText("9")).toBeVisible(); // Check likes count is decremented
      expect(getByText("5")).toBeVisible(); // Check dislikes count did not change
    });
  });

  test("should increment number of dislikes by 1 if dislike button clicked and userInteraction is null", async () => {
    const { getByText } = render(<RateIcons {...props} />);

    const dislikeButton = getByText("5"); // Get the dislike button by its content

    fireEvent.click(dislikeButton);

    await waitFor(() => {
      expect(getByText("6")).toBeVisible(); // Check dislikes count is incremented
      expect(getByText("10")).toBeVisible(); // Check likes count did not change
    });
  });

  test("should increment number of dislikes by 1 and decrement number of likes by 1 if like button clicked and userInteraction is like", async () => {
    const { getByText } = render(<RateIcons {...props} userInteraction={userInteractionLike} />);

    const dislikeButton = getByText("5"); // Get the dislike button by its content

    fireEvent.click(dislikeButton);

    await waitFor(() => {
      expect(getByText("6")).toBeVisible(); // Check dislikes count is incremented
      expect(getByText("9")).toBeVisible(); // Check likes count is decremented
    });
  });

  test("should decrement number of dislikes by 1 if dislike button clicked and userInteraction is dislike", async () => {
    const { getByText } = render(<RateIcons {...props} userInteraction={userInteractionDislike} />);

    const dislikeButton = getByText("5"); // Get the dislike button by its content

    fireEvent.click(dislikeButton);

    await waitFor(() => {
      expect(getByText("4")).toBeVisible(); // Check dislikes count is decremented
      expect(getByText("10")).toBeVisible(); // Check likes count did not change
    });
  });
});
