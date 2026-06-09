import orderConfirmationSubscriber from '../order-confirmation'

function makeContainer(
  overrides: {
    createNotifications?: jest.Mock
    notificationResolveError?: Error
  } = {},
) {
  const mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }
  const mockNotificationService = {
    createNotifications: overrides.createNotifications ?? jest.fn().mockResolvedValue(undefined),
  }

  const container = {
    resolve: jest.fn((key: string) => {
      if (key === 'logger') return mockLogger
      if (overrides.notificationResolveError && key.includes('notification')) {
        throw overrides.notificationResolveError
      }
      return mockNotificationService
    }),
  }

  return { container, mockLogger, mockNotificationService }
}

describe('orderConfirmationSubscriber', () => {
  it('resolves logger and logs order ID at start', async () => {
    const { container, mockLogger } = makeContainer()
    await orderConfirmationSubscriber({
      event: { data: { id: 'order_abc' } } as any,
      container: container as any,
      pluginOptions: {} as any,
    })
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('order_abc'))
  })

  it('calls createNotifications with correct template and order_id', async () => {
    const createNotifications = jest.fn().mockResolvedValue(undefined)
    const { container } = makeContainer({ createNotifications })
    await orderConfirmationSubscriber({
      event: { data: { id: 'order_xyz' } } as any,
      container: container as any,
      pluginOptions: {} as any,
    })
    expect(createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'email',
        template: 'order-confirmation',
        data: { order_id: 'order_xyz' },
      }),
    )
  })

  it('logs success after dispatching notification', async () => {
    const { container, mockLogger } = makeContainer()
    await orderConfirmationSubscriber({
      event: { data: { id: 'order_success' } } as any,
      container: container as any,
      pluginOptions: {} as any,
    })
    const infoCalls = mockLogger.info.mock.calls.map((c: string[]) => c[0])
    expect(
      infoCalls.some((msg: string) => msg.includes('order_success') && msg.includes('dispatched')),
    ).toBe(true)
  })

  it('logs error and does not rethrow when createNotifications fails', async () => {
    const createNotifications = jest.fn().mockRejectedValue(new Error('SMTP timeout'))
    const { container, mockLogger } = makeContainer({ createNotifications })
    await expect(
      orderConfirmationSubscriber({
        event: { data: { id: 'order_fail' } } as any,
        container: container as any,
        pluginOptions: {} as any,
      }),
    ).resolves.toBeUndefined()
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('SMTP timeout'))
  })

  it('logs error and does not rethrow when notification service cannot be resolved', async () => {
    const { container, mockLogger } = makeContainer({
      notificationResolveError: new Error('Service not registered'),
    })
    await expect(
      orderConfirmationSubscriber({
        event: { data: { id: 'order_resolve_fail' } } as any,
        container: container as any,
        pluginOptions: {} as any,
      }),
    ).resolves.toBeUndefined()
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Service not registered'))
  })
})
