import { ReactElement } from 'react';
import { ControllerRenderProps } from 'react-hook-form';

export interface IFormFieldOption {
  defaultValue?: any;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  render: (item: IFormFieldOption, field: FormFieldType) => ReactElement;
}

export type FormFieldType = ControllerRenderProps<
  {
    [x: string]: any;
  },
  any
>;
