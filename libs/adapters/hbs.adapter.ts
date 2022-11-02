import Handlebars from 'handlebars';
import { BaseViewAdapter } from './base-view.adapter';
import fs, { readFileSync } from 'fs';
import path from 'path';
import { camelCase } from 'lodash';
import { BaseMail } from '../mails/base.mail';
import { HbsConfig } from '../interfaces/hbs-config.interface';

export class HbsAdapter extends BaseViewAdapter {
    constructor(private option: HbsConfig) {
        super();
        this.initTemplate();
        this.initHelper();
    }

    initTemplate() {
        if (this.option.templateFolder) {
            let files = fs.readdirSync(this.option.templateFolder);
            for (let file of files) {
                if (file.endsWith('.hbs')) {
                    Handlebars.registerPartial(
                        camelCase(file.replace('.hbs', '').replace('.', '-')),
                        this.getComponentContent(path.join(this.option.templateFolder, file))
                    );
                }
            }
        }
        if (this.option.templates) {
            for (let template of this.option.templates) {
                Handlebars.registerPartial(template.name, this.getComponentContent(template.path));
            }
        }
    }

    initHelper() {
        if (this.option.helper) {
            for (let helperName of Object.keys(this.option.helper)) {
                Handlebars.registerHelper(helperName, this.option.helper[helperName]);
            }
        }
    }

    getComponentContent(file: string) {
        return readFileSync(file).toString();
    }

    async render(mail: BaseMail): Promise<string> {
        let defaultVariable = this.option.defaultVariable;
        let template = Handlebars.compile(this.getTemplateContent(mail), {});
        if (this.option.defaultVariable instanceof Function) {
            defaultVariable = await this.option.defaultVariable();
        }

        return template({
            ...defaultVariable,
            ...(await mail.data())
        });
    }
}
