import * as path from "https://deno.land/std@0.178.0/path/mod.ts";
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
  readonly project: Project;
  readonly config: Config;

  /**
   * Synchronously loads `tsconfig.json` and `"files"`.
   */
  constructor(options: Options) {
    const { tsConfigFilePath } = options;
    this.project = new Project({
      compilerOptions,
      ...options,
    });
    if (tsConfigFilePath === undefined) {
      this.baseDir = Deno.cwd();
      this.config = {};
      return;
    }
    const fs = this.project.getFileSystem();
    const result = ts.readConfigFile(tsConfigFilePath, fs.readFileSync);
    this.baseDir = path.resolve(tsConfigFilePath, "../");
    this.config = parse(result.config.deno2node ?? {});
  }

  resolve(...pathSegments: string[]) {
    return path.join(this.baseDir, ...pathSegments);
  }
}
