import * as React from "react";

import { ReactWidget } from "@jupyterlab/apputils";

const HEROKU_WIDGET_CLASS = "jp-Heroku";

export class HerokuWidget extends ReactWidget {
  constructor() {
    super();
    this.addClass(HEROKU_WIDGET_CLASS);
  }

  render() {
    return <div>Heroku</div>;
  }
}
