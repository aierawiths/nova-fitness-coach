import React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  placeholder = "Enter phone number",
  className,
}) => {
  return (
    <div className={cn("phone-input-wrapper", className)}>
      <PhoneInput
        international
        defaultCountry="US"
        value={value}
        onChange={(val) => onChange(val || "")}
        placeholder={placeholder}
        className="h-12 bg-secondary border border-border/50 rounded-md px-3 text-foreground"
      />
    </div>
  );
};

export default PhoneNumberInput;
