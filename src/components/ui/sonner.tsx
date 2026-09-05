import { Toaster as Sonner } from "sonner";
import { useThemeStore } from "@/store/useThemeStore";

export const Toaster = () => {
  const { theme } = useThemeStore();
  return (
    <Sonner
      theme={theme as 'light' | 'dark'}
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        style: { borderRadius: '12px' },
      }}
    />
  );
};
