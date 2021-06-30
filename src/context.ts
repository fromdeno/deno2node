import { path, Project, ts, z } from "./deps.deno.ts";

const compilerOptions: ts.CompilerOptions = {
  strict: true,
  useDefineForClassFields: true,
};

const Config = z.strictObject({
  shim: z.string().optional(),
});

interface Options {
  readonly tsConfigFilePath?: string;
  readonly compilerOptions?: ts.CompilerOptions;
}

export class Context {
  public baseDir: string;
  readonly project: Project;
  readonly config: z.infer<typeof Config>;

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
    this.config = Config.parse(result.config.deno2node ?? {});
  }

  resolve(path_: string) {
    return path.join(this.baseDir, path_);
  }
}
