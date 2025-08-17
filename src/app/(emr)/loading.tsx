"use client";

import React from "react";
import "./loading.css"; // chứa phần CSS animation

const LoadingPage = () => {
  return (
    <div className="flex relative justify-center items-center min-h-screen bg-[rgba(249,251,255,0.6)]">
      <div className="boxes">
        <div className="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>

      <div className="absolute bottom-3/12 text-center">
        <div className="loading-text text-blue-500">Đang tải dữ liệu...</div>
        <div className="loading-text text-sm text-gray-500">
          Vui lòng đợi trong giây lát
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
