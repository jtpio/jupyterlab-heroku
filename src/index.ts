import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";

import { IFileBrowserFactory } from "@jupyterlab/filebrowser";

import { addCommands } from "./commands";
import { HerokuWidget } from "./widget";
import { Heroku } from "./heroku";

import "../style/index.css";

const EXTENSION_ID = "jupyterlab-heroku";

/**
 * Initialization data for the jupyterlab-heroku extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: EXTENSION_ID,
  autoStart: true,
  requires: [IFileBrowserFactory],
  activate: (app: JupyterFrontEnd, fileBrowserFactory: IFileBrowserFactory) => {
    addCommands(app);
    let heroku = new Heroku(fileBrowserFactory);
    let widget = new HerokuWidget(heroku);
    widget.id = "jp-heroku";
    widget.title.iconClass = "jp-SideBar-tabIcon jp-HerokuIcon";
    widget.title.caption = "Heroku";
    app.shell.add(widget, "left");
  }
};

export default extension;
