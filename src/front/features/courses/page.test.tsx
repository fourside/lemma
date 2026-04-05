import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CourseWithProgress } from "../../../models/course";
import { TestWrapper } from "../../testing/wrapper";
import { CoursesPage } from "./page";

vi.mock("../../shared/api/client", () => ({
  swrFetcher: vi.fn(),
}));

const useSWRMock = vi.hoisted(() => vi.fn());
vi.mock("swr", async (importOriginal) => {
  const actual = await importOriginal<typeof import("swr")>();
  return { ...actual, default: useSWRMock };
});

const courses: CourseWithProgress[] = [
  {
    id: 1,
    phase: 0,
    title: "高校数学の橋渡し",
    subtitle: "CS離散数学に必要な速習",
    sortOrder: 1,
    totalWeeks: 3,
    completedWeeks: 1,
  },
  {
    id: 2,
    phase: 1,
    title: "計算機科学の数学",
    subtitle: "MIT 6.042J 相当",
    sortOrder: 2,
    totalWeeks: 6,
    completedWeeks: 0,
  },
];

describe("CoursesPage", () => {
  it("renders nothing while loading", () => {
    useSWRMock.mockReturnValue({ data: undefined });
    const { container } = render(<CoursesPage />, { wrapper: TestWrapper });
    expect(container.innerHTML).toBe("");
  });

  it("renders courses grouped by phase", () => {
    useSWRMock.mockReturnValue({ data: courses });

    render(<CoursesPage />, { wrapper: TestWrapper });

    expect(screen.getByText("Phase 0: Preparation")).toBeInTheDocument();
    expect(screen.getByText("Phase 1: Foundation")).toBeInTheDocument();
    expect(screen.getByText("高校数学の橋渡し")).toBeInTheDocument();
    expect(screen.getByText("計算機科学の数学")).toBeInTheDocument();
    expect(screen.getByText("MIT 6.042J 相当")).toBeInTheDocument();
  });
});
