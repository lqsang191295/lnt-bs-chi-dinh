import { memo } from "react";
import Spinner from "./spinner";

const DataLoading = ({ text = "Đang tải dữ liệu..." }) => {
  return (
    <div className="w-full h-full flex flex-row gap-2 items-center justify-center">
      <Spinner />
      <span className="text-gray-500">{text}</span>
    </div>
  );
};

export default memo(DataLoading);
