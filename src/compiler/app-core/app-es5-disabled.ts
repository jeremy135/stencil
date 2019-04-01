import * as d from '../../declarations';
import { escapeHtml } from '@utils';


export async function generateEs5DisabledMessage(config: d.Config, compilerCtx: d.CompilerCtx, outputTarget: d.OutputTargetWww) {
  // not doing an es5 right now
  // but it's possible during development the user
  // tests on a browser that doesn't support es2017
  const fileName = `${config.fsNamespace}.js`;
  const filePath = config.sys.path.join(outputTarget.buildDir, fileName);
  await compilerCtx.fs.writeFile(filePath, getDisabledMessageScript(config));
  return fileName;
}


function getDisabledMessageScript(config: d.Config) {
  const style = `
<style>
body {
  font-family: sans-serif;
  padding: 20px;
  line-height:22px;
}
h1 {
  font-size: 18px;
}
h2 {
  font-size: 14px;
  margin-top: 40px;
}
</style>
`;

  const htmlLegacy = `
  ${style}

  <h1>This Stencil app is disabled for this browser.</h1>

  <h2>Developers:</h2>
  <ul>
    <li>ES5 builds are disabled <strong>during development</strong> to take advantage of 2x faster build times.</li>
    <li>Please see the example below or our <a href="https://stenciljs.com/docs/stencil-config" target="_blank">config docs</a> if you would like to develop on a browser that does not fully support ES2017 and custom elements.</li>
    <li>Note that by default, ES5 builds and polyfills are enabled during production builds.</li>
    <li>When testing browsers it is recommended to always test in production mode, and ES5 builds should always be enabled during production builds.</li>
    <li><em>This is only an experiement and if it slows down app development then we will revert this and enable ES5 builds during dev.</em></li>
  </ul>


  <h2>Enabling ES5 builds during development:</h2>
  <pre>
    <code>npm run dev --es5</code>
  </pre>
  <p>For stencil-component-starter, use:</p>
  <pre>
    <code>npm start --es5</code>
  </pre>


  <h2>Enabling full production builds during development:</h2>
  <pre>
    <code>npm run dev --prod</code>
  </pre>
  <p>For stencil-component-starter, use:</p>
  <pre>
    <code>npm start --prod</code>
  </pre>

  <h2>Current Browser's Support:</h2>
  <ul>
    <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import">ES Module Imports</a>: <span id="es-modules-test"></span></li>
    <li><a href="http://2ality.com/2017/01/import-operator.html">ES Dynamic Imports</a>: <span id="es-dynamic-modules-test"></span></li>
    <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/customElements">Custom Elements</a>: <span id="custom-elements-test"></span></li>
    <li><a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM">Shadow DOM</a>: <span id="shadow-dom-test"></span></li>
    <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API">fetch</a>: <span id="fetch-test"></span></li>
    <li><a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables">CSS Variables</a>: <span id="css-variables-test"></span></li>
  </ul>

  <h2>Current Browser:</h2>
  <pre>
    <code id="current-browser-output"></code>
  </pre>
  `;
  const htmlUpdate = `
  ${style}

  <h1>Update src/index.html</h1>

  <p>Stencil recently changed the way it is imported in order to improve performance.</p>
  <p>Previ</p>


  <h2>BEFORE:</h2>
  <p>Previously, a single ".js" loader was loaded.</p>
  <pre>
    <code>${escapeHtml(`
<script src="build/${config.fsNamespace}.js"></script>
`)}</code>
  </pre>

  <h2>AFTER:</h2>
  <p>Currently, developers need to include to scripts, but only one will be loaded, based in the native support for ES Modules</p>
  <pre>
    <code>${escapeHtml(`
<script type="module" src="build/${config.fsNamespace}.mjs.js"></script>
<script nomodule src="build/${config.fsNamespace}.js"></script>
`)}</code>
  </pre>
  `;
  const script = `
    function supportsDynamicImports() {
      try {
        new Function('import("")');
        return true;
      } catch (e) {}
      return false;
    }
    var supportsEsModules = !!('noModule' in document.createElement('script'));

    if (!supportsEsModules) {
      document.body.innerHTML = '${inlineHTML(htmlLegacy)}';

      document.getElementById('current-browser-output').textContent = window.navigator.userAgent;
      document.getElementById('es-modules-test').textContent = supportsEsModules;
      document.getElementById('es-dynamic-modules-test').textContent = supportsDynamicImports();
      document.getElementById('shadow-dom-test').textContent = !!(document.head.attachShadow);
      document.getElementById('custom-elements-test').textContent = !!(window.customElements);
      document.getElementById('css-variables-test').textContent = !!(window.CSS && window.CSS.supports && window.CSS.supports('color', 'var(--c)'));
      document.getElementById('fetch-test').textContent = !!(window.fetch);
    } else {
      document.body.innerHTML = '${inlineHTML(htmlUpdate)}';
    }
  `;

  // timeout just to ensure <body> is ready
  return `setTimeout(function(){ ${script} }, 10)`;
}

function inlineHTML(html: string) {
  return html.replace(/\n/g, '\\n').replace(/\'/g, `\\'`).trim();
}