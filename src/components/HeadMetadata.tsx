import React, { useEffect } from "react";

function HeadMetadata({ title = "" }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}

export default React.memo(HeadMetadata);
