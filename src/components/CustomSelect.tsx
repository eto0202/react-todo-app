import type { Priority } from "../types";
import "./CustomSelect.css";
import * as Select from "@radix-ui/react-select";

type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

type CustomSelectProps = {
  options: Option[];
  value: string;
  onChange: (value: Priority) => void;
  placeholder?: string;
};

export function CustomSelect({ options, value, onChange, placeholder }: CustomSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="custom_select_trigger">
        <Select.Value placeholder={placeholder}></Select.Value>
        <Select.Icon className="select_icon"></Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="custom_select_content" position="popper">
          <Select.ScrollUpButton></Select.ScrollUpButton>

          <Select.Viewport className="custom_select_content_list">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={`custom_select_item ${option.disabled ? "disabled" : ""}`}
              >
                <Select.ItemIndicator></Select.ItemIndicator>
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
