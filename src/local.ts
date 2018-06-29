import * as fs from 'fs';
import * as fs_path from 'path';
import {fileInfo} from './fileops';

function read_dir_files(path:string, result:fileInfo[]):void
{
  var files = fs.readdirSync(path);
  files.forEach(function(filename)
  {
    var file_path = fs_path.join(path, filename);
    var stats = fs.statSync(file_path);
    if(stats.isDirectory())
    {
      read_dir_files(file_path, result);
    }
    else
    {
      result.push({name:file_path,time:Number(stats.mtime)});
    }
  });
}

export class local
{   
    public get_file_infos(path:string)
    {
      let result = new Array<fileInfo>();
      read_dir_files(path,result);
      return result;
    }

    public get_absolute_path(path:string)
    {
        let absPath:string = fs_path.resolve(path);
        return absPath;
    }
}