import { SplitPanel } from "@phosphor/widgets";

import { Apps } from "./components/apps";

import { Settings } from "./components/settings";

import { Model } from "./model";

const HEROKU_PANEL_CLASS = "jp-Heroku";

export class HerokuPanel extends SplitPanel {
  constructor(options: HerokuPanel.IOptions) {
    super();
    const { model } = options;
    this.orientation = "vertical";

    const apps = new Apps({ model });
    const settings = new Settings({ model });

    this.addWidget(apps);
    this.addWidget(settings);

    this.addClass(HEROKU_PANEL_CLASS);
  }
}

export namespace HerokuPanel {
  export interface IOptions {
    model: Model;
  }
}
