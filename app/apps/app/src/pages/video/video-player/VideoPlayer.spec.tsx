import { describe, test, expect, vi, Mock } from "vitest";
import { Provider } from "react-redux";
import { useParams } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import HLS from "hls.js";
import store from "@app/redux/store/store";
import * as firebaseCaller from "@app/utils/callFirebaseMicroservice";
import VideoPlayer from "./VideoPlayer";

vi.mock("hls.js");
vi.mock("react-router-dom");
vi.mock("firebase/auth");

vi.mock("@app/utils/callFirebaseMicroservice");
vi.mock("@app/utils/callFirebaseFunction");

describe("VideoPlayer", () => {
  vi.spyOn(HLS, "isSupported").mockReturnValue(true);
  (useParams as Mock).mockReturnValue({ id: "12345678901234567890" });

  const Wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;

  test("should keep video hidden and show not allowed container, if not allowed param is true", () => {
    const { queryByTestId } = render(
      <Wrapper>
        <VideoPlayer video={{ url: "mock-url", isAgeRestricted: true }} />
      </Wrapper>
    );

    expect(queryByTestId("adult-content-container")).toBeInTheDocument();
    expect(queryByTestId("hls-video-player")).toHaveClass("hidden");
  });

  test("should show the video for an mp4 video", async () => {
    const { queryByTestId } = render(
      <Wrapper>
        <VideoPlayer video={{ url: "https://video-url.mp4", isAgeRestricted: false }} />
      </Wrapper>
    );

    const videoPlayer = queryByTestId("hls-video-player");

    await waitFor(() => {
      expect(videoPlayer).not.toHaveClass("hidden");
      expect((videoPlayer?.children[0] as any)?.src).toEqual("https://video-url.mp4/");
      expect((videoPlayer?.children[0] as any)?.type).toEqual("video/mp4");
    });
  });

  test("should show the hls video with the public src url", async () => {
    const { queryByTestId } = render(
      <Wrapper>
        <VideoPlayer video={{ url: "https://stream-url", isAgeRestricted: false }} />
      </Wrapper>
    );

    const videoPlayer = queryByTestId("hls-video-player");

    await waitFor(() => {
      expect(videoPlayer).not.toHaveClass("hidden");
      expect((videoPlayer?.children[0] as any)?.src).toEqual("https://stream-url/");
      expect((videoPlayer?.children[0] as any)?.type).toEqual("application/x-mpegURL");
    });
  });

  test("should show the hls video with the generated signedURL src url", async () => {
    vi.spyOn(firebaseCaller, "generateStreamURL").mockResolvedValue("https://mocked-stream-url");

    const { queryByTestId } = render(
      <Wrapper>
        <VideoPlayer video={{ url: "012345678901234567890123/01234567890123456789/stream", isAgeRestricted: false }} />
      </Wrapper>
    );

    const videoPlayer = queryByTestId("hls-video-player");

    await waitFor(() => {
      expect(videoPlayer).not.toHaveClass("hidden");
      expect((videoPlayer?.children[0] as any)?.src).toEqual("https://mocked-stream-url/");
      expect((videoPlayer?.children[0] as any)?.type).toEqual("application/x-mpegURL");
    });
  });

  test("should not create the video in Dom until the url passed", async () => {
    const { queryByTestId, rerender } = render(
      <Wrapper>
        <VideoPlayer video={{ url: "", isAgeRestricted: false }} />
      </Wrapper>
    );

    let videoPlayer = queryByTestId("hls-video-player");
    expect(videoPlayer?.children.length).toEqual(0);

    rerender(
      <Wrapper>
        <VideoPlayer video={{ url: "012345678901234567890123/01234567890123456789/stream", isAgeRestricted: false }} />
      </Wrapper>
    );

    videoPlayer = queryByTestId("hls-video-player");
    await waitFor(() => expect(videoPlayer?.children.length).toEqual(1));
  });
});
