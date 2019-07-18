import { Toolbar, ReactWidget } from "@jupyterlab/apputils";

import { Widget, PanelLayout } from "@phosphor/widgets";

import * as React from "react";

import { Heroku } from "./heroku";

import { HerokuAppsComponent } from "./apps";

import { HerokuSettingsComponent } from "./settings";

const HEROKU_WIDGET_CLASS = "jp-Heroku";

export class HerokuWidget extends Widget {
  constructor(heroku: Heroku, runInTerminal: (cmd: string) => void) {
    super();
    this.addClass(HEROKU_WIDGET_CLASS);

    let apps = ReactWidget.create(
      <HerokuAppsComponent heroku={heroku} runInTerminal={runInTerminal} />
    );
    let settings = ReactWidget.create(
      <HerokuSettingsComponent heroku={heroku} />
    );

    let layout = new PanelLayout();
    layout.addWidget(apps);
    layout.addWidget(settings);

    this.layout = layout;
  }

  readonly toolbar: Toolbar<Widget>;
}
