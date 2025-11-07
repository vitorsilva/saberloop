  import BaseView from './BaseView.js';

  export default class TestView extends BaseView {
    render() {
      this.setHTML(`
        <div style="padding: 20px; text-align: center;">
          <h1>🎉 Router and Views Working!</h1>
          <p>You're viewing: TestView</p>
          <p>Current hash: ${window.location.hash}</p>
        </div>
      `);
    }
  }