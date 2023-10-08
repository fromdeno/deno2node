import path from "node:path";
import {
  replaceSpecifiers,
  transpileSpecifier,
} from "./_transformations/specifiers.ts";
import { type Config, parse } from "./config.ts";
import { Project, ts } from "./deps.deno.ts";

const compilerOptions: ts.CompilerOptions = {
  removeComments: false,
  strict: true,
  useDefineForClassFields: true,
};

interface Options {
  readonly tsConfigFilePath?: string;
  readonly compilerOptions?: ts.CompilerOptions;
  readonly skipAddingFilesFromTsConfig?: boolean;
}

export class Context {
  public baseDir: string;
  public config: Config;
  readonly project: Project;
  private _runtime = "deno";

  /**
   * Synchronously loads `tsconfig.json` and `"files"`.
   */
  constructor(options: Options) {
    const { tsConfigFilePath } = options;
    this.project = new Project({
      compilerOptions,
      ...options,
    });
    const fs = this.project.getFileSystem();
    if (tsConfigFilePath === undefined) {
      this.baseDir = fs.getCurrentDirectory();
      this.config = {};
      return;
    }
    const result = ts.readConfigFile(tsConfigFilePath, fs.readFileSync);
    this.baseDir = path.resolve(tsConfigFilePath, "../");
    this.config = parse(result.config.deno2node ?? {});
  }

  resolve(...pathSegments: string[]) {
    return path.join(this.baseDir, ...pathSegments);
  }

  changeRuntimeTo(newRuntime: string) {
    const label = `Changing runtime from ${this._runtime} to ${newRuntime}`;
    const fn = transpileSpecifier(this._runtime, newRuntime);

    console.time(label);
    for (const sourceFile of this.project.getSourceFiles()) {
      if (sourceFile.getBaseName().includes(`.${this._runtime}.`)) {
        sourceFile.forget();
      } else {
        replaceSpecifiers(sourceFile, fn);
      }
    }
    this._runtime = newRuntime;
    console.timeEnd(label);
  }
}
