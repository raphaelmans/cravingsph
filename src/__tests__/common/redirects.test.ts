import { appRoutes } from "@/common/app-routes";
import { getSafeRedirectPath } from "@/common/redirects";

describe("getSafeRedirectPath", () => {
  it("returns the fallback when the redirect targets another origin", () => {
    // Arrange
    const redirect = "https://evil.example/login";

    // Act
    const result = getSafeRedirectPath(redirect, {
      fallback: appRoutes.index.base,
      origin: "https://cravings.ph",
    });

    // Assert
    expect(result).toBe(appRoutes.index.base);
  });

  it("returns the in-origin path when the redirect matches the allowed origin", () => {
    // Arrange
    const redirect =
      "https://cravings.ph/restaurant/adobo-house?tab=menu#items";

    // Act
    const result = getSafeRedirectPath(redirect, {
      fallback: appRoutes.index.base,
      origin: "https://cravings.ph",
    });

    // Assert
    expect(result).toBe("/restaurant/adobo-house?tab=menu#items");
  });

  it("returns the fallback when a disallowed route type is requested", () => {
    // Arrange
    const redirect = appRoutes.organization.payments;

    // Act
    const result = getSafeRedirectPath(redirect, {
      fallback: appRoutes.index.base,
      disallowRoutes: ["organization"],
    });

    // Assert
    expect(result).toBe(appRoutes.index.base);
  });
});
