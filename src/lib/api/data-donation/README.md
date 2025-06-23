This module connects to the [data donation API](https://admscentre.github.io/uq-ddp-donation-api/) to keep track of the data donation status of users.

# Data Donation API

The API documentation is available at [https://admscentre.github.io/uq-ddp-donation-api/](https://admscentre.github.io/uq-ddp-donation-api/).

To generate the API client, run the following command from the `data-donation` directory:

```bash
npx openapi-typescript https://admscentre.github.io/uq-ddp-donation-api/swagger.yaml -o openapi-paths.ts
```