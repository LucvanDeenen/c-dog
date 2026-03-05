/**
 * A folder which may contain files and nested folders. Includes Storable
 * metadata plus arrays of files and folders.
 */
export interface Folder extends Storable {
  files: File[];
  folders: Folder[];
}

/**
 * A file stored by the application. Extends the minimal Storable metadata
 * with the file's textual content.
 */
export interface File extends Storable {
  content: string;
}
/**
 * Generic interface for filesystem-storable objects. Contains the
 * minimal fields required to identify and locate the resource.
 */
interface Storable {
  path: string;
  name: string;
}
