const ErrorBanner = ({ message }) => {
  if (!message) return null;

  return (
    <div className="max-w-full rounded-3xl border border-red-500/30 bg-red-500/10 text-red-100 p-4 mb-6">
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none">⚠️</span>
        <div>
          <p className="font-semibold text-sm text-red-100">Error</p>
          <p className="mt-1 text-sm leading-relaxed wrap-break-word">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;
