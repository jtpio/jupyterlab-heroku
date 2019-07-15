import {
  Toolbar,
  ToolbarButtonComponent,
  ReactWidget
} from "@jupyterlab/apputils";

import { Widget, PanelLayout } from "@phosphor/widgets";

import { Heroku, IHerokuApp, IHerokuApps } from "./heroku";

import * as React from "react";

const HEROKU_ICON_CLASS = "jp-HerokuIcon";
const HEROKU_HEADER_CLASS = "jp-HerokuApp-header";
const HEROKU_APP_LIST_CLASS = "jp-HerokuApp-sectionList";
const HEROKU_APP_ITEM_CLASS = "jp-HerokuApp-item";
const HEROKU_APP_ITEM_ICON_CLASS = "jp-HerokuApp-itemIcon";
const HEROKU_APP_ITEM_STATUS_CLASS = "jp-HerokuApp-itemStatus";
const HEROKU_APP_ITEM_LABEL_CLASS = "jp-HerokuApp-itemLabel";
const HEROKU_APP_DEPLOY_ICON_CLASS = "jp-FileUploadIcon";
const HEROKU_APP_OPEN_ICON_CLASS = "jp-RefreshIcon";

const HEROKU_WIDGET_CLASS = "jp-Heroku";

interface IHerokuAppListProps {
  apps: IHerokuApps;
}

function Item(props: IHerokuApp) {
  return (
    <li className={HEROKU_APP_ITEM_CLASS}>
      <span
        className={`${HEROKU_APP_ITEM_ICON_CLASS} ${HEROKU_APP_ITEM_STATUS_CLASS}`}
      />
      <span className={HEROKU_APP_ITEM_LABEL_CLASS} title={props.name}>
        {props.name}
      </span>
      <ToolbarButtonComponent
        tooltip="Open App"
        iconClassName="jp-LauncherIcon"
        onClick={() => {
          window.open(props.web_url);
        }}
      />
      <ToolbarButtonComponent
        tooltip="Deploy App"
        iconClassName={HEROKU_APP_DEPLOY_ICON_CLASS}
        onClick={() => {
          console.log("DEPLOY");
        }}
      />
    </li>
  );
}

function ListView(props: IHerokuAppListProps) {
  const { apps } = props;
  return (
    <ul className={HEROKU_APP_LIST_CLASS}>
      {apps.map((props, i) => (
        <Item key={i} {...props} />
      ))}
    </ul>
  );
}

interface IHerokuAppsProps {
  heroku: Heroku;
}

interface IHerokuAppsState {
  apps: IHerokuApps;
}

class HerokuAppsComponent extends React.Component<
  IHerokuAppsProps,
  IHerokuAppsState
> {
  constructor(props: IHerokuAppsProps) {
    super(props);
    this.state = {
      apps: []
    };
  }

  refreshApps = async () => {
    this.setState({ apps: [] });
    const apps = await this.props.heroku.apps();
    this.setState({ apps });
  };

  render() {
    return (
      <>
        <div className={HEROKU_HEADER_CLASS}>
          <span
            className={`${HEROKU_APP_ITEM_ICON_CLASS} ${HEROKU_ICON_CLASS}`}
          />
          <h2>Heroku apps</h2>
          <ToolbarButtonComponent
            tooltip="Refresh Apps"
            iconClassName={HEROKU_APP_OPEN_ICON_CLASS}
            onClick={this.refreshApps}
          />
        </div>
        <ListView apps={...this.state.apps} />
      </>
    );
  }
}

export class HerokuWidget extends Widget {
  constructor(heroku: Heroku) {
    super();
    this.addClass(HEROKU_WIDGET_CLASS);

    let apps = ReactWidget.create(<HerokuAppsComponent heroku={heroku} />);

    let layout = new PanelLayout();
    layout.addWidget(apps);

    this.layout = layout;
  }

  readonly toolbar: Toolbar<Widget>;
}
