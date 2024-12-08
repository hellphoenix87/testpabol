// Return duration string for a video
// Arguments: duration in seconds
// Return: a string in the format of "hh:mm:ss" or "mm:ss"
export function convertDuration(seconds: number): string {
  if (!seconds || seconds === 0) {
    return "00:00";
  }

  const roundedSeconds = Math.round(seconds);
  const hours = Math.floor(roundedSeconds / 3600);
  const minutes = Math.floor((roundedSeconds % 3600) / 60);
  const remainingSeconds = roundedSeconds % 60;

  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  if (hours > 0) {
    const formattedHours = hours.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  return `${formattedMinutes}:${formattedSeconds}`;
}

// Return time string in example format "2 days ago"
export function timeSince(timestamp: number): string {
  const pastDate = new Date(timestamp * 1000) as any;
  const now = new Date() as any;
  const timeDiff = now - pastDate;
  const diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  if (diffDays >= 365) {
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears === 1 ? "" : "s"} ago`;
  }
  if (diffDays >= 7) {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`;
  }
  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }
  const diffHours = Math.floor(timeDiff / (1000 * 60 * 60));
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }
  const diffMinutes = Math.floor(timeDiff / (1000 * 60));
  if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }
  return `Just now`;
}
