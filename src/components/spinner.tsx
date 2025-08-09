import React, { memo } from "react";

const Spinner = () => {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  const [frameIndex, setFrameIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 80);
    return () => clearInterval(interval);
  }, [frames.length]);

  return <div className="">{frames[frameIndex]}</div>;
};

export default memo(Spinner);
