import { useState, useRef, useEffect } from "react";

export function OTPInput({ length = 6, onComplete }) {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = Array(length)
      .fill(null)
      .map((_, i) => inputRefs.current[i] || React.createRef());
  }, [length]);

  const handleChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if available
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Call onComplete when all digits are filled
    const otpValue = newOtp.join("");
    if (otpValue.length === length) {
      onComplete(otpValue);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);

      // Move focus to previous input if available
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedArray = pastedData.slice(0, length).split("");

    if (pastedArray.every((char) => !isNaN(char))) {
      const newOtp = [...otp];
      pastedArray.forEach((value, index) => {
        if (index < length) {
          newOtp[index] = value;
        }
      });
      setOtp(newOtp);
      onComplete(newOtp.join(""));
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {otp.map((data, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={data}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-xl border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-700"
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}
