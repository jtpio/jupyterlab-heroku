import { ToolbarButton, Toolbar } from "@jupyterlab/apputils";

import { Widget, PanelLayout } from "@phosphor/widgets";

import { Heroku } from "./heroku";

const HEROKU_WIDGET_CLASS = "jp-Heroku";
const HEROKU_PUSH_CLASS = "jp-FileUploadIcon";

export class HerokuWidget extends Widget {
  constructor(heroku: Heroku) {
    super();
    this.addClass(HEROKU_WIDGET_CLASS);

    this.toolbar = new Toolbar<Widget>();

    let deployButton = new ToolbarButton({
      iconClassName: HEROKU_PUSH_CLASS,
      onClick: async () => {
        console.log("get logs");
        const logs = await heroku.logs();
        console.log(logs);
      },
      tooltip: "Deploy To Heroku"
    });

    this.toolbar.addItem("deploy", deployButton);

    let layout = new PanelLayout();
    layout.addWidget(this.toolbar);

    this.layout = layout;
  }

  readonly toolbar: Toolbar<Widget>;
}
