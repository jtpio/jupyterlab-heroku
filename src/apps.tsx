import { ToolbarButtonComponent } from "@jupyterlab/apputils";

import * as React from "react";

import { Heroku, IHerokuApp, IHerokuApps } from "./heroku";

const HEROKU_HEADER_CLASS = "jp-HerokuApp-header";
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
}

interface IHerokuAppListProps {
  deploy: Function;
  apps: IHerokuApps;
}

interface IHerokuAppProps {
  deploy: Function;
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
  const { apps, deploy } = props;
  return (
    <ul className={HEROKU_APP_LIST_CLASS}>
      {apps.map((props, i) => (
        <Item key={i} deploy={deploy} app={props} />
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
        <ListView deploy={this.deploy} apps={...this.state.apps} />
      </>
    );
  }
}
