import { HbsConfig } from '../interfaces/hbs-config.interface.js';
import { BaseMail } from '../mails/base.mail.js';
import { BaseViewAdapter } from './base-view.adapter.js';
import { HbsAdapter } from './hbs.adapter.js';

export class HbsFactoryAdapter extends BaseViewAdapter {
    adapterMap: Map<string, HbsAdapter>;

    constructor(
        private baseOption: Omit<HbsConfig, 'templateFolder'>,
        private folderChooser: (...args: unknown[]) => string
    ) {
        super();
        this.adapterMap = new Map();
    }

    public render(mail: BaseMail): string | Promise<string> {
        const templateFolder = this.folderChooser(mail);

        let adapter = this.adapterMap.get(templateFolder);
        if (!adapter) {
            adapter = new HbsAdapter({ ...this.baseOption, templateFolder });
            this.adapterMap.set(templateFolder, adapter);
        }

        return adapter.render(mail);
    }
}
