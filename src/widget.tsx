import { ToolbarButton, Toolbar } from "@jupyterlab/apputils";

import { Widget, PanelLayout } from "@phosphor/widgets";

const HEROKU_WIDGET_CLASS = "jp-Heroku";
const HEROKU_PUSH_CLASS = "jp-FileUploadIcon";

export class HerokuWidget extends Widget {
  constructor() {
    super();
    this.addClass(HEROKU_WIDGET_CLASS);

    this.toolbar = new Toolbar<Widget>();

    let deployButton = new ToolbarButton({
      iconClassName: HEROKU_PUSH_CLASS,
      onClick: () => {
        console.log("DEPLOY");
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
