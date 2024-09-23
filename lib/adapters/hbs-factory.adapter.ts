import { HbsConfig } from '../interfaces/hbs-config.interface';
import { BaseMail } from '../mails/base.mail';
import { BaseViewAdapter } from './base-view.adapter';
import { HbsAdapter } from './hbs.adapter';

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
