import React from 'react';
import { Button, ButtonProps } from '@material-ui/core';
import { CloudUpload } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  input: {
    display: 'none',
  },
});

export type FileInputProps = {
  id: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
} & Omit<ButtonProps, 'ref' | 'id' | 'onChange'>;

export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>((props, ref) => {
  const { id, onChange, ...rest } = props;
  const classes = useStyles();
  return (
    <>
      <label htmlFor={id}>
        <input onChange={onChange} ref={ref} className={classes.input} id={id} type="file" />
        <Button component="span" startIcon={<CloudUpload />} {...rest} />
      </label>
    </>
  );
});
