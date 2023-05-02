import { fireEvent, render, screen } from "@testing-library/react";
import { SignInButton } from ".";
import { signIn, signOut, useSession } from "next-auth/react";

jest.mock("next-auth/react");

describe("SignInButton component", () => {
  it("renders correctly when user is not authenticated", () => {
    const useSessionMocked = jest.mocked(useSession);

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: "unauthenticated",
      update: async () => null,
    });

    render(<SignInButton />);

    expect(screen.getByText("Sign in with Github")).toBeInTheDocument();
  });

  it("renders correctly when user is authenticated", () => {
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

    render(<SignInButton />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("signOut user when signOut button is clicked", () => {
    const useSessionMocked = jest.mocked(useSession);
    const signOutMocked = jest.mocked(signOut);

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

    render(<SignInButton />);

    const signOutButton = screen.getByText("John Doe");
    fireEvent.click(signOutButton);

    expect(signOutMocked).toHaveBeenCalled();
  });

  it("signIn user when signIn button is clicked", () => {
    const useSessionMocked = jest.mocked(useSession);
    const signInMocked = jest.mocked(signIn);

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: "unauthenticated",
      update: async () => null,
    });

    render(<SignInButton />);

    const signInButton = screen.getByText("Sign in with Github");
    fireEvent.click(signInButton);

    expect(signInMocked).toHaveBeenCalledWith("github");
  });
});
