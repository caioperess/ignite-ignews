import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SubscribeButton } from ".";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "@/services/api";
import { getStripeJS } from "@/services/stripe-js";

jest.mock("next-auth/react");
jest.mock("next/router", () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));
jest.mock("@/services/stripe-js");
jest.mock("@/services/api");

describe("SubscribeButton component", () => {
  it("renders correctly", () => {
    const useSessionMocked = jest.mocked(useSession);

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: "unauthenticated",
      update: async () => null,
    });

    render(<SubscribeButton />);

    expect(screen.getByText("Subscribe now")).toBeInTheDocument();
  });

  it("redirects user to signIn when not authenticated", () => {
    const useSessionMocked = jest.mocked(useSession);
    const signInMocked = jest.mocked(signIn);

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: "unauthenticated",
      update: async () => null,
    });

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText("Subscribe now");
    fireEvent.click(subscribeButton);

    expect(signInMocked).toHaveBeenCalled();
  });

  it("redirects user to posts when user already has a subscription", () => {
    const useRouterMocked = jest.mocked(useRouter);
    const useSessionMocked = jest.mocked(useSession);

    useSessionMocked.mockReturnValueOnce({
      data: {
        user: {
          name: "John Doe",
          email: "johndoe@email.com",
        },
        activeSubscription: {},
        expires: "",
      },
      status: "authenticated",
      update: async () => null,
    });

    const pushMock = jest.fn();

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText("Subscribe now");
    fireEvent.click(subscribeButton);

    expect(pushMock).toHaveBeenCalledWith("/posts");
  });

  it("redirects user to checkOut when user doesnt has a subscription", async () => {
    const sessionId = "fake-session-id";
    const useSessionMocked = jest.mocked(useSession);
    const apiMock = jest.mocked(api);
    const getStripeJSMocked = jest.mocked(getStripeJS);
    const redirectToCheckoutMocked = jest.fn();

    useSessionMocked.mockReturnValueOnce({
      data: {
        user: {
          name: "John Doe",
          email: "johndoe@email.com",
        },
        activeSubscription: null,
        expires: "fake-expires",
      },
      status: "authenticated",
      update: async () => null,
    });

    getStripeJSMocked.mockResolvedValueOnce({
      redirectToCheckout: redirectToCheckoutMocked,
    } as any);

    apiMock.post.mockResolvedValueOnce({
      data: {
        sessionId,
      },
    });

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText("Subscribe now");
    fireEvent.click(subscribeButton);

    expect(apiMock.post).toHaveBeenCalledWith("/subscribe");
    await waitFor(() => expect(getStripeJSMocked).toHaveBeenCalled());
    expect(redirectToCheckoutMocked).toHaveBeenCalledWith({ sessionId });
  });

  it("should alert the error message when then the post requisiton fails", async () => {
    const errorMessage = "fake-error-message";
    const useSessionMocked = jest.mocked(useSession);
    const apiMock = jest.mocked(api);
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    useSessionMocked.mockReturnValueOnce({
      data: {
        user: {
          name: "John Doe",
          email: "johndoe@email.com",
        },
        activeSubscription: null,
        expires: "fake-expires",
      },
      status: "authenticated",
      update: async () => null,
    });

    apiMock.post.mockRejectedValueOnce({
      message: errorMessage,
    });

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText("Subscribe now");
    fireEvent.click(subscribeButton);

    await waitFor(() => expect(alertMock).toHaveBeenCalledWith(errorMessage));
  });
});
