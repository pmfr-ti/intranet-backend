import * as fs from 'fs';

export class FileSystemUtils {

    public static remove(file:string): void {
        fs.unlink(file, (err) => {
            if (err) { console.log("failed to delete local image:" + err) }
        })
    }
}
