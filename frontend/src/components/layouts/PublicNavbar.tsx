import { Link, useLocation } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PublicNavbar = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Scale className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">AI Legal Assistance</span>
        </Link>

        <nav className="flex items-center gap-3">
          {isLoginPage ? (
            <Button asChild>
              <Link to="/register">Sign Up</Link>
            </Button>
          ) : isRegisterPage ? (
            <Button asChild variant="outline">
              <Link to="/login">Login</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default PublicNavbar;
