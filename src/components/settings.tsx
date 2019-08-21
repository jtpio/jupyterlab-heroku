import { ToolbarButtonComponent } from "@jupyterlab/apputils";

import { Debouncer } from "@jupyterlab/coreutils";

import { HTMLSelect, InputGroup } from "@jupyterlab/ui-components";

import { TextArea } from "@blueprintjs/core/lib/cjs/components/forms/textArea";

import * as React from "react";

import { Heroku, IHerokuSettings } from "../heroku";

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

interface IHerokuSettingsProps {
  heroku: Heroku;
  enabled: boolean;
  settings: IHerokuSettings;
  refreshSettings: () => void;
}

interface IHerokuSettingsState {}

interface IHerokuSettingsRuntimeProps {
  setRuntime: (runtime: string) => void;
  runtime?: string;
}

interface IHerokuSettingsRuntimeState {
  runtime: string;
}

interface IHerokuSettingsDependenciesProps {
  setDependencies: (dependencies: string) => void;
  dependencies?: string;
}

interface IHerokuSettingsDependenciesState {
  dependencies: string;
}

interface IHerokuSettingsProcfileProps {
  setProcfile: (procfile: string) => void;
  procfile?: string;
}

interface IHerokuSettingsProcfileState {
  procfile: string;
}

class HerokuSettingsProcfileComponent extends React.Component<
  IHerokuSettingsProcfileProps,
  IHerokuSettingsProcfileState
> {
  constructor(props: IHerokuSettingsProcfileProps) {
    super(props);
    this._debouncer = new Debouncer(() => {
      this.props.setProcfile(this.state.procfile);
    }, SETTINGS_UPDATE_LIMIT);
    this.state = {
      procfile: props.procfile || DEFAULT_PROCFILE
    };
    if (!props.procfile) {
      this._debouncer.invoke();
    }
  }

  componentWillUnmount = () => {
    this._debouncer.dispose();
  };

  handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const procfile = event.currentTarget.value;
    this.setState({
      procfile
    });
    this._debouncer.invoke();
  };

  render() {
    return (
      <>
        <div className={HEROKU_SETTINGS_TITLE_CLASS} title="Procfile">
          <h4>Procfile</h4>
        </div>
        <InputGroup
          className={HEROKU_SETTINGS_INPUT_CLASS}
          onChange={this.handleChange}
          placeholder="Command to execute"
          value={this.state.procfile}
          aria-label="Procfile"
        />
      </>
    );
  }

  private _debouncer: Debouncer;
}

class HerokuSettingsRuntimeComponent extends React.Component<
  IHerokuSettingsRuntimeProps,
  IHerokuSettingsRuntimeState
> {
  constructor(props: IHerokuSettingsRuntimeProps) {
    super(props);
    this.state = {
      runtime: props.runtime || RUNTIMES[0]
    };
    if (!props.runtime) {
      this.props.setRuntime(this.state.runtime);
    }
  }

  handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const runtime = event.currentTarget.value;
    this.setState({
      runtime
    });
    this.props.setRuntime(runtime);
  };

  render() {
    return (
      <>
        <div className={HEROKU_SETTINGS_TITLE_CLASS} title="Runtime">
          <h4>Runtime</h4>
        </div>
        <HTMLSelect
          className={HEROKU_SETTINGS_SELECT_CLASS}
          onChange={this.handleChange}
          value={this.state.runtime}
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
  }
}

class HerokuSettingsDependenciesComponent extends React.Component<
  IHerokuSettingsDependenciesProps,
  IHerokuSettingsDependenciesState
> {
  constructor(props: IHerokuSettingsDependenciesProps) {
    super(props);
    this.state = {
      dependencies: props.dependencies
    };
    this._debouncer = new Debouncer(() => {
      this.props.setDependencies(this.state.dependencies);
    }, SETTINGS_UPDATE_LIMIT);
  }

  componentWillUnmount = () => {
    this._debouncer.dispose();
  };

  handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const dependencies = event.currentTarget.value;
    this.setState({
      dependencies
    });
    this._debouncer.invoke();
  };

  render() {
    return (
      <>
        <div className={HEROKU_SETTINGS_TITLE_CLASS} title="Dependencies">
          <h4>Dependencies</h4>
        </div>
        <TextArea
          className={`${HEROKU_SETTINGS_TEXTAREA_CLASS}`}
          value={this.state.dependencies}
          onChange={this.handleChange}
          aria-label="Dependencies"
        />
      </>
    );
  }

  private _debouncer: Debouncer;
}

export class HerokuSettingsComponent extends React.Component<
  IHerokuSettingsProps,
  IHerokuSettingsState
> {
  constructor(props: IHerokuSettingsProps) {
    super(props);
  }

  setProcfile = (procfile: string) => {
    this.props.heroku.updateSettings({ procfile });
  };

  setRuntime = (runtime: string) => {
    this.props.heroku.updateSettings({ runtime });
  };

  setDependencies = (dependencies: string) => {
    this.props.heroku.updateSettings({ dependencies });
  };

  render() {
    const { procfile, runtime, dependencies } = this.props.settings;
    return (
      <>
        <div className={HEROKU_HEADER_CLASS}>
          <h2>Settings</h2>
          <ToolbarButtonComponent
            tooltip="Refresh Settings"
            iconClassName={HEROKU_SETTINGS_REFRESH_ICON_CLASS}
            onClick={this.props.refreshSettings}
          />
        </div>
        {this.props.enabled && (
          <div className={HEROKU_SETTINGS_LIST_CLASS}>
            <HerokuSettingsProcfileComponent
              procfile={procfile}
              setProcfile={this.setProcfile}
            />
            <HerokuSettingsRuntimeComponent
              runtime={runtime}
              setRuntime={this.setRuntime}
            />
            <HerokuSettingsDependenciesComponent
              dependencies={dependencies}
              setDependencies={this.setDependencies}
            />
          </div>
        )}
      </>
    );
  }
}
