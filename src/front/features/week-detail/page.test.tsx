import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { WeekDetail } from "../../../models/week";
import { TestWrapper } from "../../testing/wrapper";
import { WeekDetailPage } from "./page";

const mockApiFetch = vi.fn();
vi.mock("../../shared/api/client", () => ({
  swrFetcher: vi.fn(),
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const useSWRMock = vi.hoisted(() => vi.fn());
vi.mock("swr", async (importOriginal) => {
  const actual = await importOriginal<typeof import("swr")>();
  return { ...actual, default: useSWRMock };
});

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return { ...actual, useParams: () => ({ weekId: "1" }) };
});

const baseWeek: WeekDetail = {
  id: 1,
  courseId: 1,
  weekNumber: 1,
  title: "論理と集合",
  keywords: "命題, 集合, ド・モルガン",
  isTest: false,
  courseTitle: "高校数学の橋渡し",
  status: "not_started",
  testScore: null,
  testNotes: null,
  startedAt: null,
  completedAt: null,
};

describe("WeekDetailPage", () => {
  it("renders week detail with keywords", () => {
    useSWRMock.mockReturnValue({
      data: baseWeek,
      mutate: vi.fn(),
    });

    render(<WeekDetailPage />, { wrapper: TestWrapper });

    expect(screen.getByText(/論理と集合/)).toBeInTheDocument();
    expect(screen.getByText("命題")).toBeInTheDocument();
    expect(screen.getByText("集合")).toBeInTheDocument();
    expect(screen.getByText("ド・モルガン")).toBeInTheDocument();
  });

  it("shows mark done button for next step", () => {
    useSWRMock.mockReturnValue({
      data: baseWeek,
      mutate: vi.fn(),
    });

    render(<WeekDetailPage />, { wrapper: TestWrapper });

    expect(screen.getByText("Mark done")).toBeInTheDocument();
  });

  it("calls apiFetch and mutate when marking progress", async () => {
    const mutate = vi.fn();
    mockApiFetch.mockResolvedValue({ ok: true });
    useSWRMock.mockReturnValue({
      data: baseWeek,
      mutate,
    });

    render(<WeekDetailPage />, { wrapper: TestWrapper });

    await userEvent.click(screen.getByText("Mark done"));

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/weeks/1/progress",
      expect.objectContaining({
        method: "PUT",
      }),
    );
    expect(mutate).toHaveBeenCalled();
  });

  it("shows test score form after text_done", () => {
    useSWRMock.mockReturnValue({
      data: { ...baseWeek, status: "text_done" },
      mutate: vi.fn(),
    });

    render(<WeekDetailPage />, { wrapper: TestWrapper });

    expect(screen.getByText("Record Test Score")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Score (0-100)")).toBeInTheDocument();
  });

  it("shows completed test score", () => {
    useSWRMock.mockReturnValue({
      data: {
        ...baseWeek,
        status: "test_done",
        testScore: 85,
        testNotes: "帰納法が弱い",
      },
      mutate: vi.fn(),
    });

    render(<WeekDetailPage />, { wrapper: TestWrapper });

    expect(screen.getByText("85/100")).toBeInTheDocument();
    expect(screen.getByText("帰納法が弱い")).toBeInTheDocument();
  });
});
