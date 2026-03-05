import FileHandler from "@electron/actions/filesystem";

/**
 * Object used to initialize the actual services and handle IDE refs (electron-env.d.ts).
 * This does not infer an explicit ref to the `Contract` type due to overriding the refs.
 */
const services = {
  fs: new FileHandler(),
};
export default services;
