import { Inject, Injectable, Logger } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import Mail, { Address } from 'nodemailer/lib/mailer';
import isEmail from 'validator/lib/isEmail';
import { MAILER_OPTIONS } from '../constants/mailer.constant';
import { MailerOptions } from '../interfaces/mailer-options.interface';
import { MailContentService } from './mail-content.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { BaseMail } from '../mails/base.mail';

@Injectable()
export class MailService {
    private logger = new Logger(this.constructor.name);

    private transport: Mail;

    constructor(
        @Inject(MAILER_OPTIONS) private mailerOptions: MailerOptions,
        private mailContentService: MailContentService,
        @InjectQueue('mails') private mailQueue: Queue
    ) {
        this.transport = createTransport(mailerOptions.transport);
    }

    public async addToQueue(mail: BaseMail) {
        await this.mailQueue.add(await this.getMailOptions(mail));
    }

    public async send(mail: BaseMail) {
        try {
            const mailOption = await this.getMailOptions(mail);
            if (mailOption.to.length) {
                await this.transport.sendMail(mailOption);
                this.logger.log(`Send mail to ${mailOption.to.join(',')} successfully`);
            } else {
                this.logger.log(`No mail is sent`);
            }
        } catch (err) {
            this.logException(err);
            throw err;
        }
    }

    public async sendToTransport(options: Mail.Options) {
        try {
            const mailOptions = this.getNodeMailerOptions(options);
            if (mailOptions.to.length) {
                await this.transport.sendMail(mailOptions);
                this.logger.log(`Send mail to ${mailOptions.to.join(',')} successfully`);
            } else {
                this.logger.log(`No mail is sent`);
            }
        } catch (err) {
            this.logException(err);
            throw err;
        }
    }

    private async getMailOptions(mail: BaseMail) {
        let content = await this.mailContentService.getContent(mail);
        return {
            from: mail.from || this.mailerOptions.defaultFrom,
            to: this.getValidReceivers(mail.to),
            subject: await mail.subject,
            html: content,
            cc: this.getValidReceivers(mail.cc),
            attachments: mail.listAttachments(),
            ...mail.options
        };
    }

    private getNodeMailerOptions(options: Mail.Options) {
        const toEmails = options.to ? this.getValidReceivers(options.to) : [];
        const ccEmails = options.cc ? this.getValidReceivers(options.cc) : [];
        return {
            ...options,
            to: toEmails,
            cc: ccEmails
        };
    }

    private getValidReceivers(receivers: string | (string | Address)[] | Address): string[] {
        const emails = this.stringifyEmails(receivers);
        if (!this.mailerOptions.whitelist) {
            return emails;
        }

        return emails.filter((email) => {
            return this.mailerOptions.whitelist?.some((pattern) => {
                const regex = new RegExp(pattern, 'g');
                return regex.test(email);
            });
        });
    }

    private stringifyEmails(receivers: string | (string | Address)[] | Address): string[] {
        if (!Array.isArray(receivers)) {
            const email = typeof receivers === 'string' ? receivers : receivers.address;
            return isEmail(email) ? [email] : [];
        }

        return receivers.reduce((acc, email) => {
            const strEmail = typeof email === 'string' ? email : email.address;
            return isEmail(strEmail) ? acc.concat(strEmail) : acc;
        }, [] as string[]);
    }

    private logException(err: any) {
        if (err instanceof Error) {
            this.logger.error(err.message, err.stack);
        } else {
            this.logger.error('Error in send mail', err);
        }
    }
}
