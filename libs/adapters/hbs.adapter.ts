import { readdirSync, readFileSync } from 'fs';
import Handlebars from 'handlebars';
import { camelCase } from 'lodash';
import { join } from 'path';
import { HbsConfig } from '../interfaces/hbs-config.interface';
import { BaseMail } from '../mails/base.mail';
import { BaseViewAdapter } from './base-view.adapter';

export class HbsAdapter extends BaseViewAdapter {
    handlebars: typeof Handlebars;

    constructor(private option: HbsConfig) {
        super();
        this.handlebars = Handlebars.create();
        this.initTemplate();
        this.initHelper();
    }

    private initTemplate() {
        if (this.option.templateFolder) {
            this.registerPartials({ name: this.option.templateFolder, prefix: '' });
        }

        if (this.option.templates) {
            for (let template of this.option.templates) {
                this.handlebars.registerPartial(template.name, this.getComponentContent(template.path));
            }
        }
    }

    private registerPartials(folder: { name: string; prefix: string }) {
        const files = readdirSync(folder.name);
        for (const file of files) {
            if (file.endsWith('.hbs')) {
                const partialName = `${folder.prefix}-${file.replace('.hbs', '').replace('.', '-')}`;
                this.handlebars.registerPartial(
                    camelCase(partialName),
                    this.getComponentContent(join(folder.name, file))
                );
            }
        }
    }

    private initHelper() {
        if (this.option.helper) {
            for (let helperName of Object.keys(this.option.helper)) {
                this.handlebars.registerHelper(helperName, this.option.helper[helperName]);
            }
        }
    }

    private getComponentContent(file: string) {
        return readFileSync(file).toString();
    }

    async render(mail: BaseMail): Promise<string> {
        let defaultVariable = this.option.defaultVariable;
        let template = this.handlebars.compile(this.getTemplateContent(mail), {});
        if (this.option.defaultVariable instanceof Function) {
            defaultVariable = await this.option.defaultVariable(mail);
        }

        return template({
            ...defaultVariable,
            ...mail.data()
        });
    }
}
