export function formatParentName(firstName?: string, lastName?: string, email?: string): string {
  const isInvalid = (val?: string) =>
    !val ||
    val.trim() === "" ||
    val.toLowerCase() === "unknown" ||
    val.toLowerCase().startsWith("string") ||
    val.toLowerCase() === "null";

  const firstValid = !isInvalid(firstName);
  const lastValid = !isInvalid(lastName);

  if (firstValid && lastValid) {
    return `${firstName!.trim()} ${lastName!.trim()}`;
  }
  if (firstValid) return firstName!.trim();
  if (lastValid) return lastName!.trim();

  if (email && email.includes("@")) {
    const handle = email.split("@")[0].replace(/[._-]/g, " ");
    return handle
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return "Parent / Guardian";
}

export function formatParentInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function formatPhoneNumber(phone?: string): string {
  if (!phone) return "N/A";
  return phone.split(/x/i)[0].trim();
}
