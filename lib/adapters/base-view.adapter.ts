import { readFileSync } from 'fs';
import { BaseMail } from '../mails/base.mail';

export abstract class BaseViewAdapter {
    public abstract render(mail: BaseMail): Promise<string> | string;

    protected getTemplateContent(mail: BaseMail): string {
        if (mail.content) {
            return mail.content;
        }
        return readFileSync(mail.template).toString();
    }
}
