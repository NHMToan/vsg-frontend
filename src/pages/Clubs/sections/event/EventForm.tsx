import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton, MobileDateTimePicker } from "@mui/lab";
// @mui
import {
  Box,
  Button,
  DialogActions,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ColorSinglePicker } from "components/color-utils";
import { FormProvider, RHFTextField } from "components/hook-form";
import { isBefore } from "date-fns";
import {
  useCreateEventMutation,
  useUpdateEventMutation,
} from "generated/graphql";
import useLocales from "hooks/useLocales";
import merge from "lodash/merge";
import { useSnackbar } from "notistack";
import { ClubData } from "pages/Clubs/data.t";
// form
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
// ----------------------------------------------------------------------

const COLOR_OPTIONS = [
  "#00AB55", // theme.palette.primary.main,
  "#1890FF", // theme.palette.info.main,
  "#54D62C", // theme.palette.success.main,
  "#FFC107", // theme.palette.warning.main,
  "#FF4842", // theme.palette.error.main
  "#04297A", // theme.palette.info.darker
  "#7A0C2E", // theme.palette.error.darker
];

const getInitialValues = (event, range) => {
  const _event = {
    title: "",
    description: "",
    address: "",
    addressLink: "",
    textColor: "#1890FF",
    start: "",
    end: "",
    time: range ? new Date(range.start) : new Date(),
    slot: 0,
    maxVote: 0,
    price: 0,
  };

  if (event || range) {
    return merge({}, _event, event);
  }

  return _event;
};

// ----------------------------------------------------------------------

interface EventFormProps {
  event?: any;
  range?: any;
  onCancel: () => void;
  onPostSave: () => void;
  club?: ClubData;
}
export default function EventForm({
  event,
  range,
  onCancel,
  onPostSave,
  club,
}: EventFormProps) {
  const [onUpdate] = useUpdateEventMutation({ fetchPolicy: "no-cache" });
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const [createEvent] = useCreateEventMutation();
  const EventSchema = Yup.object().shape({
    title: Yup.string().max(255).required("Title is required"),
    start: Yup.date().required("Start is required"),
    end: Yup.date().required("End is required"),
    time: Yup.date().required("Time is required"),
    maxVote: Yup.string().required("Max vote is required"),
    slot: Yup.string().required("Slot is required"),
    description: Yup.string().max(5000),
  });

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues: getInitialValues(event, range),
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const newEvent: any = {
        title: data.title,
        description: data.description,
        color: data.textColor,
        slot: ~~data.slot,
        maxVote: ~~data.maxVote,
        start: data.start,
        time: data.time,
        end: data.end,
        address: data.address,
        addressLink: data.addressLink,
        isInstant: false,
        clubId: club?.id,
        price: data?.price || 0,
      };

      if (!club) delete newEvent.clubId;

      if (event?.id) {
        delete newEvent.isInstant;
        const updateRes = await onUpdate({
          variables: { updateEventInput: newEvent, id: event.id },
        });
        if (updateRes?.data?.updateEvent?.success) {
          enqueueSnackbar(translate("club.event.form.update_success"));
          onPostSave();
          onCancel();
          reset();
        } else {
          enqueueSnackbar(
            updateRes?.data?.updateEvent?.message || "Internal error",
            { variant: "error" }
          );
        }
      } else {
        const createRes = await createEvent({
          variables: { createEventInput: newEvent },
        });
        if (createRes?.data?.createEvent?.success) {
          enqueueSnackbar(translate("club.event.form.create_success"));
          onPostSave();
          onCancel();
          reset();
        } else {
          enqueueSnackbar(
            createRes?.data?.createEvent?.message || "Internal error",
            { variant: "error" }
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const values = watch();

  const isDateError = isBefore(new Date(values.end), new Date(values.start));

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container>
        <Grid item xs={12} md={6}>
          <Stack spacing={3} sx={{ p: 3 }}>
            <Typography variant="overline" sx={{ color: "text.secondary" }}>
              {translate("club.event.form.info_section")}
            </Typography>

            <RHFTextField
              name="title"
              label={translate("club.event.form.name")}
            />

            <RHFTextField
              name="slot"
              label={translate("club.event.form.slot")}
              type="number"
            />

            <RHFTextField
              name="maxVote"
              label={translate("club.event.form.max_vote")}
              type="number"
            />

            <Controller
              name="start"
              control={control}
              render={({ field }) => (
                <MobileDateTimePicker
                  {...field}
                  label={translate("club.event.form.start_date")}
                  inputFormat="dd/MM/yyyy hh:mm a"
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              )}
            />

            <Controller
              name="end"
              control={control}
              render={({ field }) => (
                <MobileDateTimePicker
                  {...field}
                  label={translate("club.event.form.end_date")}
                  inputFormat="dd/MM/yyyy hh:mm a"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!isDateError}
                      helperText={
                        isDateError && "End date must be later than start date"
                      }
                    />
                  )}
                />
              )}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={3} sx={{ p: 3 }}>
            <Typography variant="overline" sx={{ color: "text.secondary" }}>
              {translate("club.event.form.more_section")}
            </Typography>
            <RHFTextField
              name="description"
              label={translate("club.event.form.description")}
              multiline
              rows={4}
            />
            <RHFTextField
              name="price"
              label={translate("club.event.form.price")}
              placeholder="0.00"
              value={getValues("price") === 0 ? "" : getValues("price")}
              onChange={(event) =>
                setValue("price", Number(event.target.value))
              }
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">VND</InputAdornment>
                ),
                type: "number",
              }}
            />

            <Controller
              name="time"
              control={control}
              render={({ field }) => (
                <MobileDateTimePicker
                  {...field}
                  label={translate("club.event.form.event_time")}
                  inputFormat="dd/MM/yyyy hh:mm a"
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              )}
            />

            <RHFTextField
              name="address"
              label={translate("club.event.form.address")}
            />

            <Controller
              name="textColor"
              control={control}
              render={({ field }) => (
                <ColorSinglePicker
                  value={field.value}
                  onChange={field.onChange}
                  colors={COLOR_OPTIONS}
                />
              )}
            />
          </Stack>
        </Grid>
      </Grid>

      <DialogActions>
        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={onCancel}>
          {translate("common.btn.cancel")}
        </Button>

        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          {event
            ? translate("common.btn.save_changes")
            : translate("common.btn.add")}
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}
