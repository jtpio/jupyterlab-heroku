import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";

import { ICommandPalette } from "@jupyterlab/apputils";

import { IFileBrowserFactory } from "@jupyterlab/filebrowser";

import { Model } from "./model";

import { HerokuPanel } from "./panel";

import "../style/index.css";

const EXTENSION_ID = "jupyterlab-heroku";

export namespace CommandIDs {
  export const create = "heroku:create";
}

/**
 * Initialization data for the jupyterlab-heroku extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: EXTENSION_ID,
  autoStart: true,
  requires: [IFileBrowserFactory],
  optional: [ICommandPalette],
  activate: (
    app: JupyterFrontEnd,
    fileBrowserFactory: IFileBrowserFactory,
    palette: ICommandPalette
  ) => {
    const { commands } = app;

    const runInTerminal = async (cmd: string): Promise<void> => {
      const terminalWidget = await commands.execute("terminal:create-new");
      app.shell.add(terminalWidget, "main", { mode: "split-right" });

      const terminal = terminalWidget.content;
      try {
        terminal.session.send({
          type: "stdin",
          content: [cmd + "\n"]
        });
        return terminalWidget;
      } catch (e) {
        console.error(e);
        terminalWidget.dispose();
      }
    };

    const model = new Model({ fileBrowserFactory, runInTerminal });

    commands.addCommand(CommandIDs.create, {
      label: "Create New App",
      isEnabled: () => {
        return !!model.status && !!model.status.git;
      },
      execute: async () => {
        await model.createApp();
      }
    });

    if (palette) {
      const category = "Heroku";
      palette.addItem({ command: CommandIDs.create, category });
    }

    let widget = new HerokuPanel({ model });
    widget.id = "jp-heroku";
    widget.title.iconClass = "jp-SideBar-tabIcon jp-HerokuIcon";
    widget.title.caption = "Heroku";
    app.shell.add(widget, "left");
  }
};

export default extension;
