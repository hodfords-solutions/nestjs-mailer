import { Inject, Injectable } from '@nestjs/common';
import { MAILER_OPTIONS } from '../constants/mailer.constant';
import { MailerOptions } from '../interfaces/mailer-options.interface';
import { BaseMail } from '../mails/base.mail';

@Injectable()
export class MailContentService {
    constructor(@Inject(MAILER_OPTIONS) private mailerOptions: MailerOptions) {}

    async getContent(mail: BaseMail) {
        for (let adapter of this.mailerOptions.renders.adapters) {
            mail.content = await adapter.render(mail);
        }
        return mail.content;
    }
}
