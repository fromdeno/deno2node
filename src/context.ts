import path from "node:path";
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
}
