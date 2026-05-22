const trimMessage = (message, maxLength = 100) => {
  if (!message) return "";
  const text = message.trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
};

const getNestedMessage = (data) => {
  if (!data || typeof data !== "object") return undefined;
  return (
    data.message ||
    data.error?.message ||
    data.error?.code ||
    data.type ||
    data.title ||
    data.detail ||
    data.response?.message
  );
};

export const getErrorMessage = (error) => {
  if (!error) return "Something went wrong. Please try again.";

  const status = error.response?.status || error.status;
  const data = error.response?.data;
  const rawMessage =
    getNestedMessage(data) ||
    (typeof data === "string" && data.trim() && data) ||
    error.message ||
    "Something went wrong. Please try again.";

  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status === 503) return "Service unavailable. Please try again shortly.";
  if (status === 500 && /timeout|timed out|server.*busy|service.*unavailable/i.test(rawMessage)) {
    return "AI service timeout or unavailable. Please retry in a moment.";
  }
  if (status === 500 && /rate limit/i.test(rawMessage)) {
    return "Too many requests. Please try again later.";
  }

  return trimMessage(rawMessage, 100);
};
