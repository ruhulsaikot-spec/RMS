export function canAccess(
  permissions: string[],
  permissionCode: string
) {
  return permissions.includes(
    permissionCode
  );
}