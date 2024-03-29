import { Typography } from "@mui/material";
// @mui
import { styled, SxProps } from "@mui/material/styles";
//
import Image from "./Image";

// ----------------------------------------------------------------------

const RootStyle = styled("div")(({ theme }) => ({
  height: "100%",
  display: "flex",
  textAlign: "center",
  alignItems: "center",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(8, 2),
}));

// ----------------------------------------------------------------------

interface EmptyContentProps {
  title?: string;
  img?: string;
  description?: string;
  sx?: SxProps;
}
export default function EmptyContent({
  title,
  description,
  img,
  ...other
}: EmptyContentProps) {
  return (
    <RootStyle {...other}>
      <Image
        disabledEffect
        visibleByDefault
        alt="empty content"
        src={img || "/assets/illustrations/illustration_empty_mail.svg"}
        sx={{ height: 240, mb: 3 }}
      />

      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      {description && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {description}
        </Typography>
      )}
    </RootStyle>
  );
}
