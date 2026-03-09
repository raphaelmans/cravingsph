"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tracks which category section is currently visible in the viewport
 * using IntersectionObserver. Returns the active category ID and a
 * ref callback to register section elements.
 */
export function useCategoryObserver(categoryIds: string[]) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    categoryIds[0] ?? null,
  );
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    if (categoryIds.length === 0) return;

    // Track which sections are intersecting and their positions
    const visibleSections = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute("data-category-id");
          if (!id) continue;

          if (entry.isIntersecting) {
            visibleSections.set(id, entry.boundingClientRect.top);
          } else {
            visibleSections.delete(id);
          }
        }

        // Pick the topmost visible section
        if (visibleSections.size > 0) {
          let topId = "";
          let topPosition = Number.POSITIVE_INFINITY;
          for (const [id, top] of visibleSections) {
            if (top < topPosition) {
              topPosition = top;
              topId = id;
            }
          }
          if (topId) {
            setActiveCategoryId(topId);
          }
        }
      },
      {
        // Trigger when sections cross 100px below the top
        rootMargin: "-100px 0px -60% 0px",
        threshold: 0,
      },
    );

    // Observe all registered sections
    for (const el of sectionsRef.current.values()) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [categoryIds]);

  const registerSection = useCallback((id: string, el: HTMLElement | null) => {
    if (el) {
      sectionsRef.current.set(id, el);
      observerRef.current?.observe(el);
    } else {
      const existing = sectionsRef.current.get(id);
      if (existing) {
        observerRef.current?.unobserve(existing);
      }
      sectionsRef.current.delete(id);
    }
  }, []);

  return { activeCategoryId, registerSection };
}
