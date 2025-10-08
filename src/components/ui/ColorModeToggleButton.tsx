"use client";
import { IconButton } from "@chakra-ui/react";
import { LuMoon, LuSun } from "react-icons/lu";
import { useColorMode } from "./color-mode";

export default function ColorModeToggleButton() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      aria-label="Toggle color mode"
      variant="outline"
      onClick={toggleColorMode}
    >
      {colorMode === "light" ? <LuMoon /> : <LuSun />}
    </IconButton>
  );
}
