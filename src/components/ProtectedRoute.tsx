
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import AuthModal from "./AuthModal";
import { Loader } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-6 max-w-md mx-auto p-6">
            <h1 className="text-3xl font-bold gradient-text">Access Required</h1>
            <p className="text-muted-foreground">
              You need to sign in to access this page. Create an account or sign in to continue.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              >
                Sign In / Sign Up
              </button>
            </div>
          </div>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
