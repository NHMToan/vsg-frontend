import { Card, CardHeader, Link, Stack } from "@mui/material";
// @mui
import { styled } from "@mui/material/styles";
// components
import Iconify from "components/Iconify";

// ----------------------------------------------------------------------

const IconStyle = styled(Iconify)(({ theme }) => ({
  width: 20,
  height: 20,
  marginTop: 1,
  flexShrink: 0,
  marginRight: theme.spacing(2),
}));

// ----------------------------------------------------------------------

interface IProfileSocialInfo {
  profile: any;
}

export default function ProfileSocialInfo({ profile }: IProfileSocialInfo) {
  const {
    facebookLink,
    instagramLink,
    linkedinLink,
    twitterLink,
    portfolioLink,
  } = profile;

  const SOCIALS = [
    {
      name: "Linkedin",
      icon: <IconStyle icon={"eva:linkedin-fill"} color="#006097" />,
      href: linkedinLink,
    },
    {
      name: "Twitter",
      icon: <IconStyle icon={"eva:twitter-fill"} color="#1C9CEA" />,
      href: twitterLink,
    },
    {
      name: "Instagram",
      icon: <IconStyle icon={"ant-design:instagram-filled"} color="#D7336D" />,
      href: instagramLink,
    },
    {
      name: "Facebook",
      icon: <IconStyle icon={"eva:facebook-fill"} color="#1877F2" />,
      href: facebookLink,
    },
    {
      name: "Portfolio",
      icon: <IconStyle icon={"bxs:user-rectangle"} color="#1C9CEA" />,
      href: portfolioLink,
    },
  ];

  return (
    <Card>
      <CardHeader title="Social" />
      <Stack spacing={2} sx={{ p: 3 }}>
        {SOCIALS.map(
          (link) =>
            link.href && (
              <Stack key={link.name} direction="row" alignItems="center">
                {link.icon}
                <Link
                  component="span"
                  variant="body2"
                  color="text.primary"
                  noWrap
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.href}
                  </a>
                </Link>
              </Stack>
            )
        )}
      </Stack>
    </Card>
  );
}
