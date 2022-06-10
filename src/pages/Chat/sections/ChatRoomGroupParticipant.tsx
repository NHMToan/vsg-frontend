import {
  Avatar,
  Box,
  Button,
  Collapse,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
// @mui
import { styled } from "@mui/material/styles";
import { IProfile } from "types/user";
import BadgeStatus from "../../../components/BadgeStatus";
// components
import Iconify from "../../../components/Iconify";
import Scrollbar from "../../../components/Scrollbar";
//
import ChatRoomPopup from "./ChatRoomPopup";

// ----------------------------------------------------------------------

const HEIGHT = 64;

const CollapseButtonStyle = styled(Button)(({ theme }) => ({
  ...theme.typography.overline,
  height: 40,
  borderRadius: 0,
  padding: theme.spacing(1, 2),
  justifyContent: "space-between",
  color: theme.palette.text.disabled,
}));

// ----------------------------------------------------------------------
interface ChatRoomGroupParticipantProps {
  participants: IProfile[];
  selectUserId: string;
  onShowPopupUserInfo: (userId: string) => void;
  isCollapse?: boolean;
  onCollapse: () => void;
}
export default function ChatRoomGroupParticipant({
  participants,
  selectUserId,
  onShowPopupUserInfo,
  isCollapse,
  onCollapse,
}: ChatRoomGroupParticipantProps) {
  return (
    <>
      <CollapseButtonStyle
        fullWidth
        disableRipple
        color="inherit"
        onClick={onCollapse}
        endIcon={
          <Iconify
            icon={
              isCollapse
                ? "eva:arrow-ios-downward-fill"
                : "eva:arrow-ios-forward-fill"
            }
            width={16}
            height={16}
          />
        }
      >
        In room ({participants.length})
      </CollapseButtonStyle>

      <Box sx={{ height: isCollapse ? HEIGHT * 4 : 0 }}>
        <Scrollbar>
          <Collapse
            in={isCollapse}
            sx={{ height: isCollapse ? HEIGHT * 4 : 0 }}
          >
            <List disablePadding>
              {participants.map((participant) => (
                <Participant
                  key={participant.id}
                  participant={participant}
                  isOpen={selectUserId === participant.id}
                  onShowPopup={() => onShowPopupUserInfo(participant.id)}
                  onClosePopup={() => onShowPopupUserInfo(null)}
                />
              ))}
            </List>
          </Collapse>
        </Scrollbar>
      </Box>
    </>
  );
}

// ----------------------------------------------------------------------

interface ParticipantProps {
  participant: IProfile;
  isOpen: boolean;
  onClosePopup: () => void;
  onShowPopup: () => void;
}
function Participant({
  participant,
  isOpen,
  onClosePopup,
  onShowPopup,
}: ParticipantProps) {
  const { displayName, avatar, position } = participant;

  return (
    <>
      <ListItemButton onClick={onShowPopup} sx={{ height: HEIGHT, px: 2.5 }}>
        <ListItemAvatar>
          <Box sx={{ position: "relative", width: 40, height: 40 }}>
            <Avatar alt={displayName} src={avatar} />
            <BadgeStatus
              status="online"
              sx={{ right: 0, bottom: 0, position: "absolute" }}
            />
          </Box>
        </ListItemAvatar>
        <ListItemText
          primary={displayName}
          secondary={position}
          primaryTypographyProps={{ variant: "subtitle2", noWrap: true }}
          secondaryTypographyProps={{ noWrap: true }}
        />
      </ListItemButton>
      <ChatRoomPopup
        participant={participant}
        isOpen={isOpen}
        onClose={onClosePopup}
      />
    </>
  );
}
