import * as React from "react";

import { Heroku } from "./heroku";

const HEROKU_HEADER_CLASS = "jp-HerokuApp-header";
const HEROKU_SETTINGS_ICON_CLASS = "jp-SettingsIcon";

interface IHerokuSettingsProps {
  heroku: Heroku;
}

interface IHerokuSettingsState {}

export class HerokuSettingsComponent extends React.Component<
  IHerokuSettingsProps,
  IHerokuSettingsState
> {
  constructor(props: IHerokuSettingsProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <>
        <div className={HEROKU_HEADER_CLASS}>
          <span className={HEROKU_SETTINGS_ICON_CLASS} />
          <h2>Settings</h2>
        </div>
      </>
    );
  }
}
