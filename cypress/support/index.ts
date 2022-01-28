import '@cypress/code-coverage/support';
import '@testing-library/cypress/add-commands';

export const styles = {
  cssFile: "public/index.css",
  style: `
  .wrapper {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  `,
  html: `
    <div class="wrapper">
      <div id="here" />
    </div>
  `
};
