import { render, screen } from "@testing-library/react";
import { ActiveLink } from ".";

jest.mock("next/router", () => {
  return {
    useRouter() {
      return {
        asPath: "/",
      };
    },
  };
});

describe("ActiveLink component", () => {
  it("renders correctly", () => {
    render(
      <ActiveLink href="/" activeClassName="active">
        <h1>Home</h1>
      </ActiveLink>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("adds active class if the href is equal to asPath", () => {
    render(
      <ActiveLink href="/" activeClassName="active">
        <h1>Home</h1>
      </ActiveLink>
    );

    expect(screen.getByText("Home")).toHaveClass("active");
  });
});