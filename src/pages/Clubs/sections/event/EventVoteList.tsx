import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Popover,
  Stack,
  SxProps,
  TextField,
  Typography,
  capitalize,
} from "@mui/material";
import Avatar from "components/Avatar";
import DropdownMenu, { DropdownMenuRef } from "components/DropdownMenu";
import Iconify from "components/Iconify";
import LabelContainer from "components/LabelContainer";
import PopConfirm from "components/PopConfirm";
import { SimpleSkeleton } from "components/skeleton";
import {
  useGetVotesQuery,
  useNoteVoteMutation,
  useUnVoteEventMutation,
  useVoteChangePaidMutation,
} from "generated/graphql";
import useAuth from "hooks/useAuth";
import useLocales from "hooks/useLocales";
import { useSnackbar } from "notistack";
import SendMessageButton from "pages/Chat/components/SendMessageModal";
import { PAID_STATUS } from "pages/Clubs/consts";
import { ClubEvent, VoteData } from "pages/Clubs/data.t";
import { FC, useRef, useState } from "react";
import { fSDateTime } from "utils/formatTime";
import { searchVietnameseName } from "utils/search";
import ChangeVoteModal from "./ChangeVoteModal";
interface EventVoteListProps {
  event: ClubEvent;
  refetchStats?: () => void;
  sx?: SxProps;
  compact?: boolean;
}
function applySortFilter({ tableData, filterName }) {
  if (filterName) {
    tableData = tableData.filter((item) =>
      searchVietnameseName(item.member.profile.displayName, filterName)
    );
  }
  return tableData;
}
const EventVoteList: FC<EventVoteListProps> = ({
  event,
  refetchStats,
  sx,
  compact,
}) => {
  const { data, loading, refetch } = useGetVotesQuery({
    fetchPolicy: "no-cache",
    skip: !event,
    variables: { status: 1, limit: 100, offset: 0, eventId: event.id },
  });
  const [filterName, setFilterName] = useState("");
  const { translate } = useLocales();

  const dataFiltered = applySortFilter({
    tableData: data?.getVotes?.results || [],
    filterName,
  });

  const renderList = () => {
    if (loading)
      return (
        <Stack spacing={3} sx={{ p: 3 }}>
          <SimpleSkeleton />
        </Stack>
      );

    if (dataFiltered.length === 0)
      return (
        <Typography sx={{ p: 3, color: "text.secondary" }}>
          {translate("club.event.details.tab_vote_info.confirm_list.no_data")}
        </Typography>
      );
    if (event?.type === "2_activity") {
      return (
        <Stack spacing={3} sx={{ p: 3, ...sx }}>
          {event.groups.map((type) => {
            return (
              <LabelContainer key={type} label={capitalize(type)}>
                <Stack spacing={3} sx={{ p: 1 }}>
                  {dataFiltered
                    .filter((item) => item.type === type)
                    .map((vote, index) => (
                      <Voter
                        key={vote.id}
                        vote={vote as any}
                        index={index}
                        isAdmin={event.isAdmin}
                        postActions={() => {
                          refetch();
                          if (refetchStats) refetchStats();
                        }}
                        event={event}
                      />
                    ))}
                </Stack>
              </LabelContainer>
            );
          })}
        </Stack>
      );
    }
    return (
      <Stack spacing={3} sx={{ p: 3, ...sx }}>
        {dataFiltered.map((vote, index) => (
          <Voter
            key={vote.id}
            vote={vote as any}
            index={index}
            isAdmin={event.isAdmin}
            postActions={() => {
              refetch();
              if (refetchStats) refetchStats();
            }}
            event={event}
          />
        ))}
      </Stack>
    );
  };
  if (compact)
    return (
      <Card>
        <Stack
          spacing={2}
          direction={{ xs: "column", sm: "row" }}
          sx={{ pt: 2, pb: 0, px: 3 }}
        >
          <TextField
            fullWidth
            placeholder="Search name..."
            onChange={(event) => setFilterName(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify
                    icon={"eva:search-fill"}
                    sx={{ color: "text.disabled", width: 20, height: 20 }}
                  />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        {renderList()}
      </Card>
    );
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
      <Stack
        spacing={2}
        direction={{ xs: "column", sm: "row" }}
        sx={{ pt: 2, pb: 0, px: 3 }}
      >
        <TextField
          fullWidth
          placeholder="Search name..."
          onChange={(event) => setFilterName(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  icon={"eva:search-fill"}
                  sx={{ color: "text.disabled", width: 20, height: 20 }}
                />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
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
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();

  const [onChangePaid] = useVoteChangePaidMutation({ fetchPolicy: "no-cache" });
  const [onNoteVote] = useNoteVoteMutation({ fetchPolicy: "no-cache" });
  const [message, setMessage] = useState<string>("");

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const dropdownRef = useRef<DropdownMenuRef>();
  const current = new Date();

  const isEventClose = event.end < current.toISOString() || event.status === 2;

  const [isFormChangeOpen, setIsFormChangeOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

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
        dropdownRef?.current?.close();
        postActions();
      }
    } catch (e) {
      console.log(e);
    }
  };
  const onNote = async () => {
    try {
      setSubmitting(true);
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
      setSubmitting(false);
    } catch (e) {
      console.log(e);
    }
  };
  const renderName = () => {
    if (vote.member.isAdvanced)
      return (
        <span style={{ color: "rgb(255, 206, 49)" }}>
          {vote.member.profile.displayName} ({vote.value})
        </span>
      );
    return (
      <span>
        {vote.member.profile.displayName} ({vote.value})
      </span>
    );
  };
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <ChangeVoteModal
        isOpen={isFormChangeOpen}
        onClose={() => {
          setIsFormChangeOpen(false);
        }}
        voteInfo={vote}
        postActions={() => {
          postActions();
        }}
        event={event}
      />
      <Avatar
        alt={vote.member.profile.displayName}
        src={vote.member.profile.avatar}
        clickable
      />

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2">
          {renderName()} {vote.paid && PAID_STATUS[vote.paid]}
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
      {!isEventClose &&
        !isAdmin &&
        vote.member.profile.id === user.profile.id && (
          <>
            <Button
              variant="contained"
              color="info"
              onClick={() => {
                setIsFormChangeOpen(true);
              }}
            >
              <Iconify icon="mingcute:pencil-fill" />
            </Button>
          </>
        )}

      {isAdmin && (
        <DropdownMenu
          ref={dropdownRef}
          actions={
            <>
              {isAdmin && (
                <MenuItem
                  onClick={() => {
                    onPaidChange("cash");
                  }}
                >
                  <Iconify icon={"bxs:dollar-circle"} color="#54D62C" />
                  {translate(
                    "club.event.details.tab_vote_info.confirm_list.cash"
                  )}
                </MenuItem>
              )}
              {isAdmin && (
                <MenuItem
                  onClick={() => {
                    onPaidChange("momo");
                  }}
                >
                  <Iconify icon={"bxs:dollar-circle"} color="#ad006c" />
                  {translate(
                    "club.event.details.tab_vote_info.confirm_list.momo"
                  )}
                </MenuItem>
              )}

              {isAdmin && (
                <MenuItem
                  onClick={async () => {
                    onPaidChange("bank");
                  }}
                >
                  <Iconify icon={"bxs:dollar-circle"} color="#826AF9" />
                  {translate(
                    "club.event.details.tab_vote_info.confirm_list.bank"
                  )}
                </MenuItem>
              )}

              {isAdmin && (
                <MenuItem
                  onClick={async () => {
                    onPaidChange("prepaid");
                  }}
                >
                  <Iconify icon={"bxs:dollar-circle"} color="#1890FF" />
                  {translate(
                    "club.event.details.tab_vote_info.confirm_list.prepaid"
                  )}
                </MenuItem>
              )}
              {isAdmin && (
                <MenuItem
                  onClick={async () => {
                    onPaidChange("");
                  }}
                >
                  <Iconify icon={"mdi:dollar-off"} color="#f50" />
                  Remove tag
                </MenuItem>
              )}

              {isAdmin && <Divider sx={{ borderStyle: "dashed" }} />}
              {isAdmin && (
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
                      <LoadingButton
                        variant="contained"
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
                      </LoadingButton>
                    </>
                  }
                >
                  <MenuItem
                    onClick={() => {
                      setOpenNote(true);
                      setMessage(vote.note || "");
                    }}
                  >
                    {translate("common.btn.note")}
                  </MenuItem>
                </PopConfirm>
              )}
              {vote.member.profile.id !== user.profile.id && (
                <SendMessageButton to={vote.member.profile} />
              )}

              {vote.member.profile.id === user.profile.id && (
                <MenuItem
                  onClick={() => {
                    setIsFormChangeOpen(true);
                  }}
                >
                  {translate("common.btn.change")}
                </MenuItem>
              )}

              {isAdmin && (
                <PopConfirm
                  open={openDelete}
                  onClose={() => setOpenDelete(false)}
                  title={
                    <CardHeader
                      title={translate(
                        /*i18n*/ "club.event.details.tab_vote_info.confirm_list.delete.confirmation"
                      )}
                      subheader={translate(
                        /*i18n*/ "club.event.details.tab_vote_info.confirm_list.delete.sub_confirmation"
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
                                isSelf: false,
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
              )}
            </>
          }
        />
      )}
    </Stack>
  );
}

export default EventVoteList;
