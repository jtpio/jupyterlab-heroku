import {
  ToolbarButtonComponent,
  ReactWidget,
  Dialog,
  showDialog
} from "@jupyterlab/apputils";

import React, { useState, useEffect } from "react";

import { IHeroku } from "../tokens";

const HEROKU_HEADER_CLASS = "jp-Heroku-header";
const HEROKU_APP_LIST_CLASS = "jp-HerokuApp-sectionList";
const HEROKU_APP_ITEM_CLASS = "jp-HerokuApp-item";
const HEROKU_APP_ITEM_ICON_CLASS = "jp-HerokuApp-itemIcon";
const HEROKU_APP_ITEM_SUCCESS_CLASS = "jp-HerokuApp-itemSuccess";
const HEROKU_APP_ITEM_ERROR_CLASS = "jp-HerokuApp-itemError";
const HEROKU_APP_ITEM_LABEL_CLASS = "jp-HerokuApp-itemLabel";
const HEROKU_APP_DEPLOY_ICON_CLASS = "jp-FileUploadIcon";
const HEROKU_APP_CREATE_ICON_CLASS = "jp-AddIcon";
const HEROKU_APP_REFRESH_ICON_CLASS = "jp-RefreshIcon";

const App = ({ model, app }: { model: IHeroku.IModel; app: IHeroku.IApp }) => {
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState(false);

  const logs = async () => {
    await model.logs(app.name);
  };

  const deploy = async () => {
    setError(false);
    setDeploying(true);
    try {
      await model.deploy();
    } catch (err) {
      setError(true);
    }
    setDeploying(false);
  };

  const destroy = async () => {
    let destroyButton = Dialog.warnButton({ label: "Destroy" });
    const result = await showDialog({
      title: "Destroy App?",
      body: `Do you really want to destroy the app ${app.name}? This cannot be undone`,
      buttons: [Dialog.cancelButton(), destroyButton]
    });
    if (result.button.accept) {
      await model.destroy(app.name);
      model.refreshApps();
    }
  };

  return (
    <li className={HEROKU_APP_ITEM_CLASS}>
      <span
        className={`${HEROKU_APP_ITEM_ICON_CLASS} ${
          error ? HEROKU_APP_ITEM_ERROR_CLASS : HEROKU_APP_ITEM_SUCCESS_CLASS
        }`}
      >
        {deploying ? (
          <i
            title="Deploying"
            className="fa fa-refresh fa-spin fa-lg fa-fw"
          ></i>
        ) : (
          [
            error && (
              <i
                key="error"
                title="Error"
                className="fa fa-exclamation-circle fa-lg fa-fw"
              ></i>
            ),
            !error && (
              <i
                key="success"
                title="Deployed"
                className="fa fa-check-square fa-lg fa-fw"
              ></i>
            )
          ]
        )}
      </span>
      <span className={HEROKU_APP_ITEM_LABEL_CLASS} title={app.name}>
        {app.name}
      </span>
      <ToolbarButtonComponent
        tooltip="Destroy App"
        iconClassName="jp-CloseIcon"
        onClick={destroy}
      />
      <ToolbarButtonComponent
        tooltip="Show Logs"
        iconClassName="jp-TextEditorIcon"
        onClick={logs}
      />
      <ToolbarButtonComponent
        tooltip="Open App"
        iconClassName="jp-LauncherIcon"
        onClick={() => {
          window.open(app.web_url);
        }}
      />
      <ToolbarButtonComponent
        tooltip="Deploy App"
        iconClassName={HEROKU_APP_DEPLOY_ICON_CLASS}
        enabled={!deploying}
        onClick={deploy}
      />
    </li>
  );
};

const AppList = ({
  model,
  apps
}: {
  model: IHeroku.IModel;
  apps: IHeroku.IApp[];
}) => {
  return (
    <ul className={HEROKU_APP_LIST_CLASS}>
      {apps.map((props, i) => (
        <App key={i} model={model} app={props} />
      ))}
    </ul>
  );
};

const AppsComponent = ({ model }: { model: IHeroku.IModel }) => {
  const [creating, setCreating] = useState(false);
  const [apps, setApps] = useState([]);

  const showErrorDialog = () => {
    let title = <span className="">Not a Git Repository</span>;
    let body = (
      <>
        <p>
          The current folder does not appear to be a Git repository. Heroku uses
          Git to manage and create applications.
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
  };

  const create = async () => {
    setCreating(true);
    try {
      await model.createApp();
    } catch (err) {
      await showErrorDialog();
    }
    setCreating(false);
  };

  const refresh = async () => {
    setApps([]);
    await model.refreshApps();
    setApps(model.apps);
  };

  useEffect(() => {
    model.pathChanged.connect(refresh);
    model.appsUpdated.connect(refresh);

    return () => {
      model.appsUpdated.disconnect(refresh);
      model.pathChanged.disconnect(refresh);
    };
  }, []);

  return (
    <>
      <div className={HEROKU_HEADER_CLASS}>
        <h2>Heroku apps</h2>
        <ToolbarButtonComponent
          enabled={!creating}
          tooltip="Create New App"
          iconClassName={HEROKU_APP_CREATE_ICON_CLASS}
          onClick={create}
        />
        <ToolbarButtonComponent
          tooltip="Refresh Apps"
          iconClassName={HEROKU_APP_REFRESH_ICON_CLASS}
          onClick={refresh}
        />
      </div>
      <AppList model={model} apps={apps} />
    </>
  );
};

export class Apps extends ReactWidget {
  constructor(options: Apps.IOptions) {
    super();
    this._model = options.model;
  }

  render() {
    return <AppsComponent model={this._model} />;
  }

  private _model: IHeroku.IModel;
}

export namespace Apps {
  export interface IOptions {
    model: IHeroku.IModel;
  }
}
