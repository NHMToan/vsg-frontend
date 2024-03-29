import { Box, Divider, MenuItem, Stack, Typography } from "@mui/material";
// @mui
import { alpha } from "@mui/material/styles";
import useLocales from "hooks/useLocales";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { PATH_AUTH, PATH_DASHBOARD } from "Router/paths";
import { IconButtonAnimate } from "../../../components/animate";
import MenuPopover from "../../../components/MenuPopover";
// components
import MyAvatar from "../../../components/MyAvatar";
// hooks
import useAuth from "../../../hooks/useAuth";
import useIsMountedRef from "../../../hooks/useIsMountedRef";
// routes

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { translate } = useLocales();
  const isMountedRef = useIsMountedRef();

  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate(PATH_AUTH.login, { replace: true });

      if (isMountedRef.current) {
        handleClose();
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Unable to logout!", { variant: "error" });
    }
  };
  const MENU_OPTIONS = [
    {
      label: "account_menu.home",
      linkTo: "/",
    },
    {
      label: "account_menu.profile",
      linkTo: PATH_DASHBOARD.user.profile(user?.profile.id),
    },
    {
      label: "account_menu.settings",
      linkTo: PATH_DASHBOARD.user.account,
    },
  ];
  return (
    <>
      <IconButtonAnimate
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            "&:before": {
              zIndex: 1,
              content: "''",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              position: "absolute",
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <MyAvatar />
      </IconButtonAnimate>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          p: 0,
          mt: 1.5,
          ml: 0.75,
          "& .MuiMenuItem-root": {
            typography: "body2",
            borderRadius: 0.75,
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user.displayName}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: "dashed" }} />

        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem
              key={option.label}
              to={option.linkTo}
              component={RouterLink}
              onClick={handleClose}
            >
              {translate(option.label)}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: "dashed" }} />

        <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
          {translate("account_menu.logout")}
        </MenuItem>
      </MenuPopover>
    </>
  );
}
