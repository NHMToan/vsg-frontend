import { Box, BoxProps, Stack } from "@mui/material";
// @mui
import { styled, useTheme } from "@mui/material/styles";
import { ReactNode } from "react";
import { IconButtonAnimate } from "../animate";
//
import Iconify from "../Iconify";

// ----------------------------------------------------------------------

const BUTTON_SIZE = 40;
interface ArrowStyleProps {
  filled?: boolean;
  theme?: any;
}
const ArrowStyle = styled(IconButtonAnimate, {
  shouldForwardProp: (prop) => prop !== "filled",
})<ArrowStyleProps>(({ filled, theme }) => ({
  width: BUTTON_SIZE,
  height: BUTTON_SIZE,
  cursor: "pointer",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    color: theme.palette.text.primary,
  },
  ...(filled && {
    opacity: 0.48,
    borderRadius: Number(theme.shape.borderRadius) * 1.5,
    color: theme.palette.common.white,
    backgroundColor: theme.palette.grey[900],
    "&:hover": {
      opacity: 1,
      color: theme.palette.common.white,
      backgroundColor: theme.palette.grey[900],
    },
  }),
}));

// ----------------------------------------------------------------------

interface CarouselArrowsProps extends BoxProps {
  children?: ReactNode;
  customIcon?: any;
  filled?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  spacing?: number;
}
export default function CarouselArrows({
  filled = false,
  customIcon, // Set icon right
  onNext,
  onPrevious,
  children,
  ...other
}: CarouselArrowsProps) {
  const theme = useTheme();
  const isRTL = theme.direction === "rtl";

  const style = {
    position: "absolute",
    mt: -2.5,
    top: "50%",
    zIndex: 9,
  };

  if (children) {
    return (
      <Box {...other}>
        <Box className="arrow left" sx={{ ...style, left: 0 }}>
          <ArrowStyle filled={filled} onClick={onPrevious}>
            {leftIcon(customIcon, isRTL)}
          </ArrowStyle>
        </Box>

        {children}

        <Box className="arrow right" sx={{ ...style, right: 0 }}>
          <ArrowStyle filled={filled} onClick={onNext}>
            {rightIcon(customIcon, isRTL)}
          </ArrowStyle>
        </Box>
      </Box>
    );
  }

  return (
    <Stack direction="row" spacing={1} {...(other as any)}>
      <ArrowStyle className="arrow left" filled={filled} onClick={onPrevious}>
        {leftIcon(customIcon, isRTL)}
      </ArrowStyle>
      <ArrowStyle className="arrow right" filled={filled} onClick={onNext}>
        {rightIcon(customIcon, isRTL)}
      </ArrowStyle>
    </Stack>
  );
}

// ----------------------------------------------------------------------

const leftIcon = (customIcon, isRTL) => (
  <Iconify
    icon={customIcon || "eva:arrow-right-fill"}
    sx={{
      width: 20,
      height: 20,
      transform: " scaleX(-1)",
      ...(isRTL && { transform: " scaleX(1)" }),
    }}
  />
);

const rightIcon = (customIcon, isRTL) => (
  <Iconify
    icon={customIcon || "eva:arrow-right-fill"}
    sx={{
      width: 20,
      height: 20,
      ...(isRTL && { transform: " scaleX(-1)" }),
    }}
  />
);
