import * as React from "react";

import { Heroku } from "../heroku";
import { HerokuAppsComponent } from "./apps";
import { HerokuSettingsComponent } from "./settings";

interface IHerokuProps {
  heroku: Heroku;
  runInTerminal: (cmd: string) => void;
}

interface IHerokuState {}

export class HerokuComponent extends React.Component<
  IHerokuProps,
  IHerokuState
> {
  constructor(props: IHerokuProps) {
    super(props);
  }

  render() {
    const { heroku, runInTerminal } = this.props;
    return (
      <>
        <HerokuAppsComponent heroku={heroku} runInTerminal={runInTerminal} />
        <HerokuSettingsComponent heroku={heroku} />
      </>
    );
  }
}
