import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface LoginButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ 
  variant = "default", 
  size = "default", 
  className = "" 
}) => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Button 
      onClick={() => loginWithRedirect()}
      variant={variant}
      size={size}
      className={className}
    >
      <LogIn className="mr-2 h-4 w-4" />
      Sign In with Google
    </Button>
  );
};

export default LoginButton;