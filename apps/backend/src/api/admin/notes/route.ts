import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { Modules } from '@medusajs/framework/utils'
import type { IOrderModuleService, IUserModuleService } from '@medusajs/framework/types'

/**
 * Internal notes API for the Order Timeline admin widget.
 *
 * Medusa v2 has NO built-in notes endpoint (it existed in v1 and was removed),
 * so the widget's calls to /admin/notes used to 404 ("Failed to save").
 *
 * Notes are persisted on the order's `metadata.notes` array — this avoids a new
 * table/migration, so it works on any environment as soon as the code is
 * deployed. Trade-off: concurrent edits are last-write-wins, which is fine for
 * low-volume internal notes.
 */

type StoredNote = {
  id: string
  value: string
  created_at: string
  author?: { first_name?: string; last_name?: string; email?: string }
}

function readNotes(metadata: Record<string, unknown> | null | undefined): StoredNote[] {
  const notes = (metadata ?? {})['notes']
  return Array.isArray(notes) ? (notes as StoredNote[]) : []
}

export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const resourceType = req.query['resource_type'] as string | undefined
  const resourceId = req.query['resource_id'] as string | undefined

  if (resourceType !== 'order' || !resourceId) {
    res.json({ notes: [] })
    return
  }

  const orderModule: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  try {
    const order = await orderModule.retrieveOrder(resourceId, { select: ['id', 'metadata'] })
    const notes = readNotes(order.metadata).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
    res.json({ notes })
  } catch {
    // Order not found / no metadata — return empty rather than erroring the widget.
    res.json({ notes: [] })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const body = (req.body ?? {}) as {
    resource_id?: string
    resource_type?: string
    value?: string
  }
  const value = (body.value ?? '').trim()

  if (body.resource_type !== 'order' || !body.resource_id || !value) {
    res.status(400).json({
      message: 'resource_type must be "order"; resource_id and a non-empty value are required.',
    })
    return
  }

  const orderModule: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  const order = await orderModule.retrieveOrder(body.resource_id, { select: ['id', 'metadata'] })

  // Best-effort attribution to the acting admin user.
  let author: StoredNote['author']
  try {
    const actorId = (req as unknown as { auth_context?: { actor_id?: string } }).auth_context
      ?.actor_id
    if (actorId) {
      const userModule: IUserModuleService = req.scope.resolve(Modules.USER)
      const user = await userModule.retrieveUser(actorId)
      author = {
        first_name: user.first_name ?? undefined,
        last_name: user.last_name ?? undefined,
        email: user.email,
      }
    }
  } catch {
    /* attribution is optional */
  }

  const note: StoredNote = {
    id: `note_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    value,
    created_at: new Date().toISOString(),
    ...(author ? { author } : {}),
  }

  const existing = readNotes(order.metadata)
  await orderModule.updateOrders(body.resource_id, {
    metadata: { ...(order.metadata ?? {}), notes: [...existing, note] },
  })

  res.json({ note })
}
