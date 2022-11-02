import { BaseViewAdapter } from './base-view.adapter';
import mjmlToHtml = require('mjml');
import { BaseMail } from '../mails/base.mail';

export class MjmlAdapter extends BaseViewAdapter {
    public render(mail: BaseMail): string {
        return mjmlToHtml(this.getTemplateContent(mail)).html;
    }
}
