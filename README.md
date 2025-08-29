<p align="center">
<picture>
    <source srcset="./.github/icon-dark.png" media="(prefers-color-scheme: light)">
    <source srcset="./.github/icon-light.png" media="(prefers-color-scheme: dark)">
    <img src="./.github/icon-dark.png" alt="Header banner">
</picture>
</p>

<h1 align="center">
  OwlRelay - Email to HTTP
</h1>
<p align="center">
  Trigger your webhooks or APIs by sending emails to generated addresses.
</p>

<p align="center">
  <a href="https://owlrelay.email">Website</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://app.owlrelay.email">App</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://discord.gg/8UPjzsrBNF">Discord Community</a>
</p>

## Introduction

**[OwlRelay](https://owlrelay.email)** is a simple service that allows you to trigger webhooks or APIs by sending emails to generated addresses, with a focus on simplicity and ease of use.

1. Login with your favorite OAuth provider
2. Create a new email, with your webhook url
3. Send an email to the generated address
4. The webhook will be triggered with the email data and attachments

## Features

- **Email to HTTP**: Trigger webhooks or APIs by sending emails to generated addresses
- **All email details**: Get all email details, including attachments, body, subject, etc.
- **Filter emails**: Filter emails by sender to avoid unwanted triggers
- **Webhook secret**: Use a secret to sign your webhook payloads
- **API**: Use the API to manage your emails and webhooks
- **JS SDK**: Use the JS SDK to interact with OwlRelay API
- **I18n**: Support for multiple languages
- **Open source**: The code is open source and free to use

## Contributing

Contributions are welcome! Please refer to the [`CONTRIBUTING.md`](./CONTRIBUTING.md) file for guidelines on how to get started, report issues, and submit pull requests.

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](./LICENSE) file for details.

## Community

This project is part of the [Papra ecosystem](https://github.com/papra-hq).
Join the community on [Papra's Discord server](https://discord.gg/8UPjzsrBNF) to discuss the project, ask questions, or get help.


### Stack

OwlRelay is built with the following technologies:

- **Frontend**
  - **[SolidJS](https://www.solidjs.com)**: A declarative JavaScript library for building user interfaces.
  - **[Shadcn Solid](https://shadcn-solid.com/)**: UI components library for SolidJS based on Shadcn designs.
  - **[UnoCSS](https://unocss.dev/)**: An instant on-demand atomic CSS engine.
  - **[Tabler Icons](https://tablericons.com/)**: A set of open-source icons.
  - And other dependencies listed in the **[client package.json](./apps/papra-client/package.json)**
- **Backend**
  - **[HonoJS](https://hono.dev/)**: A small, fast, and lightweight web framework for building APIs.
  - **[Drizzle](https://orm.drizzle.team/)**: A simple and lightweight ORM for Node.js.
  - **[Better Auth](https://better-auth.com/)**: A simple and lightweight authentication library for Node.js.
  - And other dependencies listed in the **[server package.json](./apps/papra-server/package.json)**
- **Website**
  - **[Astro](https://astro.build)**: A great static site generator.
  - **[UnoCSS](https://unocss.dev/)**: An instant on-demand atomic CSS engine.
  - **[Tabler Icons](https://tablericons.com/)**: A set of open-source icons.
- **Project**
  - **[PNPM Workspaces](https://pnpm.io/workspaces)**: A monorepo management tool.
  - **[Github Actions](https://github.com/features/actions)**: For CI/CD.
- **Infrastructure**
  - **[Cloudflare Pages](https://pages.cloudflare.com/)**: For static site hosting.
  - **[Cloudflare Workers](https://workers.cloudflare.com/)**: For backend hosting.
  - **[Turso](https://turso.tech/)**: For production database.

## Credits

This project is crafted with ❤️ by [Corentin Thomasset](https://corentin.tech) and has been originally designed to be used by [Papra](https://papra.app) self-hosted instances.
If you find this project helpful, please consider [supporting my work](https://buymeacoffee.com/cthmsst).

OwlRelay icon is the [Owl Rounded icon](https://icones.js.org/collection/all?icon=material-symbols:owl-rounded) from [Material Symbols set](https://github.com/google/material-design-icons), licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

## Contact Information

Please use the issue tracker on GitHub for any questions or feedback.
