import getHTML from './getHTML';
import FSM from './parser';

class Parse {
  constructor(props) {
    const { template, list = [] } = props;
    this.template = template;
  }

  getHTML(list) {
    const snapshot = FSM(this.template);
    console.log(snapshot);
    return getHTML(snapshot, list);
  }
}

export default Parse;
