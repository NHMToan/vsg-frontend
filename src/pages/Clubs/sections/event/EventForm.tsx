import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton, MobileDateTimePicker } from "@mui/lab";
// @mui
import { Box, Button, DialogActions, Stack, TextField } from "@mui/material";
import { ColorSinglePicker } from "components/color-utils";
import { FormProvider, RHFTextField } from "components/hook-form";
import { isBefore } from "date-fns";
import { useCreateEventMutation } from "generated/graphql";
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
    start: range ? new Date(range.start) : new Date(),
    end: range ? new Date(range.end) : new Date(),
    slot: 0,
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
  club: ClubData;
}
export default function EventForm({
  event,
  range,
  onCancel,
  onPostSave,
  club,
}: EventFormProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [createEvent] = useCreateEventMutation();
  const EventSchema = Yup.object().shape({
    title: Yup.string().max(255).required("Title is required"),
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

    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const newEvent: any = {
        title: data.title,
        description: data.description,
        color: data.textColor,
        slot: ~~data.slot,
        start: data.start,
        end: data.end,
        address: data.address,
        addressLink: data.addressLink,
        isInstant: false,
        clubId: club.id,
      };
      if (event.id) {
        enqueueSnackbar("Update success!");
      } else {
        const res = await createEvent({ variables: {createEventInput:newEvent} });

        console.log(res);
        enqueueSnackbar("Create success!");
        console.log(newEvent);
      }

      onPostSave();

      onCancel();
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const values = watch();

  const isDateError = isBefore(new Date(values.end), new Date(values.start));

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} sx={{ p: 3 }}>
        <RHFTextField name="title" label="Title" />

        <RHFTextField
          name="description"
          label="Description"
          multiline
          rows={4}
        />

        <RHFTextField name="slot" label="Slots" type="number" />

        <RHFTextField name="address" label="Address" />
        <RHFTextField name="addressLink" label="Address link" />

        <Controller
          name="start"
          control={control}
          render={({ field }) => (
            <MobileDateTimePicker
              {...field}
              label="Start date"
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
              label="End date"
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

      <DialogActions>
        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={onCancel}>
          Cancel
        </Button>

        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          Add
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}