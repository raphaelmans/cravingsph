import {
  composePortalSlug,
  generatePortalSlug,
  generateSlug,
  randomSuffix,
} from "@/shared/kernel/slug";

describe("generateSlug", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(generateSlug("Café & Bar!")).toBe("caf-bar");
  });

  it("collapses multiple hyphens", () => {
    expect(generateSlug("a---b")).toBe("a-b");
  });

  it("trims leading and trailing hyphens", () => {
    expect(generateSlug(" - hello - ")).toBe("hello");
  });

  it("handles empty-ish input", () => {
    expect(generateSlug("   ")).toBe("");
  });

  it("preserves digits", () => {
    expect(generateSlug("Branch 123")).toBe("branch-123");
  });
});

describe("randomSuffix", () => {
  it("returns a 4-character string", () => {
    const suffix = randomSuffix();
    expect(suffix).toHaveLength(4);
  });

  it("contains only alphanumeric characters", () => {
    for (let i = 0; i < 20; i++) {
      expect(randomSuffix()).toMatch(/^[a-z0-9]{4}$/);
    }
  });
});

describe("composePortalSlug", () => {
  it("joins restaurant and branch slugs with a hyphen", () => {
    expect(composePortalSlug("jollibee", "makati")).toBe("jollibee-makati");
  });

  it("handles multi-word slugs", () => {
    expect(composePortalSlug("mang-inasal", "sm-north-edsa")).toBe(
      "mang-inasal-sm-north-edsa",
    );
  });
});

describe("generatePortalSlug", () => {
  it("returns base slug when not taken", async () => {
    const slug = await generatePortalSlug(
      "jollibee",
      "makati",
      "Makati City",
      async () => false,
    );
    expect(slug).toBe("jollibee-makati");
  });

  it("appends city slug when base is taken", async () => {
    const taken = new Set(["jollibee-makati"]);
    const slug = await generatePortalSlug(
      "jollibee",
      "makati",
      "Makati City",
      async (candidate) => taken.has(candidate),
    );
    expect(slug).toBe("jollibee-makati-makati-city");
  });

  it("appends random suffix when base and city-appended are both taken", async () => {
    const taken = new Set(["jollibee-makati", "jollibee-makati-makati-city"]);
    const slug = await generatePortalSlug(
      "jollibee",
      "makati",
      "Makati City",
      async (candidate) => taken.has(candidate),
    );
    expect(slug).toMatch(/^jollibee-makati-[a-z0-9]{4}$/);
  });

  it("appends random suffix when base is taken and city is null", async () => {
    const taken = new Set(["jollibee-makati"]);
    const slug = await generatePortalSlug(
      "jollibee",
      "makati",
      null,
      async (candidate) => taken.has(candidate),
    );
    expect(slug).toMatch(/^jollibee-makati-[a-z0-9]{4}$/);
  });

  it("skips city fallback when city generates empty slug", async () => {
    const taken = new Set(["jollibee-makati"]);
    const slug = await generatePortalSlug(
      "jollibee",
      "makati",
      "   ", // empty after slugification
      async (candidate) => taken.has(candidate),
    );
    expect(slug).toMatch(/^jollibee-makati-[a-z0-9]{4}$/);
  });
});
