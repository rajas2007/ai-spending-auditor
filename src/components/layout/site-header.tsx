import { Container } from "./container";

export function SiteHeader() {
  return (
    <header className="border-b bg-white">
      <Container className="flex items-center justify-between py-4">
        <div>
          <p className="text-sm text-zinc-500">AI Spending Auditor</p>
          <h1 className="text-lg font-semibold text-zinc-900">Spend Audit Workspace</h1>
        </div>
        <nav className="text-sm text-zinc-600">MVP Prototype</nav>
      </Container>
    </header>
  );
}
