import { randomUUID } from 'node:crypto';
import type { Message } from 'discord.js';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import type { SignalConfig, SignalHandler } from '../src/interfaces';
import { HmacService } from '../src/security/hmac.service';
import { NonceCache } from '../src/security/nonce-cache.service';
import { SignalProcessor } from '../src/service/signal-processor.service';
import { SignalRouter } from '../src/service/signal-router.service';
import { SignalValidator } from '../src/service/signal-validator.service';

const config: SignalConfig = {
  channelId: 'signal-channel',
  allowedWebhookIds: ['signal-webhook'],
  hmacSecret: 'signal-schema-regression-test',
};

function createMessage(payload: Record<string, unknown>): Message {
  const nonce = randomUUID();
  const sentAt = Date.now();
  return {
    id: nonce,
    channelId: config.channelId,
    webhookId: 'signal-webhook',
    content: JSON.stringify({
      v: 1,
      event: 'items.update',
      guildId: 'signal-guild',
      nonce,
      sentAt,
      payload,
      signature: HmacService.compute(nonce, sentAt, payload, config.hmacSecret),
    }),
  } as Message;
}

describe('SignalProcessor schema validation', () => {
  it('rejects oversized signed payloads before walking elements and still processes the next valid signal', async () => {
    const transform = vi.fn((value: string) => value.toUpperCase());
    const execute = vi.fn<SignalHandler['execute']>().mockResolvedValue(undefined);
    const router = new SignalRouter();
    router.register('items.update', {
      event: 'items.update',
      schema: z.object({ items: z.array(z.string().transform(transform)).max(2) }),
      execute,
    });
    const processor = new SignalProcessor(new SignalValidator(), router, new NonceCache());

    await processor.process(createMessage({ items: Array.from({ length: 128 }, () => 'item') }), config);

    expect(transform).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();

    await processor.process(createMessage({ items: ['valid'] }), config);

    expect(transform).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledExactlyOnceWith(
      { items: ['VALID'] },
      expect.objectContaining({ event: 'items.update', guildId: 'signal-guild' }),
    );
  });

  it('drops signed payloads that fail the Zod 4 schema', async () => {
    const execute = vi.fn<SignalHandler['execute']>().mockResolvedValue(undefined);
    const router = new SignalRouter();
    router.register('items.update', {
      event: 'items.update',
      schema: z.object({ items: z.array(z.string()).max(2) }),
      execute,
    });
    const processor = new SignalProcessor(new SignalValidator(), router, new NonceCache());

    await processor.process(createMessage({ items: [42] }), config);

    expect(execute).not.toHaveBeenCalled();
  });
});
