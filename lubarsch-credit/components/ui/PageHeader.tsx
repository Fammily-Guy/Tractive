import { AdireBackground, AdireDivider } from "./AdireDivider";

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <>
      <header className="relative overflow-hidden bg-brand-light">
        <AdireBackground className="text-brand/10" />
        <div className="container-page relative py-10 sm:py-14">
          <h1 className="h1 max-w-3xl text-brand-dark">{title}</h1>
          {sub && <p className="lead mt-3 max-w-2xl">{sub}</p>}
          {children}
        </div>
      </header>
      <AdireDivider />
    </>
  );
}
