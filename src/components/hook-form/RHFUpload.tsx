// @mui
import { FormHelperText } from "@mui/material";
import { UploadAvatarProps } from "components/upload/UploadAvatar";
import { UploadMultiFileProps } from "components/upload/UploadMultiFile";
import { UploadSingleFileProps } from "components/upload/UploadSingleFile";
// form
import { Controller, useFormContext } from "react-hook-form";
// type
import { UploadAvatar, UploadMultiFile, UploadSingleFile } from "../upload";

// ----------------------------------------------------------------------

interface RHFUploadAvatarProps extends Omit<UploadAvatarProps, "file"> {
  name?: string;
}
export function RHFUploadAvatar({ name, ...other }: RHFUploadAvatarProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const checkError = !!error && !field.value;

        return (
          <div>
            <UploadAvatar error={checkError} {...other} file={field.value} />
            {checkError && (
              <FormHelperText error sx={{ px: 2, textAlign: "center" }}>
                {error.message}
              </FormHelperText>
            )}
          </div>
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------

interface RHFUploadSingleFileProps
  extends Omit<UploadSingleFileProps, "accept"> {
  name?: string;
  accept?: any;
}
export function RHFUploadSingleFile({
  name,
  ...other
}: RHFUploadSingleFileProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const checkError = !!error && !field.value;

        return (
          <UploadSingleFile
            accept={"image/*" as any}
            file={field.value}
            error={checkError}
            helperText={
              checkError && (
                <FormHelperText error sx={{ px: 2 }}>
                  {error.message}
                </FormHelperText>
              )
            }
            {...other}
          />
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------

interface RHFUploadMultiFileProps extends UploadMultiFileProps {
  name?: string;
}
export function RHFUploadMultiFile({
  name,
  ...other
}: RHFUploadMultiFileProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const checkError = !!error && field.value?.length === 0;

        return (
          <UploadMultiFile
            accept={"image/*" as any}
            files={field.value}
            error={checkError}
            helperText={
              checkError && (
                <FormHelperText error sx={{ px: 2 }}>
                  {error?.message}
                </FormHelperText>
              )
            }
            {...other}
          />
        );
      }}
    />
  );
}
