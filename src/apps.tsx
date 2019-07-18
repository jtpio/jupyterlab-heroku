import { ToolbarButtonComponent } from "@jupyterlab/apputils";

import * as React from "react";

import { Heroku, IHerokuApp, IHerokuApps } from "./heroku";

const HEROKU_HEADER_CLASS = "jp-Heroku-header";
const HEROKU_APP_LIST_CLASS = "jp-HerokuApp-sectionList";
const HEROKU_APP_ITEM_CLASS = "jp-HerokuApp-item";
const HEROKU_APP_ITEM_ICON_CLASS = "jp-HerokuApp-itemIcon";
const HEROKU_APP_ITEM_SUCCESS_CLASS = "jp-HerokuApp-itemSuccess";
const HEROKU_APP_ITEM_ERROR_CLASS = "jp-HerokuApp-itemError";
const HEROKU_APP_ITEM_LABEL_CLASS = "jp-HerokuApp-itemLabel";
const HEROKU_APP_DEPLOY_ICON_CLASS = "jp-FileUploadIcon";
const HEROKU_APP_OPEN_ICON_CLASS = "jp-RefreshIcon";

interface IHerokuAppsProps {
  heroku: Heroku;
  runInTerminal: (cmd: string) => void;
}

interface IHerokuAppListProps {
  deploy: Function;
  logs: (app: string) => void;
  apps: IHerokuApps;
}

interface IHerokuAppProps {
  deploy: Function;
  logs: (app: string) => void;
  app: IHerokuApp;
}

interface IHerokuAppState {
  deploying: boolean;
  error: boolean;
}

interface IHerokuAppsState {
  apps: IHerokuApps;
}

class Item extends React.Component<IHerokuAppProps, IHerokuAppState> {
  constructor(props: IHerokuAppProps) {
    super(props);
    this.state = {
      deploying: false,
      error: false
    };
  }

  logs = async () => {
    this.props.logs(this.props.app.name);
  };

  deploy = async () => {
    this.setState({ deploying: true });
    const success = await this.props.deploy();
    this.setState({ deploying: false, error: !success });
  };

  render() {
    return (
      <li className={HEROKU_APP_ITEM_CLASS}>
        <span
          className={`${HEROKU_APP_ITEM_ICON_CLASS} ${
            this.state.error
              ? HEROKU_APP_ITEM_ERROR_CLASS
              : HEROKU_APP_ITEM_SUCCESS_CLASS
          }`}
        >
          {this.state.deploying ? (
            <i
              title="Deploying"
              className="fa fa-refresh fa-spin fa-lg fa-fw"
            ></i>
          ) : (
            [
              this.state.error && (
                <i
                  key="error"
                  title="Error"
                  className="fa fa-exclamation-circle fa-lg fa-fw"
                ></i>
              ),
              !this.state.error && (
                <i
                  key="success"
                  title="Deployed"
                  className="fa fa-check-square fa-lg fa-fw"
                ></i>
              )
            ]
          )}
        </span>
        <span
          className={HEROKU_APP_ITEM_LABEL_CLASS}
          title={this.props.app.name}
        >
          {this.props.app.name}
        </span>
        <ToolbarButtonComponent
          tooltip="Show Logs"
          iconClassName="jp-TextEditorIcon"
          onClick={this.logs}
        />
        <ToolbarButtonComponent
          tooltip="Open App"
          iconClassName="jp-LauncherIcon"
          onClick={() => {
            window.open(this.props.app.web_url);
          }}
        />
        <ToolbarButtonComponent
          tooltip="Deploy App"
          iconClassName={HEROKU_APP_DEPLOY_ICON_CLASS}
          enabled={!this.state.deploying}
          onClick={this.deploy}
        />
      </li>
    );
  }
}

function ListView(props: IHerokuAppListProps) {
  const { apps, ...rest } = props;
  return (
    <ul className={HEROKU_APP_LIST_CLASS}>
      {apps.map((props, i) => (
        <Item key={i} app={props} {...rest} />
      ))}
    </ul>
  );
}

export class HerokuAppsComponent extends React.Component<
  IHerokuAppsProps,
  IHerokuAppsState
> {
  constructor(props: IHerokuAppsProps) {
    super(props);
    this.state = {
      apps: []
    };
    this.props.heroku.pathChanged.connect(this.refreshApps, this);
  }

  viewAppLogs = async (app: string) => {
    const path = this.props.heroku.currentPath;
    const cmd = `cd ${path} && heroku logs -t -a ${app}`;
    await this.props.runInTerminal(cmd);
  };

  componentDidMount = () => {
    this.refreshApps();
  };

  componentWillUnmount = () => {
    this.props.heroku.pathChanged.disconnect(this.refreshApps, this);
  };

  refreshApps = async () => {
    this.setState({ apps: [] });
    const apps = await this.props.heroku.apps();
    this.setState({ apps });
  };

  deploy = async () => {
    const response = await this.props.heroku.deploy();
    if (response.message) {
      console.error(response.message);
      return false;
    }
    return true;
  };

  render() {
    return (
      <>
        <div className={HEROKU_HEADER_CLASS}>
          <h2>Heroku apps</h2>
          <ToolbarButtonComponent
            tooltip="Refresh Apps"
            iconClassName={HEROKU_APP_OPEN_ICON_CLASS}
            onClick={this.refreshApps}
          />
        </div>
        <ListView
          deploy={this.deploy}
          logs={this.viewAppLogs}
          apps={...this.state.apps}
        />
      </>
    );
  }
}
