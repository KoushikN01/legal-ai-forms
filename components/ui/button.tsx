import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", ...props }, ref) => {
  const baseStyles =
    "px-4 py-2 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
  const variantStyles = {
    default: "bg-primary text-white hover:bg-primary-dark",
    outline: "border border-border text-text hover:bg-surface",
  }

  return <button ref={ref} className={`${baseStyles} ${variantStyles[variant]} ${className || ""}`} {...props} />
})
Button.displayName = "Button"

export { Button }
