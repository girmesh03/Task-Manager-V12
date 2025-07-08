import { memo } from "react";
import PropTypes from "prop-types";
import { Controller } from "react-hook-form";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

const MuiSelectField = memo(
  ({
    name,
    control,
    rules,
    options = [],
    startAdornment,
    label,
    multiple = false,
    ...props
  }) => (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <FormControl
          fullWidth
          margin="normal"
          error={!!error}
          size="small"
          variant="outlined"
        >
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select
            {...field}
            id={name}
            label={label}
            labelId={`${name}-label`}
            required={!!rules?.required}
            startAdornment={startAdornment}
            multiple={multiple} // Ensure this is passed to Select
            displayEmpty
            {...props}
            renderValue={(selected) => {
              const isEmpty = multiple
                ? !selected || selected.length === 0
                : !selected;

              if (isEmpty) {
                return <em>{`Select ${label}`}</em>;
              }

              if (multiple) {
                return (
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: "100%",
                      display: "flex",
                      gap: 0.5,
                      overflowX: "auto",
                      "&::-webkit-scrollbar": { display: "none" },
                    }}
                  >
                    {selected.map((value, index) => {
                      return (
                        <Chip
                          key={index}
                          label={
                            options.find((opt) => opt.label === value)?.label
                          }
                        />
                      );
                    })}
                  </Box>
                );
              }

              return options.find((opt) => opt.label === selected)?.label;
            }}
          >
            {options.map((option) => (
              <MenuItem key={option.id} value={option.label}>
                {option.icon && (
                  <ListItemIcon>
                    <option.icon />
                  </ListItemIcon>
                )}
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{error?.message}</FormHelperText>
        </FormControl>
      )}
    />
  )
);

MuiSelectField.propTypes = {
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  rules: PropTypes.object,
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
    })
  ),
  startAdornment: PropTypes.node,
  multiple: PropTypes.bool,
};

export default MuiSelectField;
