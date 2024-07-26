export class CanceledError extends Error {
    constructor() {
      super();
      this.name = "CanceledError";
      this.message = "Task was canceled";
    }
  }

export class PrinterTaskCancellationToken {
    constructor(private checkIsCanceled: () => boolean) {
    }

    private isCanceled(): boolean {
        return this.checkIsCanceled();
    }

    throwIfCanceled(): void {
        if (this.isCanceled()) {
            throw new CanceledError();
        }
    }
}
