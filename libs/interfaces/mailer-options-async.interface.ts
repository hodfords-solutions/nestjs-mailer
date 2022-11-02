import { Abstract, ModuleMetadata, Type } from '@nestjs/common';

import { MailerOptions } from './mailer-options.interface';
import { MailerOptionsFactory } from './mailer-options-factory.interface';

export interface MailerAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    inject?: Array<Type<any> | string | symbol | Abstract<any> | Function>;
    useExisting?: Type<MailerOptionsFactory>;
    useClass?: Type<MailerOptionsFactory>;
    useFactory?: (...args: any[]) => Promise<MailerOptions> | MailerOptions;
}
