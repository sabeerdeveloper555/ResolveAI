interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

// Standard page heading rendered inside each route so every page owns its
// own content within the shared shell.
export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-[30px]">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
