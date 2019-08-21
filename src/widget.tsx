import { ReactWidget } from "@jupyterlab/apputils";

import * as React from "react";

import { Heroku } from "./heroku";

import { HerokuComponent } from "./components/heroku";

const HEROKU_WIDGET_CLASS = "jp-Heroku";

export class HerokuWidget extends ReactWidget {
  constructor(options: HerokuWidget.IOptions) {
    super();
    this.options = options;
    this.addClass(HEROKU_WIDGET_CLASS);
  }

  render() {
    const { heroku, runInTerminal } = this.options;
    return <HerokuComponent heroku={heroku} runInTerminal={runInTerminal} />;
  }

  private options: HerokuWidget.IOptions;
}

export namespace HerokuWidget {
  export interface IOptions {
    heroku: Heroku;
    runInTerminal: (cmd: string) => void;
  }
}
