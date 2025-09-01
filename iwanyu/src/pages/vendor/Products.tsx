export function VendorProducts() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <div className="flex gap-2">
          <button className="rounded-md bg-brand px-3 py-2 text-sm">Add Product</button>
          <button className="rounded-md border px-3 py-2 text-sm">Import</button>
          <button className="rounded-md border px-3 py-2 text-sm">Export</button>
        </div>
      </div>
      <div className="rounded-lg border bg-white p-4">
        <div className="text-neutral-600">Product list coming soon…</div>
      </div>
    </div>
  )
}

