import { ToolbarButtonComponent, ReactWidget } from "@jupyterlab/apputils";

import { Debouncer } from "@jupyterlab/coreutils";

import { HTMLSelect, InputGroup } from "@jupyterlab/ui-components";

import { TextArea } from "@blueprintjs/core/lib/cjs/components/forms/textArea";

import React, { useState, useEffect } from "react";

import { IHeroku } from "../tokens";

const HEROKU_HEADER_CLASS = "jp-Heroku-header";
const HEROKU_SETTINGS_REFRESH_ICON_CLASS = "jp-RefreshIcon";
const HEROKU_SETTINGS_TITLE_CLASS = "jp-HerokuSettings-title";
const HEROKU_SETTINGS_LIST_CLASS = "jp-HerokuSettings-sectionList";
const HEROKU_SETTINGS_SELECT_CLASS = "jp-HerokuSettings-dropdown";
const HEROKU_SETTINGS_INPUT_CLASS = "jp-HerokuSettings-input";
const HEROKU_SETTINGS_TEXTAREA_CLASS = "jp-HerokuSettings-textarea";

const RUNTIMES = ["python-3.7.3", "python-3.6.8"];
const DEFAULT_PROCFILE = "web: voila --port=$PORT --no-browser";

// debounce settings updates
const SETTINGS_UPDATE_LIMIT = 2000;

const Procfile = (props: { model: IHeroku.IModel; procfile?: string }) => {
  const [procfile, setProcfile] = useState(DEFAULT_PROCFILE);

  const { model } = props;

  const debouncer = new Debouncer(() => {
    model.procfile = procfile;
  }, SETTINGS_UPDATE_LIMIT);

  useEffect(() => {
    setProcfile(props.procfile || DEFAULT_PROCFILE);
    debouncer.invoke();

    return () => {
      debouncer.dispose();
    };
  }, [props]);

  useEffect(() => {
    debouncer.invoke();
  }, [procfile]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.currentTarget.value;
    setProcfile(value);
  };

  return (
    <>
      <div className={HEROKU_SETTINGS_TITLE_CLASS} title="Procfile">
        <h4>Procfile</h4>
      </div>
      <InputGroup
        className={HEROKU_SETTINGS_INPUT_CLASS}
        onChange={handleChange}
        placeholder="Command to execute"
        value={procfile}
        aria-label="Procfile"
      />
    </>
  );
};

const Runtime = (props: { model: IHeroku.IModel; runtime: string }) => {
  const [runtime, setRuntime] = useState(RUNTIMES[0]);

  const { model } = props;

  useEffect(() => {
    setRuntime(props.runtime || RUNTIMES[0]);
  }, [props]);

  useEffect(() => {
    model.runtime = runtime;
  }, [runtime]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const runtime = event.currentTarget.value;
    setRuntime(runtime);
  };

  return (
    <>
      <div className={HEROKU_SETTINGS_TITLE_CLASS} title="Runtime">
        <h4>Runtime</h4>
      </div>
      <HTMLSelect
        className={HEROKU_SETTINGS_SELECT_CLASS}
        onChange={handleChange}
        value={runtime}
        iconProps={{
          icon: (
            <span className="jp-MaterialIcon jp-DownCaretIcon bp3-icon bp3-fill" />
          )
        }}
        aria-label="Runtime"
      >
        {RUNTIMES.map((runtime, i) => (
          <option key={i} value={runtime}>
            {runtime}
          </option>
        ))}
      </HTMLSelect>
    </>
  );
};

const Dependencies = (props: {
  model: IHeroku.IModel;
  dependencies: string;
}) => {
  const [dependencies, setDependencies] = useState("");

  const { model } = props;

  const debouncer = new Debouncer(() => {
    model.dependencies = dependencies;
  }, SETTINGS_UPDATE_LIMIT);

  useEffect(() => {
    setDependencies(props.dependencies || "");

    return () => {
      debouncer.dispose();
    };
  }, [props]);

  useEffect(() => {
    debouncer.invoke();
  }, [dependencies]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const dependencies = event.currentTarget.value;
    setDependencies(dependencies);
  };

  return (
    <>
      <div className={HEROKU_SETTINGS_TITLE_CLASS} title="Dependencies">
        <h4>Dependencies</h4>
      </div>
      <TextArea
        className={HEROKU_SETTINGS_TEXTAREA_CLASS}
        value={dependencies}
        onChange={handleChange}
        aria-label="Dependencies"
      />
    </>
  );
};

const SettingsList = (props: { model: IHeroku.IModel }) => {
  const { model } = props;
  const [enabled, setEnabled] = useState(false);
  const [settings, setSettings] = useState({} as IHeroku.ISettings);

  const refresh = async () => {
    const hasSettings = await model.refreshSettings();
    setEnabled(hasSettings);
    setSettings(model.settings);
  };

  useEffect(() => {
    refresh();

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
        <h2>Settings</h2>
        <ToolbarButtonComponent
          tooltip="Refresh Settings"
          iconClassName={HEROKU_SETTINGS_REFRESH_ICON_CLASS}
          onClick={refresh}
        />
      </div>
      {enabled && (
        <div className={HEROKU_SETTINGS_LIST_CLASS}>
          <Procfile procfile={settings.procfile} model={model} />
          <Runtime runtime={settings.runtime} model={model} />
          <Dependencies dependencies={settings.dependencies} model={model} />
        </div>
      )}
    </>
  );
};

export class Settings extends ReactWidget {
  constructor(options: Settings.IOptions) {
    super();
    this._model = options.model;
    void this._model.refreshSettings();
  }

  render() {
    return <SettingsList model={this._model} />;
  }

  private _model: IHeroku.IModel;
}

export namespace Settings {
  export interface IOptions {
    model: IHeroku.IModel;
  }
}
