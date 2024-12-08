import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";

import { Btn, PrimaryButton, SecondaryButton, AbortButton, WarningButton } from "./buttons";

describe("buttons", () => {
  describe("Btn", () => {
    test("renders correctly", () => {
      const { getByText } = render(<Btn>Button</Btn>);
      const buttonElement = getByText("Button");
      expect(buttonElement).toBeInTheDocument();
    });

    test("triggers onClick event", () => {
      const onClickMock = vi.fn();
      const { getByText } = render(<Btn onClick={onClickMock}>Button</Btn>);
      const buttonElement = getByText("Button");
      fireEvent.click(buttonElement);
      expect(onClickMock).toHaveBeenCalled();
    });

    test("is disabled when disabled prop is true", () => {
      const { getByText } = render(<Btn disabled>Button</Btn>);
      const buttonElement = getByText("Button");
      expect(buttonElement).toBeDisabled();
    });
  });

  describe("PrimaryButton", () => {
    test("renders Btn component", () => {
      const { getByText } = render(<PrimaryButton>Primary Button</PrimaryButton>);
      expect(getByText("Primary Button")).toBeInTheDocument();
    });
  });

  describe("SecondaryButton", () => {
    test("renders Btn component", () => {
      const { getByText } = render(<SecondaryButton>Secondary Button</SecondaryButton>);
      expect(getByText("Secondary Button")).toBeInTheDocument();
    });
  });

  describe("AbortButton", () => {
    test("renders Btn component", () => {
      const { getByText } = render(<AbortButton>Abort Button</AbortButton>);
      expect(getByText("Abort Button")).toBeInTheDocument();
    });
  });

  describe("WarningButton", () => {
    test("renders Btn component", () => {
      const { getByText } = render(<WarningButton>Warning Button</WarningButton>);
      expect(getByText("Warning Button")).toBeInTheDocument();
    });
  });
});
