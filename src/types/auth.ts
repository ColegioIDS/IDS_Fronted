export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: (force?: boolean) => Promise<void>;
}