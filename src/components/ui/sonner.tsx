import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-900/90 group-[.toaster]:backdrop-blur-2xl group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-violet-500/20 group-[.toaster]:shadow-[0_8px_32px_rgba(139,92,246,0.15)]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-violet-600 group-[.toast]:text-white group-[.toast]:hover:bg-violet-500 group-[.toast]:border-0 group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:border-emerald-500/30 group-[.toaster]:shadow-[0_8px_32px_rgba(52,211,153,0.12)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
