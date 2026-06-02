"use client";
import MuiStepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import type { StepperProps } from "./stepper.types";

// 瑚琏 Stepper = MUI Stepper 罩瑚琏 API（steps 数组 + activeStep）+ token 皮肤（active/completed 走 var()）。
export function Stepper({ steps, activeStep, className }: StepperProps) {
  return (
    <MuiStepper
      activeStep={activeStep}
      alternativeLabel
      className={className}
      sx={{
        "& .MuiStepIcon-root": { color: "var(--color-border)" },
        "& .MuiStepIcon-root.Mui-active": { color: "var(--color-primary)" },
        "& .MuiStepIcon-root.Mui-completed": { color: "var(--color-primary)" },
        "& .MuiStepIcon-text": { fill: "var(--color-primary-foreground)" },
        "& .MuiStepLabel-label": { color: "var(--color-muted)" },
        "& .MuiStepLabel-label.Mui-active": { color: "var(--color-foreground)" },
        "& .MuiStepLabel-label.Mui-completed": { color: "var(--color-foreground)" },
        "& .MuiStepConnector-line": { borderColor: "var(--color-border)" },
      }}
    >
      {steps.map((s, i) => (
        <Step key={i}>
          <StepLabel>{s.label}</StepLabel>
        </Step>
      ))}
    </MuiStepper>
  );
}
