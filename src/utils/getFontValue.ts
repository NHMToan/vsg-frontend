// @mui
// import { useTheme } from "@mui/material/styles";
// // hooks
// import useResponsive from "../hooks/useResponsive";

// // ----------------------------------------------------------------------

// export default function GetFontValue(
//   variant: string
// ): Record<string, string | number> {
//   const theme = useTheme();
//   const breakpoints = useWidth();

//   const key = theme.breakpoints.up(breakpoints === "xl" ? "lg" : breakpoints);

//   const hasResponsive =
//     variant === "h1" ||
//     variant === "h2" ||
//     variant === "h3" ||
//     variant === "h4" ||
//     variant === "h5" ||
//     variant === "h6";

//   const getFont =
//     hasResponsive && theme.typography[variant][key]
//       ? theme.typography[variant][key]
//       : theme.typography[variant];

//   const fontSize = remToPx(getFont.fontSize);
//   const lineHeight = Number(theme.typography[variant].lineHeight) * fontSize;
//   const fontWeight = theme.typography[variant].fontWeight;
//   const letterSpacing = theme.typography[variant].letterSpacing;

//   return { fontSize, lineHeight, fontWeight, letterSpacing };
// }

// // ----------------------------------------------------------------------

export function remToPx(value: string): number {
  return Math.round(parseFloat(value) * 16);
}

export function pxToRem(value: number): string {
  return `${value / 16}rem`;
}

export function responsiveFontSizes({
  sm,
  md,
  lg,
}: {
  sm: number;
  md: number;
  lg: number;
}): Record<string, unknown> {
  return {
    "@media (min-width:600px)": {
      fontSize: pxToRem(sm),
    },
    "@media (min-width:900px)": {
      fontSize: pxToRem(md),
    },
    "@media (min-width:1200px)": {
      fontSize: pxToRem(lg),
    },
  };
}

// ----------------------------------------------------------------------

// function useWidth(): any {
//   const theme = useTheme();
//   const keys = [...theme.breakpoints.keys].reverse();
//   return (
//     keys.reduce((output: string | null, key: string) => {
//       const matches = useResponsive("up", key);
//       return !output && matches ? key : output;
//     }, null) || "xs"
//   );
// }
