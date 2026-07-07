import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import type { PermissionAction } from '@/types';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAuth = () => {
  const { user, accessToken } = useAppSelector((state) => state.auth);

  const hasPermission = (perm: PermissionAction | PermissionAction[]) => {
    if (!user) return false;
    const required = Array.isArray(perm) ? perm : [perm];
    return required.some((p) => user.permissions.includes(p));
  };

  return {
    user,
    isAuthenticated: Boolean(accessToken && user),
    hasPermission,
  };
};
