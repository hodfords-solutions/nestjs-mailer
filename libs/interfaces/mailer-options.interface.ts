import { BaseViewAdapter } from '../adapters/base-view.adapter';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

interface RenderInterface {
    adapters: BaseViewAdapter[];
}

export interface MailerOptions {
    renders: RenderInterface;
    transport: SMTPTransport | SMTPTransport.Options | string;
    defaultFrom: string;
    whitelist?: string[];
}
