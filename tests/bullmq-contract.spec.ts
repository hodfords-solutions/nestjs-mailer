import { WorkerHost } from '@nestjs/bullmq';
import { describe, expect, it } from 'vitest';
import { MAIL_JOB, MAIL_QUEUE, MailProcessor } from '../lib/index.js';

describe('bullmq processor contract', () => {
    it('follows the WorkerHost contract instead of the legacy @Process one', () => {
        expect(Object.getPrototypeOf(MailProcessor)).toBe(WorkerHost);
        expect(MailProcessor.prototype.process).toBeTypeOf('function');
        expect((MailProcessor.prototype as Record<string, unknown>).handle).toBeUndefined();
    });

    it('registers worker event listeners', () => {
        for (const listener of ['onActive', 'onComplete', 'onError'] as const) {
            expect(MailProcessor.prototype[listener]).toBeTypeOf('function');
        }
    });

    it('exposes the queue and job names it registers under', () => {
        expect(MAIL_QUEUE).toBe('mails');
        expect(MAIL_JOB).toBe('send-mail');
    });
});
