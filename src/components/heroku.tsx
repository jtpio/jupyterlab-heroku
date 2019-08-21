import { showDialog, Dialog } from "@jupyterlab/apputils";

import * as React from "react";

import { Heroku, IHerokuApps, IHerokuSettings } from "../heroku";
import { HerokuAppsComponent } from "./apps";
import { HerokuSettingsComponent } from "./settings";

interface IHerokuProps {
  heroku: Heroku;
  runInTerminal: (cmd: string) => void;
}

interface IHerokuState {
  apps: IHerokuApps;
  settings: IHerokuSettings;
  enabled: boolean;
}

export class HerokuComponent extends React.Component<
  IHerokuProps,
  IHerokuState
> {
  constructor(props: IHerokuProps) {
    super(props);
    this.state = {
      apps: [],
      settings: {},
      enabled: false
    };
  }

  componentDidMount = () => {
    this.props.heroku.pathChanged.connect(this.refresh, this);
  };

  componentWillUnmount = () => {
    this.props.heroku.pathChanged.disconnect(this.refresh, this);
  };

  refresh = async () => {
    await this.refreshApps();
    await this.refreshSettings();
  };

  refreshApps = async () => {
    this.setState({ apps: [] });
    const apps = await this.props.heroku.apps();
    this.setState({ apps });
  };

  refreshSettings = async () => {
    this.setState({ enabled: false });
    const settings = await this.props.heroku.settings();
    if (!settings) {
      this.setState({
        enabled: false
      });
      return;
    }
    this.setState({
      enabled: true,
      settings
    });
  };

  createApp = async () => {
    const response = await this.props.heroku.create();

    if (response.message) {
      let title = <span className="">Not a Git Repository</span>;
      let body = (
        <>
          <p>
            The current folder does not appear to be a Git repository. Heroku
            uses Git to manage and create applications.
          </p>
          <p>
            From the command line with `git init` or using the Git Extension for
            JupyterLab.
          </p>
        </>
      );
      return showDialog({
        title,
        body,
        buttons: [
          Dialog.createButton({
            label: "Dismiss",
            className: "jp-About-button jp-mod-reject jp-mod-styled"
          })
        ]
      });
    }

    this.refresh();
  };

  destroyApp = async (app: string) => {
    let destroyButton = Dialog.warnButton({ label: "Destroy" });
    const result = await showDialog({
      title: "Destroy App?",
      body: `Do you really want to destroy the app ${app}? This cannot be undone`,
      buttons: [Dialog.cancelButton(), destroyButton]
    });
    if (result.button.accept) {
      await this.props.heroku.destroy(app);
      this.refresh();
    }
  };

  render() {
    const { heroku, runInTerminal } = this.props;
    return (
      <>
        <HerokuAppsComponent
          heroku={heroku}
          apps={this.state.apps}
          createApp={this.createApp}
          destroyApp={this.destroyApp}
          refreshApps={this.refreshApps}
          runInTerminal={runInTerminal}
        />
        <HerokuSettingsComponent
          heroku={heroku}
          refreshSettings={this.refreshSettings}
          enabled={this.state.enabled}
          settings={this.state.settings}
        />
      </>
    );
  }
}
