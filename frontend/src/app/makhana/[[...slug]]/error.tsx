"use client";

export default function CategoryError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="site-container py-16 text-center">
      <h2 className="font-display text-xl font-semibold text-gray-900">
        Something went wrong
      </h2>
      <p className="mt-2 text-gray-500">
        We couldn&apos;t load this category. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-brand-700 px-6 py-2 text-sm font-medium text-white hover:bg-brand-800"
      >
        Try again
      </button>
    </div>
  );
}
