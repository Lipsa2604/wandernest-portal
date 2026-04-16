import { useContext } from 'react';
import { UserContext } from '../providers/UserProvider';

export const useAuth = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useAuth must be used within a UserProvider');
  }
  return context;
};