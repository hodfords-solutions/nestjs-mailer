<p align="center">
  <a href="http://opensource.hodfords.uk" target="blank"><img src="https://opensource.hodfords.uk/img/logo.svg" width="320" alt="Hodfords Logo" /></a>
</p>

<p align="center"> <b>nestjs-mailer</b> simplifies integrating and managing email functionalities in NestJS applications, making email operations easier and more efficient.</p>

## Installation 🤖

Install the `nestjs-mailer` package with:

```
npm install @hodfords/nestjs-mailer --save
```

To configure the mailer module dynamically, use `forRoot` to define your email template renderers, transport settings, and default sender email.

```typescript
export const mailConfig = MailerModule.forRoot({
    renders: {
        adapters: [
            new HbsAdapter({
                templateFolder: path.join(env.ROOT_PATH, `mails/templates/${getEmailFolder()}`),
                defaultVariable: async () => getMailConfigurations()
            }),
            new TranslateAdapter((text: string, options: any) => trans(text, options)),
            new MjmlAdapter()
        ],
		transport: env.MAILER_URL,
        defaultFrom: env.CONTACT_MAIL_ADDRESS
    },
    ...
});
```

For more advanced use cases where additional services or repositories are required, you can register the module using `forRootAsync`. This allows injecting services, repositories, or even database connections for more complex setups

```typescript
export const mailConfig = MailerModule.forRootAsync({
    imports: [CoreModule],
    inject: [Connection, StorageService],
    useFactory: (connection: Connection, storageService: StorageService) => {
        const settingRepo = connection.getCustomRepository(SettingRepository);
        const hbsAdapter = new HbsAdapter({
            templateFolder: path.join(env.ROOT_PATH, `mails/templates/${getEmailFolder()}`),
            defaultVariable: async (mail: BaseMail) => {
                const variables = getMailConfigurations();
                if (mail.isWhitelabeled) {
                    const setting = await settingRepo.findOne({ tenant: mail.tenantId });
                    variables.logoUrl = await storageService.generateBlobUrl(setting.blobLogo);
                }
                return variables;
            }
        });
        return {
            renders: {
                adapters: [
                    hbsAdapter,
                    new TranslateAdapter((text: string, options: any) => trans(text, options)),
                    new MjmlAdapter()
                ]
            },
            transport: env.MAILER_URL,
            defaultFrom: env.CONTACT_MAIL_ADDRESS
        };
    }
});
```

## Usage 🚀

### Adapters

Currently, nestjs-mailer supports the following adapters:

-   `HbsAdapter`: For rendering Handlebars templates with dynamic variables and templates.
-   `TranslateAdapter`: For handling multi-language support and translations.
-   `MjmlAdapter`: For generating responsive HTML emails using MJML templates.

### Defining an Email

To define a custom email, extend the BaseMail class and specify the email subject, template path, and data.

Here's an example of how to define a `WelcomeEmail`:

```typescript
import { BaseMail } from '@hodfords/nestjs-mailer';

export class WelcomeMail extends BaseMail {
    constructor(private email: string) {
        super();
    }

    get subject(): string {
        return 'Welcome to Hodfords!';
    }

    get template(): string {
        return path.join(env.ROOT_PATH, 'welcome-mail.mail.hbs');
    }

    data(): Record<string, any> {
        return {
            content:
                "Welcome to our system! We're excited to have you on board and look forward to providing you with a seamless and enjoyable experience."
        };
    }

    get to(): string {
        return this.email;
    }
}
```

### Sending an Email

To send an email, inject the `MailerService` into your service and utilize the appropriate method for sending emails

```typescript
import { MailService } from '@hodfords/nestjs-mailer';

@Injectable()
class YourService {
    constructor(private mailService: MailerService) {}
}
```

You have two options for sending emails:

-   **Send Immediately**: Send a single email right away.

```typescript
1. const mail = new WelcomeMail(user.email);
await this.mailService.send(mail);
```

-   **Add to Queue**: Use this method when you need to send a large number of emails. Emails will be queued and sent
    asynchronously.

```typescript
for (const user of users) {
    const mail = new WelcomeMail(user.email);
    await this.mailService.addToQueue(mail);
}
```

## License 📝

This project is licensed under the MIT License
