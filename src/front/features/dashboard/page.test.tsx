import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DashboardData } from "../../../models/dashboard";
import { TestWrapper } from "../../testing/wrapper";
import { DashboardPage } from "./page";

vi.mock("../../shared/api/client", () => ({
  swrFetcher: vi.fn(),
}));

const useSWRMock = vi.hoisted(() => vi.fn());
vi.mock("swr", async (importOriginal) => {
  const actual = await importOriginal<typeof import("swr")>();
  return { ...actual, default: useSWRMock };
});

function mockDashboard(data: DashboardData | undefined) {
  useSWRMock.mockReturnValue({
    data,
    error: undefined,
    isLoading: !data,
    mutate: vi.fn(),
  });
}

describe("DashboardPage", () => {
  it("renders nothing while loading", () => {
    mockDashboard(undefined);
    const { container } = render(<DashboardPage />, { wrapper: TestWrapper });
    expect(container.innerHTML).toBe("");
  });

  it("renders progress and next week", () => {
    mockDashboard({
      totalWeeks: 49,
      completedWeeks: 5,
      completionPercent: 10,
      nextWeek: {
        weekId: 6,
        courseTitle: "計算機科学の数学",
        weekTitle: "離散確率",
        weekNumber: 4,
      },
      recentTest: null,
    });

    render(<DashboardPage />, { wrapper: TestWrapper });

    expect(screen.getByText("Lemma")).toBeInTheDocument();
    expect(screen.getByText(/5\/49/)).toBeInTheDocument();
    expect(screen.getByText(/計算機科学の数学/)).toBeInTheDocument();
    expect(screen.getByText(/離散確率/)).toBeInTheDocument();
  });

  it("renders recent test score", () => {
    mockDashboard({
      totalWeeks: 49,
      completedWeeks: 1,
      completionPercent: 2,
      nextWeek: null,
      recentTest: {
        weekTitle: "論理と集合",
        score: 85,
      },
    });

    render(<DashboardPage />, { wrapper: TestWrapper });

    expect(screen.getByText(/論理と集合/)).toBeInTheDocument();
    expect(screen.getByText(/85pt/)).toBeInTheDocument();
  });
});
