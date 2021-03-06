import Skeleton from "@mui/material/Skeleton";
import Typography, { TypographyProps } from "@mui/material/Typography";

const variants = [
  "h1",
  "h3",
  "body1",
  "caption",
] as readonly TypographyProps["variant"][];

function TypographyDemo(props: { loading?: boolean }) {
  const { loading = false } = props;

  return (
    <div>
      {variants.map((variant) => (
        <Typography component="div" key={variant} variant={variant}>
          {loading ? <Skeleton /> : variant}
        </Typography>
      ))}
    </div>
  );
}

export default function SimpleSkeleton() {
  return <TypographyDemo loading />;
}
