"use client";

import { useEffect, useRef, useState } from "react";

const Test = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null); // 100dvh相当
  const [vhHeight, setVhHeight] = useState<number | null>(null); // 100vh相当
  const [vwWidth, setVwWidth] = useState<number | null>(null); // 100vw相当

  useEffect(() => {
    const vh = window.innerHeight; // 高さ
    const vw = window.innerWidth; // 横幅
    setVhHeight(vh);
    setVwWidth(vw);

    if (containerRef.current) {
      const actualHeight = containerRef.current.getBoundingClientRect().height;
      setMeasuredHeight(actualHeight);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100dvh",
        backgroundColor: "#f5faff",
        padding: "1rem",
        fontSize: "1.1rem",
      }}
    >
      <p>
        📏 window.innerHeight (100vh): <strong>{vhHeight}px</strong>
      </p>
      <p>
        📐 getBoundingClientRect().height (100dvh相当):{" "}
        <strong>{measuredHeight}px</strong>
      </p>
      <p>
        📐 window.innerWidth (100vw): <strong>{vwWidth}px</strong>
      </p>

      {vhHeight && measuredHeight && (
        <p style={{ marginTop: "1rem", color: "gray" }}>
          高さの差: {(vhHeight - measuredHeight).toFixed(1)} px
        </p>
      )}
    </div>
  );
};

export default Test;
