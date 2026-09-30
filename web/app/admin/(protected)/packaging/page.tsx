import { AdminHeader, Table } from "../AdminShell";
import { api } from "@/lib/api";
import { PackArt } from "@/components/PackArt";

export default async function AdminPackagingPage() {
  const packagings = await api.packagings();
  return (
    <div>
      <AdminHeader section="Packaging" />
      <Table head={["Pack", "Type", "Size", "Preview"]}
        rows={packagings.map((p) => [
          <b key={p.id}>{p.name}</b>, p.kind, p.shortLabel,
          <div key="a" className="h-14 w-10"><PackArt kind={p.kind} color="#D79B1E" label={p.name} /></div>,
        ])} />
    </div>
  );
}
