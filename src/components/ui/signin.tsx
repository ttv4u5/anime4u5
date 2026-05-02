import { forwardRef, useCallback } from "react";
import { type VariantProps } from "class-variance-authority";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth.ts";
import { Button, buttonVariants } from "@/components/ui/button.tsx";
import { supabase } from "@/lib/supabase"; // Sila pastikan fail ini wujud di src/lib/supabase.ts

export interface SignInButtonProps
  extends
    Omit<React.ComponentProps<"button">, "onClick">,
    VariantProps<typeof buttonVariants> {
  /**
   * Custom onClick handler yang berjalan sebelum pengesahan
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * Paparkan ikon atau tidak
   */
  showIcon?: boolean;
  /**
   * Tulisan butang semasa belum login
   */
  signInText?: string;
  /**
   * Tulisan butang semasa sudah login (Super Admin/User)
   */
  signOutText?: string;
  /**
   * Tulisan semasa proses loading
   */
  loadingText?: string;
  asChild?: boolean;
}

/**
 * Komponen Butang Sign In/Out yang telah diintegrasi dengan Supabase Google Auth
 */
export const SignInButton = forwardRef<HTMLButtonElement, SignInButtonProps>(
  (
    {
      onClick,
      disabled,
      showIcon = true,
      signInText = "Sign In",
      signOutText = "Sign Out",
      loadingText,
      className,
      variant,
      size,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    // isAuthenticated dan isLoading diambil dari hook sedia ada awak
    const { isAuthenticated, removeUser, isLoading } = useAuth();

    const handleClick = useCallback(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        // Jalankan onClick custom jika ada
        onClick?.(event);

        try {
          if (isAuthenticated) {
            // PROSES LOGOUT
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            removeUser(); // Cuci session dalam aplikasi
            toast.success("Berjaya keluar dari sistem");
          } else {
            // PROSES LOGIN GOOGLE (PENTING UNTUK SUPER ADMIN)
            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                // redirectTo memastikan Google hantar awak balik ke folder projek yang betul di GitHub Pages
                redirectTo: window.location.origin + '/anime4u5/auth/callback',
                queryParams: {
                  access_type: 'offline',
                  prompt: 'select_account',
                },
              }
            });

            if (error) throw error;
            
            // Nota: Browser akan redirect ke Google, jadi toast "success" biasanya muncul selepas redirect balik
          }
        } catch (err: any) {
          console.error("Authentication error:", err);
          toast.error(err.message || "Kegagalan pengesahan identiti");
        }
      },
      [isAuthenticated, removeUser, onClick],
    );

    const isDisabled = disabled || isLoading;
    const defaultLoadingText = isAuthenticated
      ? "Sila Tunggu (Keluar)..."
      : "Menghubungi Google...";
    const currentLoadingText = loadingText || defaultLoadingText;

    const buttonText = isLoading
      ? currentLoadingText
      : isAuthenticated
        ? signOutText
        : signInText;

    const icon = isLoading ? (
      <Loader2 className="size-4 animate-spin" />
    ) : isAuthenticated ? (
      <LogOut className="size-4" />
    ) : (
      <LogIn className="size-4" />
    );

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={isDisabled}
        variant={variant}
        size={size}
        className={className}
        asChild={asChild}
        aria-label={
          isAuthenticated
            ? "Keluar dari akaun"
            : "Masuk menggunakan akaun Google"
        }
        {...props}
      >
        {showIcon && icon}
        {buttonText}
      </Button>
    );
  },
);

SignInButton.displayName = "SignInButton";