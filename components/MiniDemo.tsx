/** A clearly labelled schematic, rather than fabricated measurements. */
export default function MiniDemo({ id }: { id: string }) {
  if (id !== "scraper") return null;
  return (
    <figure className="rounded-lg border border-line bg-bg-2 p-4">
      <figcaption className="mb-3 text-xs text-text-muted">Book-data pipeline · illustration</figcaption>
      <ol className="grid grid-cols-2 gap-2 text-sm">
        {["Book pages", "Extract fields", "SQLite records", "CSV export"].map((stage, index) => (
          <li key={stage} className="rounded-md border border-cyan/20 px-3 py-2"><span className="mr-2 mono text-xs text-cyan">0{index + 1}</span>{stage}</li>
        ))}
      </ol>
    </figure>
  );
}
