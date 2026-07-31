"use client";

import { useEffect, useRef, useState } from "react";
import { LabAtmosphere } from "@/components/hero/lab-atmosphere";

type AtmosphereOrbsProps = {
  className: string;
  density?: "standard" | "dense";
  scale?: number;
  tone?: "default" | "on-teal";
};

export function AtmosphereOrbs({
  className,
  density = "dense",
  scale = 1.16,
  tone = "default",
}: AtmosphereOrbsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (typeof IntersectionObserver === "undefined") {
      const animationFrame = window.requestAnimationFrame(() => setIsNearViewport(true));
      return () => window.cancelAnimationFrame(animationFrame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: "160px 0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div aria-hidden="true" className={`pointer-events-none ${className}`} ref={containerRef}>
      {isNearViewport ? <LabAtmosphere density={density} scale={scale} tone={tone} /> : null}
    </div>
  );
}
