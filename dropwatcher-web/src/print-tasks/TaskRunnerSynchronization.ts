import { PrintTaskRunner } from "./print-task-runner";


export class TaskRunnerSynchronization {
    private static instance: TaskRunnerSynchronization;
    private constructor() { }
    static getInstance() {
        if (!TaskRunnerSynchronization.instance) {
            TaskRunnerSynchronization.instance = new TaskRunnerSynchronization();
        }
        return TaskRunnerSynchronization.instance;
    }
    private taskRunners: PrintTaskRunner[] = [];

    startTaskRunner(taskRunner: PrintTaskRunner) {
        if (this.taskRunners.some(tr => !tr.isRunning())) {
            throw new Error("Cannot start task runner while another is running");
        } else {
            this.taskRunners.push(taskRunner);
            taskRunner.run().catch(console.error);
        }
    }

    cancelAll() {
        for (let taskRunner of this.taskRunners) {
            taskRunner.cancel();
        }
    }

}

if (module.hot) {
    module.hot.accept("./print-task-runner", () => {
        ;
        TaskRunnerSynchronization.getInstance().cancelAll();
    });
}
