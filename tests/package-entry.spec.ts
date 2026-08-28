import { describe, expect, it } from 'vitest';

describe('package entry', () => {
    it('exports something', async () => {
        const mod = await import('../lib/index.js');
        expect(Object.keys(mod).length).toBeGreaterThan(0);
    });

    it('exposes the mailer module and adapters', async () => {
        const { MailerModule, HbsAdapter, MjmlAdapter, TranslateAdapter, BaseMail } = await import('../lib/index.js');
        expect(MailerModule).toBeTypeOf('function');
        expect(HbsAdapter).toBeTypeOf('function');
        expect(MjmlAdapter).toBeTypeOf('function');
        expect(TranslateAdapter).toBeTypeOf('function');
        expect(BaseMail).toBeTypeOf('function');
    });

    it('renders translate tags', async () => {
        const { TranslateAdapter, BaseMail } = await import('../lib/index.js');

        class SampleMail extends BaseMail {
            get subject(): string {
                return 'subject';
            }

            get to(): string {
                return 'to@example.com';
            }

            get template(): string {
                return '';
            }
        }

        const mail = new SampleMail();
        mail.content = '<trans>welcome</trans>';

        expect(new TranslateAdapter(() => 'Welcome!').render(mail)).toBe('Welcome!');
    });
});
