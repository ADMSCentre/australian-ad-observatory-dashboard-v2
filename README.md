# Australian Ad Observatory Dashboard

## Developing

Once you've created a project and installed dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production build, run:

```bash
npm run build
```

This will create a static site in the `build` directory that can be deployed to any static site hosting service. To serve the site locally, use `serve`:

```bash
npm install -g serve
serve build
```