<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

# nestjs-mailer

## Description

```typescript
Use forRootAsync to register dynamic module

export const mailConfig = MailerModule.forRoot({
  renders: {
    adapters: [
      new HbsAdapter({
        templateFolder: path.join(env.ROOT_PATH, `mails/templates/${getEmailFolder()}`),
        defaultVariable: async () => {
          ...
          return defaultVariable
        },
      }),
      new TranslateAdapter((text, options: any) => trans(text as string, options)),
      new MjmlAdapter(),
    ],
  },
  transport: env.MAILER_URL as string,
  defaultFrom: env.IS_WHITELABELED_SERVER ? env.COMPANY_OUTBOUND_EMAIL : (env.MAILER_FROM as string),
  whitelist: env.WHITELIST_EMAILS,
})
```

```typescript
Use forRootAsync to register dynamic module

export const mailConfig = MailerModule.forRootAsync({
  imports: [CoreModule],
  inject: [Connection, AzureBlobService],
  useFactory: (connection: Connection, azureBlobService: AzureBlobService) => {
    return {
      renders: {
        adapters: [
          new HbsAdapter({
            templateFolder: path.join(env.ROOT_PATH, `mails/templates/${getEmailFolder()}`),
            defaultVariable: async () => {
              if (env.IS_WHITELABELED_SERVER) {
                const settingRepository = connection.getCustomRepository(SettingRepository)
                const setting = await settingRepository.findOneOrFail({}, { select: ['companyName', 'logo', 'supportEmail'] })
                const logoUrl = azureBlobService.generateBlobUrl(setting.logo?.origin || '')
                defaultVariable.whiteLabeledSetting = {
                  logoUrl,
                  companyName: setting.companyName,
                  supportEmail: setting.supportEmail,
                }
              }
              return defaultVariable
            },
          }),
          new TranslateAdapter((text, options: any) => trans(text as string, options)),
          new MjmlAdapter(),
        ],
      },
      transport: env.MAILER_URL as string,
      defaultFrom: env.IS_WHITELABELED_SERVER ? env.COMPANY_OUTBOUND_EMAIL : (env.MAILER_FROM as string),
      whitelist: env.WHITELIST_EMAILS,
    }
  },
})
```