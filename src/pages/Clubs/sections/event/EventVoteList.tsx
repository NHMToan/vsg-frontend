import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DropdownMenu from "components/DropdownMenu";
import Iconify from "components/Iconify";
import PopConfirm from "components/PopConfirm";
import { SimpleSkeleton } from "components/skeleton";
import {
  useGetVotesQuery,
  useNoteVoteMutation,
  useUnVoteEventMutation,
  useVoteChangePaidMutation,
} from "generated/graphql";
import useLocales from "hooks/useLocales";
import { useSnackbar } from "notistack";
import { PAID_STATUS } from "pages/Clubs/consts";
import { ClubEvent, VoteData } from "pages/Clubs/data.t";
import { FC, useState } from "react";
import { fSDateTime } from "utils/formatTime";

interface EventVoteListProps {
  event: ClubEvent;
}

const EventVoteList: FC<EventVoteListProps> = ({ event }) => {
  const { data, loading, refetch } = useGetVotesQuery({
    fetchPolicy: "no-cache",
    skip: !event,
    variables: { status: 1, limit: 100, offset: 0, eventId: event.id },
  });
  const { translate } = useLocales();
  const renderList = () => {
    if (loading)
      return (
        <Stack spacing={3} sx={{ p: 3 }}>
          <SimpleSkeleton />
        </Stack>
      );

    if (!data || !data.getVotes || data?.getVotes?.totalCount === 0)
      return (
        <Typography sx={{ p: 3, color: "text.secondary" }}>
          {translate("club.event.details.tab_vote_info.confirm_list.no_data")}
        </Typography>
      );

    return (
      <Stack spacing={3} sx={{ p: 3 }}>
        {data?.getVotes?.results.map((vote, index) => (
          <Voter
            key={vote.id}
            vote={vote as any}
            index={index}
            isAdmin={event.isAdmin}
            postActions={() => {
              refetch();
            }}
            event={event}
          />
        ))}
      </Stack>
    );
  };
  return (
    <Card>
      <CardHeader
        title={translate("club.event.details.tab_vote_info.confirm_list.title")}
        action={
          <IconButton onClick={() => refetch()}>
            <Iconify icon={"ci:refresh-02"} width={20} height={20} />
          </IconButton>
        }
      />

      {renderList()}
    </Card>
  );
};

interface VoterProps {
  index: any;
  vote: VoteData;
  isAdmin: any;
  event: ClubEvent;
  postActions: () => void;
}

function Voter({ vote, index, isAdmin, postActions, event }: VoterProps) {
  const [onDeleteVote] = useUnVoteEventMutation({ fetchPolicy: "no-cache" });
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openNote, setOpenNote] = useState<boolean>(false);

  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();

  const [onChangePaid] = useVoteChangePaidMutation({ fetchPolicy: "no-cache" });
  const [onNoteVote] = useNoteVoteMutation({ fetchPolicy: "no-cache" });
  const [message, setMessage] = useState<string>("");

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleChangeMessage = (event) => {
    setMessage(event.target.value);
  };

  const onPaidChange = async (status) => {
    try {
      const res = await onChangePaid({
        variables: { voteId: vote.id, payStatus: status },
      });

      if (res?.data?.voteChangePaid?.success) {
        postActions();
      }
    } catch (e) {
      console.log(e);
    }
  };
  const onNote = async () => {
    try {
      const res = await onNoteVote({
        variables: { voteId: vote.id, note: message },
      });

      if (res?.data?.noteVote?.success) {
        postActions();
        setOpenNote(false);
        setMessage("");
      } else {
        enqueueSnackbar("Error", { variant: "error" });
      }
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Avatar
        alt={vote.member.profile.displayName}
        src={vote.member.profile.avatar}
      />

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2">
          {vote.member.profile.displayName} ({vote.value}){" "}
          {vote.paid && PAID_STATUS[vote.paid]}
          {vote.note && (
            <>
              <IconButton onClick={handleClick}>
                <Iconify icon={"ic:baseline-sticky-note-2"} />
              </IconButton>
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
              >
                <Typography sx={{ p: 1 }}> {vote.note}</Typography>
              </Popover>
            </>
          )}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            display: "flex",
            alignItems: "center",
            color: "text.secondary",
          }}
        >
          <Iconify
            icon={"ant-design:calendar-filled"}
            sx={{ width: 16, height: 16, mr: 0.5 }}
          />
          {fSDateTime(vote.createdAt)}
        </Typography>
      </Box>

      {isAdmin && (
        <DropdownMenu
          actions={
            <>
              <MenuItem
                onClick={() => {
                  onPaidChange("cash");
                }}
              >
                <Iconify icon={"bxs:dollar-circle"} />
                {translate(
                  "club.event.details.tab_vote_info.confirm_list.cash"
                )}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onPaidChange("momo");
                }}
              >
                <Iconify icon={"bxs:dollar-circle"} />
                {translate(
                  "club.event.details.tab_vote_info.confirm_list.momo"
                )}
              </MenuItem>

              <MenuItem
                onClick={async () => {
                  onPaidChange("bank");
                }}
              >
                <Iconify icon={"bxs:dollar-circle"} />
                {translate(
                  "club.event.details.tab_vote_info.confirm_list.bank"
                )}
              </MenuItem>

              <MenuItem
                onClick={async () => {
                  onPaidChange("none");
                }}
              >
                <Iconify icon={"fluent:money-off-20-filled"} />
                {translate(
                  "club.event.details.tab_vote_info.confirm_list.btn_unpaid"
                )}
              </MenuItem>
              <Divider sx={{ borderStyle: "dashed" }} />
              <PopConfirm
                open={openNote}
                onClose={() => {
                  setMessage("");
                  setOpenNote(false);
                }}
                title={
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    maxRows={8}
                    value={message}
                    placeholder="Type a note"
                    onChange={handleChangeMessage}
                  />
                }
                actions={
                  <>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={() => {
                        setMessage("");
                        setOpenNote(false);
                      }}
                    >
                      {translate("common.btn.cancel")}
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      disabled={!message}
                      onClick={() => {
                        try {
                          onNote();
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                    >
                      {translate("common.btn.save")}
                    </Button>
                  </>
                }
              >
                <MenuItem
                  onClick={() => {
                    setOpenNote(true);
                  }}
                >
                  {translate("common.btn.note")}
                </MenuItem>
              </PopConfirm>
              <PopConfirm
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                title={
                  <CardHeader
                    title={translate(
                      "club.event.details.tab_vote_info.confirm_list.delete.confirmation"
                    )}
                    subheader={translate(
                      "club.event.details.tab_vote_info.confirm_list.delete.sub_confirmation"
                    )}
                  />
                }
                actions={
                  <>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={() => setOpenDelete(false)}
                    >
                      {translate("common.btn.cancel")}
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={async () => {
                        try {
                          const deleteVoteRes = await onDeleteVote({
                            variables: {
                              voteId: vote.id,
                              eventId: event.id,
                              eventSlot: event.slot,
                            },
                          });
                          if (deleteVoteRes?.data?.unVoteEvent?.success) {
                            enqueueSnackbar(
                              translate(
                                "club.event.details.tab_vote_info.confirm_list.delete.success"
                              )
                            );
                            postActions();
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                    >
                      {translate("common.btn.delete")}
                    </Button>
                  </>
                }
              >
                <MenuItem
                  sx={{ color: "error.main" }}
                  onClick={() => {
                    setOpenDelete(true);
                  }}
                >
                  {translate("common.btn.delete")}
                </MenuItem>
              </PopConfirm>
            </>
          }
        />
      )}
    </Stack>
  );
}

export default EventVoteList;
