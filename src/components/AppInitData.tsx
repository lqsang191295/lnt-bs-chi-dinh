"use client";

import { useState, useEffect } from "react";
import { useMenuStore } from "@/store/menu";
import { getMenuItems } from "@/actions/menu";
import { getClaimsFromToken } from "@/utils/auth";
import { useUserStore } from "@/store/user";

export function AppInitData() {
  const { setData } = useMenuStore();
  const { setUserData } = useUserStore();

  useEffect(() => {
    InitData();
  }, []);

  const InitData = async () => {
    initMenu();
    initUser();
  };

  const initMenu = async () => {
    try {
      const menu = await getMenuItems();
      console.log("Menu items fetched:", menu);
      setData(menu);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const initUser = async () => {
    try {
      const claims = getClaimsFromToken();
      console.log("Claims fetched:", claims);
      if (claims) {
        setUserData(claims);
      } else {
        console.warn("No valid claims found in token");
      }
    } catch (error) {
      console.error("Error initializing user data:", error);
    }
  };
  return null;
}
