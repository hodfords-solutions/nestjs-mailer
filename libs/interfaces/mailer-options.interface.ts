import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { BaseViewAdapter } from '../adapters/base-view.adapter';
import { BaseMail } from '../mails/base.mail';

interface RenderInterface {
    adapters: BaseViewAdapter[];
}

type defaultFromFn = (mail: BaseMail) => Promise<string>;

export interface MailerOptions {
    renders: RenderInterface;
    transport: SMTPTransport | SMTPTransport.Options | string;
    defaultFrom: string | defaultFromFn;
    whitelist?: string[];
}
