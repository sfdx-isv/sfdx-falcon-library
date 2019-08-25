import {CodeCoverageResult} from '@sfdx-falcon/types';


export class Debug {
  public get() {
    const testVar:CodeCoverageResult = {};
    testVar.name = `Code Cov Name`;
    testVar.namespace = `Code Cov Namespace`;
    return JSON.stringify(testVar) + `---DEVTEST---`;
  }
}

const testDebug = new Debug();
console.log(testDebug.get());
