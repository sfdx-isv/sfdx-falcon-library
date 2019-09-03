export default {};
/*
import {SfdxFalconTask} from '@sfdx-falcon/task';
import Listr = require('listr');

const fakeContext = {
  sharedData: {}
};

try {
  console.log('Hello111!!');
  console.log('Hello222!!');
  console.log('Hello333!!');


  const falconTask = new SfdxFalconTask({
    title:  'this is my test task',
    context: fakeContext,
    dbgNsExt: 'xxxxxxxx',
    statusMsg:  'My first message',
    minRuntime: 5,
    showTimer:  true,
    // @ts-ignore
    task: (listrContext, thisTask) => {
      console.log(`I'm inside the house!`);
      thisTask.title = 'I have totally changed the title!';
    }
  });

  console.log(`falconTask: %O`, falconTask);

  const listrTasks = new Listr(
    [
      falconTask.build(),
      {
        title: 'second task',
        // @ts-ignore
        task: (listrContext, thisTask) => {
          console.log(`This is from second task`);
        }
      }
    ],
    {
      concurrent:   false,
      // @ts-ignore
      collapse:     false,
      exitOnError:  true,
      renderer:     'verbose'
    }
  );

  console.log(`listrTasks: %O`, listrTasks);

  listrTasks.run()
  .then(async () => {
    console.log('Task succeeded');
  })
  .catch(async () => {
    console.log('Task failed');
  });

  const asyncTask = async () => {
    await listrTasks.run();
  };

  asyncTask()
  .then(async () => {
    console.log('Task succeeded');
  })
  .catch(async () => {
    console.log('Task failed');
  });


}
catch (error) {
  console.log(`Error! Details: %O`, error);
}
//*/