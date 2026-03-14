import {
  getRouteType,
  isGuestRoute,
  isProtectedRoute,
} from "@/common/app-routes";

describe("getRouteType", () => {
  it("returns 'guest' for /register", () => {
    expect(getRouteType("/register")).toBe("guest");
  });

  it("returns 'guest' for /register/owner", () => {
    expect(getRouteType("/register/owner")).toBe("guest");
  });

  it("returns 'public' for /register/team (override)", () => {
    expect(getRouteType("/register/team")).toBe("public");
  });

  it("returns 'public' for /register/team sub-paths", () => {
    expect(getRouteType("/register/team/something")).toBe("public");
  });

  it("does not redirect authenticated users from /register/team", () => {
    expect(isGuestRoute("/register/team")).toBe(false);
  });

  it("does not require auth for /register/team", () => {
    expect(isProtectedRoute("/register/team")).toBe(false);
  });

  it("returns 'guest' for /login", () => {
    expect(getRouteType("/login")).toBe("guest");
  });

  it("returns 'protected' for /orders", () => {
    expect(getRouteType("/orders")).toBe("protected");
  });

  it("returns 'public' for /", () => {
    expect(getRouteType("/")).toBe("public");
  });
});
