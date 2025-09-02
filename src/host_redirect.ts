document.addEventListener('DOMContentLoaded', () => {
  // Get the query string from the URL
  const queryString = window.location.search.substring(1);
  const params = Object.fromEntries(new URLSearchParams(queryString));

  // Check for hostId parameter
  const hostId = params["hostId"];

  if (typeof hostId === "string") {
    // Set cookie (expires in 1 day)

    document.cookie = `hostId=${encodeURIComponent(
      hostId
    )}; path=/; max-age=86400`;

    // Redirect to host.html
    window.location.href = "host.html";
  } else {
    // Optional: handle missing hostId
    window.location.href = "index.html";
  }
});