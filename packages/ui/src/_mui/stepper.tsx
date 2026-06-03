"use client";
import MuiStepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import type { StepIconProps } from "@mui/material/StepIcon";
import type { StepperProps } from "./stepper.types";

// 自绘步骤图标：MUI 默认完成态用 CheckCircle，其对勾是「负空间镂空」露出页面底色——
// 暗黑模式下底色发黑，对勾就成了黑色（无法用 CSS 给镂空上色）。故自绘：填充圆 + 独立描边对勾，
// active/completed 圆走 --color-primary、对勾/数字走 --color-primary-foreground，未达成走 border/muted。
function HulianStepIcon({ active, completed, icon }: StepIconProps) {
  const filled = active || completed;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 24,
        height: 24,
        borderRadius: "50%",
        fontSize: 12,
        fontWeight: 600,
        flexShrink: 0,
        background: filled ? "var(--color-primary)" : "transparent",
        color: filled ? "var(--color-primary-foreground)" : "var(--color-muted)",
        border: filled ? "none" : "1px solid var(--color-border)",
      }}
    >
      {completed ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        icon
      )}
    </span>
  );
}

// 瑚琏 Stepper = MUI Stepper 罩瑚琏 API（steps 数组 + activeStep）+ token 皮肤（图标/标签/连线走 var()）。
export function Stepper({ steps, activeStep, className }: StepperProps) {
  return (
    <MuiStepper
      activeStep={activeStep}
      alternativeLabel
      className={className}
      sx={{
        "& .MuiStepLabel-label": { color: "var(--color-muted)" },
        "& .MuiStepLabel-label.Mui-active": { color: "var(--color-foreground)" },
        "& .MuiStepLabel-label.Mui-completed": { color: "var(--color-foreground)" },
        "& .MuiStepConnector-line": { borderColor: "var(--color-border)" },
        // 进度已走过(completed)/通往当前步(active)的连接线点亮为主色，与图标完成态呼应。
        "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
          borderColor: "var(--color-primary)",
        },
        "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
          borderColor: "var(--color-primary)",
        },
      }}
    >
      {steps.map((s, i) => (
        <Step key={i}>
          <StepLabel slots={{ stepIcon: HulianStepIcon }}>{s.label}</StepLabel>
        </Step>
      ))}
    </MuiStepper>
  );
}
