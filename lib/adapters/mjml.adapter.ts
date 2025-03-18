import mjml2html from 'mjml';
import { BaseMail } from '../mails/base.mail';
import { BaseViewAdapter } from './base-view.adapter';

export class MjmlAdapter extends BaseViewAdapter {
    public async render(mail: BaseMail): Promise<string> {
        const { html } = await mjml2html(this.getTemplateContent(mail));
        return html;
    }
}
