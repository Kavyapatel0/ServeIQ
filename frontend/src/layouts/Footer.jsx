export function Footer() {
  return (
    <footer className="border-t border-border bg-surface px-6 py-4">
      <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
        <p className="text-xs text-text-secondary">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-primary-600">ServeIQ</span>
          {" "}— Restaurant Business Intelligence Platform
        </p>
        <p className="text-xs text-warm-400">Built for fine-dining operations</p>
      </div>
    </footer>
  );
}
