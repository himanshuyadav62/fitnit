// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SetLogForm } from "./set-log-form";

vi.mock("@/app/actions", () => ({ logSet: vi.fn() }));

const baseProps = {
  sessionId: "2b086f1e-85a7-4e76-9006-77824954c258",
  planExerciseId: "51b119e6-51c1-411a-8b06-bb279d287a4e",
  setNumber: 1,
  defaultReps: 8,
  defaultWeightKg: "42.5",
  defaultRir: 2,
  saved: false,
  disabled: false,
};

describe("SetLogForm", () => {
  it("prefills the previous performance and adjusts reps one at a time", () => {
    render(<SetLogForm {...baseProps} usesPreviousPerformance />);

    expect((screen.getByLabelText("KG · LAST") as HTMLInputElement).value).toBe("42.5");
    expect((screen.getByLabelText("REPS") as HTMLInputElement).value).toBe("8");

    fireEvent.click(screen.getByRole("button", { name: "Add one rep to set 1" }));
    expect((screen.getByLabelText("REPS") as HTMLInputElement).value).toBe("9");

    fireEvent.click(screen.getByRole("button", { name: "Remove one rep from set 1" }));
    expect((screen.getByLabelText("REPS") as HTMLInputElement).value).toBe("8");
  });
});
