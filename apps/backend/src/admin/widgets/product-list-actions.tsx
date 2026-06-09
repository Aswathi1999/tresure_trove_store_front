import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { ArrowUpTray } from '@medusajs/icons'

function ProductListActionsWidget() {
  return (
    <div className="flex justify-end px-0 pb-2">
      <a
        href="/app/products/import"
        className="flex items-center gap-2 text-sm font-medium text-ui-fg-subtle border border-ui-border-base rounded-md px-3 py-2 bg-ui-bg-base hover:bg-ui-bg-base-hover hover:text-ui-fg-base transition-colors"
      >
        <ArrowUpTray className="w-4 h-4" />
        Bulk Import CSV
      </a>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: 'product.list.before',
})

export default ProductListActionsWidget
