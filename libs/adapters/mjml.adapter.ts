import mjmlToHtml from 'mjml';
import { BaseMail } from '../mails/base.mail';
import { BaseViewAdapter } from './base-view.adapter';

export class MjmlAdapter extends BaseViewAdapter {
    public render(mail: BaseMail): string {
        return mjmlToHtml(this.getTemplateContent(mail)).html;
    }
}
