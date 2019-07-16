import { HTMLSelect } from "@jupyterlab/ui-components";

import * as React from "react";

import { Heroku } from "./heroku";

const HEROKU_HEADER_CLASS = "jp-HerokuApp-header";
const HEROKU_SETTINGS_ICON_CLASS = "jp-SettingsIcon";
const HEROKU_SETTINGS_ITEM_CLASS = "jp-HerokuSettings-item";
const HEROKU_SETTINGS_SELECT_CLASS = "jp-HerokuSettings-dropdown";
const HEROKU_SETTINGS_ITEM_LABEL_CLASS = "jp-HerokuSettings-itemLabel";
const RUNTIMES = ["python-3.7.3", "python-3.6.8"];

interface IHerokuSettingsProps {
  heroku: Heroku;
}

interface IHerokuSettingsState {
  enabled: boolean;
  runtime: string;
}

interface IHerokuSettingsRuntimeProps {
  setRuntime: (runtime: string) => void;
  runtime?: string;
}

interface IHerokuSettingsRuntimeState {
  runtime: string;
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
        <div className={HEROKU_SETTINGS_ITEM_LABEL_CLASS} title="Runtime">
          Runtime:
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

export class HerokuSettingsComponent extends React.Component<
  IHerokuSettingsProps,
  IHerokuSettingsState
> {
  constructor(props: IHerokuSettingsProps) {
    super(props);
    this.state = {
      enabled: false,
      runtime: ""
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
    const { runtime } = settings;
    this.setState({
      enabled: true,
      runtime
    });
  };

  setRuntime = (runtime: string) => {
    this.props.heroku.setSettings({ runtime });
  };

  render() {
    return (
      <>
        <div className={HEROKU_HEADER_CLASS}>
          <span className={HEROKU_SETTINGS_ICON_CLASS} />
          <h2>Settings</h2>
        </div>
        {this.state.enabled && (
          <div className={HEROKU_SETTINGS_ITEM_CLASS}>
            <HerokuSettingsRuntimeComponent
              runtime={this.state.runtime}
              setRuntime={this.setRuntime}
            />
          </div>
        )}
      </>
    );
  }
}
