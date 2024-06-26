import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogTitle,
  Stack,
  capitalize,
} from "@mui/material";
import { FormProvider, RHFRadioGroup, RHFSelect } from "components/hook-form";
import useLocales from "hooks/useLocales";
import { ClubEvent } from "pages/Clubs/data.t";
import { FC } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
interface VotePopConfirmProps {
  event?: ClubEvent;
  isOpen: boolean;
  onClose: () => void;
  onPostSave: (params: any) => void;
  isWaiting?: boolean;
  currentVoteCount?: number;
  isSubmitting: boolean;
}
const VotePopConfirm: FC<VotePopConfirmProps> = ({
  event,
  onClose,
  isOpen,
  onPostSave,
  isWaiting,
  currentVoteCount,
  isSubmitting,
}) => {
  const defaultValues: any = {
    value: 1,
    type: event?.groups[0],
  };
  const EventSchema = Yup.object().shape({
    value: Yup.number().required("Slot is required"),
    type:
      event.type === "2_activity" && Yup.string().required("Type is required"),
  });
  const { translate } = useLocales();
  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues,
  });

  const { reset, handleSubmit } = methods;
  const onCancel = () => {
    onClose();
    reset();
  };

  const onSubmit = async (data) => {
    try {
      const params: any = {
        value: ~~data.value,
        type: data.type,
      };

      onPostSave(params);

      onClose();
      reset();
    } catch (error) {
      console.error(error);
    }
  };
  const maxVote = currentVoteCount
    ? event.maxVote - currentVoteCount
    : event.maxVote;
  const array = new Array(maxVote).fill(0);

  const renderWarning = () => {
    if (currentVoteCount > 0) {
      return (
        <Stack sx={{ p: 3 }}>
          <Card
            sx={{
              px: 2,
              py: 1,
              boxShadow: 0,
              color: (theme: any) => theme.palette["warning"].darker,
              bgcolor: (theme: any) => theme.palette["warning"].lighter,
              width: "100%",
              borderRadius: 1,
            }}
          >
            You have already used <b>{currentVoteCount}</b>, have{" "}
            <b>
              {event.maxVote - currentVoteCount < 0
                ? 0
                : event.maxVote - currentVoteCount}
            </b>{" "}
            left!
          </Card>
        </Stack>
      );
    }
  };

  return (
    <Dialog open={isOpen} onClose={onCancel} maxWidth="xs">
      <DialogTitle>
        {isWaiting
          ? translate("club.event.details.vote.vote_waiting_title")
          : translate("club.event.details.vote.vote_confirmed_title")}
      </DialogTitle>
      {renderWarning()}
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        {maxVote > 0 && (
          <Stack spacing={3} sx={{ p: 3 }}>
            {event.type === "2_activity" && (
              <RHFRadioGroup
                name="type"
                options={event.groups.map((type) => ({
                  label: capitalize(type),
                  value: type,
                }))}
              />
            )}

            <RHFSelect
              name="value"
              label="Slots"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: { md: 160 } }}
            >
              {array.map((item, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </RHFSelect>
          </Stack>
        )}

        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />

          <Button variant="outlined" color="inherit" onClick={onCancel}>
            {translate("common.btn.cancel")}
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            disabled={!maxVote}
          >
            {translate("common.btn.vote")}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default VotePopConfirm;
