import React from 'react';
import DatePicker from "react-datepicker";
import { asField } from 'informed';
import "react-datepicker/dist/react-datepicker.css";

export const DateInput = asField(({
    fieldState: {value},
    fieldApi: {setTouched, setValue},
    ...props
  }) => <DatePicker onFocus={() => setTouched(true)} onChange={date => setValue(date)}
                    selected={value} openToDate={value} {...props} />
)