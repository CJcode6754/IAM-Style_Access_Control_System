import { useSelector } from 'react-redux';

export default function PermissionGuard({ module, action, fallback = null, children }) {
  const { permissions } = useSelector((state) => state.auth);
  
  const hasPermission = permissions.some(
    (permission) => permission.module === module && permission.action === action
  );

  if (!hasPermission) {
    return fallback;
  }

  return children;
}
