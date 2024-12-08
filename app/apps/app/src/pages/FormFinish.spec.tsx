import { Mock, describe, test, vi } from "vitest";
import { useSelector } from "react-redux";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
import { FormFinish } from "./FormFinish";

vi.mock("react-redux");
vi.mock("firebase/auth");

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("@app/components/AutoHeightTextarea");
vi.mock("@app/components/CreatorBottomButtons");
vi.mock("@app/components/finalStep/AlertBanner");
vi.mock("@app/constants/ToastTypes");
vi.mock("@app/utils/callFirebaseFunction");
vi.mock("@app/constants/Messages");
vi.mock("@app/components/AgeRestrictionInformation");
vi.mock("@app/components/LegalPreviewModal");
vi.mock("@app/utils/callFirebaseMicroservice");

vi.mock("@app/util", async () => {
  const actual = await vi.importActual("@app/util");
  return {
    ...(actual as object),
  };
});

vi.mock("@app/hooks/useToast", () => ({
  __esModule: true,
  default: () => ({ openToast: vi.fn() }),
}));

vi.mock("@app/redux/selectors/creation");

describe("FormFinish", () => {
  beforeEach(() => {
    (useSelector as Mock).mockReturnValue({
      title: "mockTitle",
      audience: 0,
      genre: 0,
      attributes: [],
      summary: "mockSummary",
    });

    vi.clearAllMocks();
  });

  test("Age restriction checkbox", async () => {
    const { getByRole } = render(<FormFinish creationId="mockCreationId" prevStepFun={vi.fn()} />);
    const checkbox = getByRole("checkbox") as HTMLInputElement;

    expect(checkbox.checked).toBe(false);

    act(() => {
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
      expect(checkbox.checked).toBe(true);
    });
  });
});
