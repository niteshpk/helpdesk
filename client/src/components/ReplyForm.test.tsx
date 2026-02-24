import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { renderWithQuery } from "@/test/render";
import ReplyForm from "./ReplyForm";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, { deep: true });

const TICKET_ID = 42;

beforeEach(() => {
  vi.resetAllMocks();
});

function renderForm() {
  const user = userEvent.setup();
  renderWithQuery(<ReplyForm ticket={{ id: TICKET_ID }} />);
  return { user };
}

describe("ReplyForm", () => {
  it("should render textarea and submit button", () => {
    renderForm();

    expect(screen.getByPlaceholderText("Type your reply...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Reply" })).toBeInTheDocument();
  });

  it("should show validation error when submitting empty body", async () => {
    const { user } = renderForm();

    await user.click(screen.getByRole("button", { name: "Send Reply" }));

    await waitFor(() => {
      expect(screen.getByText("Reply body is required")).toBeInTheDocument();
    });
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("should show validation error for whitespace-only body", async () => {
    const { user } = renderForm();

    await user.type(screen.getByPlaceholderText("Type your reply..."), "   ");
    await user.click(screen.getByRole("button", { name: "Send Reply" }));

    await waitFor(() => {
      expect(screen.getByText("Reply body is required")).toBeInTheDocument();
    });
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("should call POST /api/tickets/:ticketId/replies with body on valid submit", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: 1, body: "Hello" } });
    const { user } = renderForm();

    await user.type(screen.getByPlaceholderText("Type your reply..."), "Hello");
    await user.click(screen.getByRole("button", { name: "Send Reply" }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `/api/tickets/${TICKET_ID}/replies`,
        { body: "Hello" }
      );
    });
  });

  it("should clear the textarea after successful submission", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: 1, body: "Hello" } });
    const { user } = renderForm();

    const textarea = screen.getByPlaceholderText("Type your reply...");
    await user.type(textarea, "Hello");
    await user.click(screen.getByRole("button", { name: "Send Reply" }));

    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
  });

  it("should show 'Sending...' and disable button while submitting", async () => {
    mockedAxios.post.mockReturnValue(new Promise(() => {}));
    const { user } = renderForm();

    await user.type(screen.getByPlaceholderText("Type your reply..."), "Hello");
    await user.click(screen.getByRole("button", { name: "Send Reply" }));

    await waitFor(() => {
      const button = screen.getByRole("button", { name: "Sending..." });
      expect(button).toBeDisabled();
    });
  });

  it("should display server error message from Axios response", async () => {
    const error = new Error("Bad Request");
    Object.assign(error, {
      response: { status: 400, data: { error: "Ticket not found" } },
    });
    mockedAxios.post.mockRejectedValue(error);
    mockedAxios.isAxiosError.mockReturnValue(true);
    const { user } = renderForm();

    await user.type(screen.getByPlaceholderText("Type your reply..."), "Hello");
    await user.click(screen.getByRole("button", { name: "Send Reply" }));

    await waitFor(() => {
      expect(screen.getByText("Ticket not found")).toBeInTheDocument();
    });
  });

  it("should show generic error for non-Axios errors", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Network failure"));
    mockedAxios.isAxiosError.mockReturnValue(false);
    const { user } = renderForm();

    await user.type(screen.getByPlaceholderText("Type your reply..."), "Hello");
    await user.click(screen.getByRole("button", { name: "Send Reply" }));

    await waitFor(() => {
      expect(screen.getByText("Failed to send reply")).toBeInTheDocument();
    });
  });

  it("should not show error alert before submission", () => {
    renderForm();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
