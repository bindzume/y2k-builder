# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## To Do:
- Make the background image have parity with export (done)
- Add toggle between <audio> tag and using javascript with better looping (done)
- have multiple sites in localstorage (done)
- import site (done)
- on hover make things change or make image popup
- clear cursor, background image, and audio (done)
- Need ability to have images on foreground and background. so instead of being flex, it just goes right on top (done by making flexboxes have bgimage)
- need to make flex boxes clickable like buttons. All tools should be clickable (done)
- visual bug with marquee and links/text in canvas
- when switching to <audio>, i see that there is a little audio widget that appears. might be best to get rid of <audio> tag altogether
- have option to automatically resize large images in BG and in images. also maybe have file paths instead of the base64 thing im doing right now.. or could have catbox be the backend. (fixed by exporting zip folders for each page)
- allow for exporting all projects and make the html files be named the name of the project.(in the blob, can have buttons create new blobs for each project)
- ability for bg audio to be attached as a link. or for audio to be in base64 optionally since neocities blocks audio