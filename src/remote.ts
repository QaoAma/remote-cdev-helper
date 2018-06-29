import * as ssh2 from 'ssh2';
import {ssh2Ops} from './sshops';
import {fileInfo} from './fileops';

export class remote
{
    private ssh:ssh2Ops;
    constructor(config:ssh2.ConnectConfig)
    {
        this.ssh = new ssh2Ops(config);
    }
    private deal_per_file(data:string, parent_dir:string, result:fileInfo[])
    {
      var reg = /^([a-z\-])[\S]+[\s]+[\S]+[\s]+[\S]+[\s]+[\S]+[\s]+[\S]+[\s]+(\S+)[\s]+(\S+)[\s]+[\S]+[\s]+(\S+)$/
      var words = data.match(reg);
      if(words)
      {
        if(words[1] !== 'd')
        {
          result.push({
            name : parent_dir+'/'+words[4],
            time : Date.parse(words[2]+" "+words[3])
          });
        }
      }
    }
    
    private deal_per_dir_files(data:string, result:fileInfo[])
    {
      var lines = data.split("\n");
      var parent_dir = lines[0].slice(0,-1);
      for(var i = 2, len = lines.length; i < len; i++)
      {
        this.deal_per_file(lines[i], parent_dir, result);
      }
    }
    
    private deal_ls_result(data:string)
    {
        var files = data.toString().split("\n\n");
        var result = new Array<fileInfo>();
        for(var i = 0, len = files.length; i < len; i++)
        {
            this.deal_per_dir_files(files[i], result);
        }
        return result;
    }
    
    public async get_file_infos(path:string)
    {
        let str = await this.ssh.runCmd("ls -R --full-time "+path);
        return this.deal_ls_result(str);
    }
    
    public async get_absolute_path(path:string)
    {
        return await this.ssh.get_absolute_path(path);
    }

    public async send_file(remote_path:string, local_path:string)
    {
        return await this.ssh.upload_files(local_path, remote_path);
    }

    public async delete_file(remote_path:string)
    {
        return await this.ssh.delete_remote_files(remote_path);
    }
};