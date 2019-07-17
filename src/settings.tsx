import { Debouncer } from "@jupyterlab/coreutils";

import { HTMLSelect } from "@jupyterlab/ui-components";

import { TextArea } from "@blueprintjs/core/lib/cjs/components/forms/textArea";

import * as React from "react";

import { Heroku } from "./heroku";

const HEROKU_HEADER_CLASS = "jp-Heroku-header";
const HEROKU_SETTINGS_TITLE_CLASS = "jp-HerokuSettings-title";
const HEROKU_SETTINGS_LIST_CLASS = "jp-HerokuSettings-sectionList";
const HEROKU_SETTINGS_SELECT_CLASS = "jp-HerokuSettings-dropdown";
const HEROKU_SETTINGS_TEXTAREA_CLASS = "jp-HerokuSettings-textarea";
const RUNTIMES = ["python-3.7.3", "python-3.6.8"];

interface IHerokuSettingsProps {
  heroku: Heroku;
}

interface IHerokuSettingsState {
  enabled: boolean;
  runtime: string;
  dependencies: string;
}

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

class HerokuSettingsRuntimeComponent extends React.Component<
  IHerokuSettingsRuntimeProps,
  IHerokuSettingsRuntimeState
> {
  constructor(props: IHerokuSettingsRuntimeProps) {
    super(props);
    this.state = {
      runtime: props.runtime || RUNTIMES[0]
    };
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
    }, 2000);
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
    this.state = {
      enabled: false,
      runtime: "",
      dependencies: ""
    };
    this.props.heroku.pathChanged.connect(this.getSettings, this);
  }

  componentDidMount = () => {
    this.getSettings();
  };

  componentWillUnmount = () => {
    this.props.heroku.pathChanged.disconnect(this.getSettings, this);
  };

  getSettings = async () => {
    this.setState({ enabled: false });
    const settings = await this.props.heroku.settings();
    if (!settings) {
      return this.setState({
        enabled: false
      });
    }
    const { runtime, dependencies } = settings;
    this.setState({
      enabled: true,
      runtime,
      dependencies
    });
  };

  setRuntime = (runtime: string) => {
    this.props.heroku.setSettings({ runtime });
  };

  setDependencies = (dependencies: string) => {
    this.props.heroku.setSettings({ dependencies });
  };

  render() {
    return (
      <>
        <div className={HEROKU_HEADER_CLASS}>
          <h2>Settings</h2>
        </div>
        {this.state.enabled && (
          <div className={HEROKU_SETTINGS_LIST_CLASS}>
            <HerokuSettingsRuntimeComponent
              runtime={this.state.runtime}
              setRuntime={this.setRuntime}
            />
            <HerokuSettingsDependenciesComponent
              dependencies={this.state.dependencies}
              setDependencies={this.setDependencies}
            />
          </div>
        )}
      </>
    );
  }
}
