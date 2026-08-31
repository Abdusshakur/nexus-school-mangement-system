export function formatParentName(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) {
    return `${firstName.trim()} ${lastName.trim()}`;
  }
  if (firstName) return firstName.trim();
  if (lastName) return lastName.trim();
  if (email) return email;
  return "";
}

export function formatParentInitials(name: string): string {
  const parts = name.trim().split(" ").filter((p) => p && p !== "/");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function formatPhoneNumber(phone?: string): string {
  if (!phone) return "N/A";
  return phone.split(/x/i)[0].trim();
}
