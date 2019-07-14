import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";

import { addCommands } from "./commands";

import { HerokuWidget } from "./widget";

import "../style/index.css";
import { Heroku } from "./heroku";

const EXTENSION_ID = "jupyterlab-heroku";

/**
 * Initialization data for the jupyterlab-heroku extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: EXTENSION_ID,
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    addCommands(app);

    let heroku = new Heroku();
    let widget = new HerokuWidget(heroku);
    widget.id = "jp-heroku";
    widget.title.iconClass = "jp-SideBar-tabIcon jp-HerokuIcon";
    widget.title.caption = "Heroku";
    app.shell.add(widget, "left");
  }
};

export default extension;
