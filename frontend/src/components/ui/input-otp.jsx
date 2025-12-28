import * as React from "react";

import { cn } from "@/lib/utils";

const InputOTP = React.forwardRef(({ className, containerClassName, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-2 has-disabled:opacity-50", containerClassName)} {...props}>
    {/* Placeholder: integrate OTPInput component if available */}
    <input className={cn("disabled:cursor-not-allowed", className)} />
  </div>
));
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef(({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center", className)} {...props} />);
InputOTPGroup.displayName = "InputOTPGroup";

export { InputOTP, InputOTPGroup };
